import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages, personas, knowledgeBase } from "@db/schema";
import { env } from "./lib/env";
import { HttpClient } from "./lib/http";

// 意图识别关键词映射表
const intentKeywords: Record<string, string[]> = {
  sleep: ["睡", "眠", "失眠", "睡不着", "熬夜", "打呼", "白噪音", "助眠", "睡前", "起床", "闹钟", "梦"],
  mental: ["焦虑", "抑郁", "压力", "情绪", "心情", "难过", "烦躁", "紧张", "心理", "内耗", "emo", "放松", "呼吸", "冥想"],
  skincare: ["肤", "痘痘", "油皮", "干皮", "敏感肌", "护肤", "保湿", "防晒", "美白", "毛孔", "黑头", "皱纹", "精华", "面霜", "卸妆"],
  fitness: ["健身", "运动", "减脂", "增肌", "塑形", "跑步", "瑜伽", "深蹲", "俯卧撑", "体重", "体脂", "体态", "驼背", "圆肩", "太极"],
  diet: ["吃", "食", "减肥餐", "养生", "体质", "湿气", "气虚", "阳虚", "食疗", "食谱", "喝茶", "忌口", "营养", "热量", "卡路里"],
  style: ["穿", "搭", "发型", "衣服", "化妆", "脸型", "身材", "显瘦", "显高", "颜色", "风格", "场合", "约会", "面试", "职场"],
  social: ["社交", "聊天", "拒绝", "情商", "送礼", "生日", "祝福", "人脉", "沟通", "矛盾", "冷场", "话术", "请客", "饭局"],
  finance: ["钱", "记账", "消费", "理财", "投资", "存款", "预算", "省钱", "信用卡", "账单", "开销", "月入", "支出"],
  career: ["工作", "求职", "简历", "面试", "跳槽", "升职", "加薪", "职业", "岗位", "技能", "转行", "副业", "离职", "加班"],
  chat: ["故事", "哲学", "历史", "书", "电影", "音乐", "新闻", "天气", "无聊", "陪聊", "闲聊", "八卦"],
  habit: ["习惯", "自律", "拖延", "打卡", "坚持", "戒烟", "戒手机", "早起", "早睡", "读书", "目标", "计划", "番茄钟"],
  health: ["健康", "体检", "病", "药", "血压", "血糖", "体重", "免疫力", "感冒", "发烧", "肠胃", "过敏", "疫苗"],
};

function detectIntent(userMessage: string): { category: string; confidence: number; keywords: string[] } {
  const message = userMessage.toLowerCase();
  let bestCategory = "chat";
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  for (const [category, keywords] of Object.entries(intentKeywords)) {
    const hits = keywords.filter(k => message.includes(k));
    const score = hits.length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
      matchedKeywords = hits;
    }
  }

  const confidence = bestScore > 0 ? Math.min(30 + bestScore * 20, 95) : 30;
  return { category: bestCategory, confidence, keywords: matchedKeywords };
}

const kimiClient = new HttpClient(env.kimiOpenUrl, {
  headers: {
    Authorization: `Bearer ${env.appSecret}`,
    "Content-Type": "application/json",
  },
});

export const chatRouter = createRouter({
  // Get recent messages for the user
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(desc(messages.createdAt))
      .limit(100);
    return rows.reverse();
  }),

  // Send a message and get AI response with knowledge retrieval
  send: authedQuery
    .input(
      z.object({
        content: z.string().min(1).max(2000),
        persona: z.enum(["lingzhi", "huge", "wukong", "ruoqi"]).default("lingzhi"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Step 1: Save user message
      await db.insert(messages).values({
        userId,
        role: "user",
        content: input.content,
        persona: input.persona,
      });

      // Step 2: Intent detection
      const intent = detectIntent(input.content);

      // Step 3: Retrieve relevant knowledge
      const knowledgeRows = await db
        .select()
        .from(knowledgeBase)
        .where(
          eq(knowledgeBase.category, intent.category as any)
        )
        .orderBy(desc(knowledgeBase.priority))
        .limit(3);

      // Step 4: Build enriched system prompt
      const [personaRow] = await db
        .select()
        .from(personas)
        .where(eq(personas.personaKey, input.persona));

      const systemPrompt = personaRow?.systemPrompt || getDefaultSystemPrompt(input.persona);

      // Add knowledge context
      let knowledgeContext = "";
      if (knowledgeRows.length > 0 && intent.confidence > 40) {
        knowledgeContext = "\n\n【专业知识参考】\n" + knowledgeRows.map((k, i) =>
          `${i + 1}. ${k.title}: ${k.content.substring(0, 300)}${k.content.length > 300 ? "..." : ""}`
        ).join("\n");
      }

      // Step 5: Get conversation history
      const history = await db
        .select()
        .from(messages)
        .where(eq(messages.userId, userId))
        .orderBy(desc(messages.createdAt))
        .limit(10);

      const recentHistory = history.reverse();

      // Step 6: Build messages for LLM
      const fullSystemPrompt = `${systemPrompt}${knowledgeContext}\n\n注意：你正在回答小主人的【${getCategoryLabel(intent.category)}】相关问题。请基于专业知识给出实用建议，控制在200字以内。`;

      const llmMessages = [
        { role: "system", content: fullSystemPrompt },
        ...recentHistory.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      // Step 7: Call LLM
      let aiContent = getFallbackResponse(input.content, intent.category);
      let usedKnowledgeId: number | null = null;

      try {
        const resp = await kimiClient.post<{
          choices: { message: { content: string } }[];
        }>("/v1/chat/completions", {
          model: "kimi-latest",
          messages: llmMessages,
          temperature: 0.7,
          max_tokens: 500,
        });
        aiContent = resp.choices?.[0]?.message?.content || aiContent;
        if (knowledgeRows.length > 0) usedKnowledgeId = knowledgeRows[0].id;
      } catch (err: any) {
        console.error("[AI] LLM call failed:", err.message);
      }

      // Step 8: Save AI response with intent + knowledge metadata
      await db.insert(messages).values({
        userId,
        role: "assistant",
        content: aiContent,
        persona: input.persona,
        intentCategory: intent.category,
        knowledgeId: usedKnowledgeId || undefined,
      });

      const [aiMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.userId, userId))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return aiMessage;
    }),

  // Clear chat history
  clear: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.delete(messages).where(eq(messages.userId, ctx.user.id));
    return { success: true };
  }),
});

function getDefaultSystemPrompt(persona: string): string {
  const prompts: Record<string, string> = {
    lingzhi: `你是"爱小蜜"林志玲，一位温柔知性、体贴入微的女性AI助手。说话风格优雅柔和，像知心姐姐。称呼用户为"小主人"。精通睡眠助眠、护肤美容、情绪疏导、人情世故和闲聊陪伴。回答简洁实用，200字以内。`,
    huge: `你是"爱小蜜"胡歌，一位沉稳理性、专业可靠的男性AI顾问。说话风格简洁有力，逻辑清晰。称呼用户为"小主人"。精通职业发展、财务规划、健身训练、自律养成和健康管理。回答简洁实用，200字以内。`,
    wukong: `你是"爱小蜜"孙悟空，一位活泼风趣、充满能量的AI伙伴。说话幽默俏皮，充满干劲。称呼用户为"小主人"。精通健身运动、饮食养生、习惯养成、闲聊解压和情绪激励。回答简洁实用，200字以内。`,
    ruoqi: `你是"爱小蜜"唐若琪，一位治愈温柔、耐心陪伴的女性AI知己。说话风格柔和治愈。称呼用户为"小主人"。精通情绪疏导、睡眠助眠、护肤养生、闲聊陪伴和人际沟通。回答简洁实用，200字以内。`,
  };
  return prompts[persona] || prompts.lingzhi;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    sleep: "睡眠助眠", mental: "情绪心理", skincare: "护肤美容",
    fitness: "健身塑形", diet: "饮食养生", style: "穿搭形象",
    social: "人情世故", finance: "财务记账", career: "职业发展",
    chat: "闲聊陪伴", habit: "自律习惯", health: "健康管理",
  };
  return labels[category] || "综合";
}

function getFallbackResponse(_userInput: string, category: string): string {
  const map: Record<string, string> = {
    sleep: "小主人，关于睡眠问题我可以帮你：播放白噪音、推荐助眠音乐、制定睡前放松方案。你想先试试哪种？",
    mental: "小主人，情绪问题可以随时跟我说。我可以陪你聊天、教你呼吸放松法、或者帮你梳理烦心事的思路。",
    skincare: "小主人想了解护肤的话，我可以先帮你做个肤质测试，然后定制专属的早晚护肤流程哦！",
    fitness: "健身是长久大计！我可以根据小主人的情况定制训练计划，还能推荐适合的动作和饮食搭配~",
    diet: "饮食养生我最在行！小主人想吃什么？我可以根据你的体质推荐适合的食谱和食疗方案~",
    style: "穿搭也是一门学问！小主人明天有什么场合？我可以帮你搭配一套合适的look~",
    social: "社交方面我可以帮你：写祝福语、准备送礼建议、或者模拟练习高情商对话场景~",
    finance: "理财从记账开始！小主人可以直接跟我说花了多少钱买了什么，我会自动分类记录，还能给消费建议~",
    career: "职业发展方面我可以：分析适合你的岗位方向、优化简历、模拟面试训练。想从哪方面开始？",
    habit: "养成好习惯需要循序渐进！我可以帮你拆解目标、设置每日提醒、记录打卡进度。想养成什么习惯？",
    health: "健康管理我有一套！可以帮你记录健康数据、设置用药提醒、推荐体检项目。有什么健康方面想了解的？",
    chat: "小主人想聊什么？我可以讲故事、聊哲学、推荐好书好电影，或者就陪你随便聊聊~",
  };
  return map[category] || "收到小主人的消息！我正在努力理解你的需求，有什么具体想做的吗？随时吩咐我~";
}
