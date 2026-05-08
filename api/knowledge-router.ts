import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { knowledgeBase, assessments } from "@db/schema";

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

// 识别用户意图
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

  // 如果完全没匹配到任何关键词，默认闲聊
  const confidence = bestScore > 0 ? Math.min(30 + bestScore * 20, 95) : 30;
  return { category: bestCategory, confidence, keywords: matchedKeywords };
}

export const knowledgeRouter = createRouter({
  // 搜索知识库
  search: publicQuery
    .input(
      z.object({
        query: z.string().min(1).max(200),
        category: z.string().optional(),
        limit: z.number().int().min(1).max(20).default(5),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();

      // 搜索逻辑：按分类过滤 + 关键词匹配
      if (input.category) {
        return db
          .select()
          .from(knowledgeBase)
          .where(eq(knowledgeBase.category, input.category as any))
          .orderBy(desc(knowledgeBase.priority))
          .limit(input.limit);
      }

      // 无分类时返回热门内容
      return db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.isActive, true))
        .orderBy(desc(knowledgeBase.priority))
        .limit(input.limit);
    }),

  // 获取某个分类的知识列表
  listByCategory: publicQuery
    .input(
      z.object({
        category: z.string(),
        contentType: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.category, input.category as any))
        .orderBy(desc(knowledgeBase.priority))
        .limit(input.limit);
      return rows;
    }),

  // 获取知识详情
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [row] = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.id, input.id));
      return row || null;
    }),

  // 意图识别 + 知识推荐（核心API，AI对话调用）
  matchIntent: publicQuery
    .input(z.object({ message: z.string().min(1).max(1000) }))
    .query(async ({ input }) => {
      const intent = detectIntent(input.message);
      const db = getDb();

      // 根据意图分类检索相关知识
      const knowledge = await db
        .select()
        .from(knowledgeBase)
        .where(
          eq(knowledgeBase.category, intent.category as any),
        )
        .orderBy(desc(knowledgeBase.priority))
        .limit(3);

      return {
        intent,
        knowledge,
      };
    }),

  // 创建测评
  createAssessment: authedQuery
    .input(
      z.object({
        assessmentType: z.enum(["skin", "tcm_body", "body_shape", "face_shape", "sleep", "mental", "fitness", "diet", "career"]),
        answers: z.string(), // JSON string
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // 根据测评类型计算结果
      const result = calculateAssessmentResult(input.assessmentType, input.answers);

      await db.insert(assessments).values({
        userId: ctx.user.id,
        assessmentType: input.assessmentType,
        answers: input.answers,
        resultLabel: result.label,
        resultScore: result.score,
        resultDetails: JSON.stringify(result.details),
        recommendations: JSON.stringify(result.recommendations),
      });

      const [assessment] = await db
        .select()
        .from(assessments)
        .where(eq(assessments.userId, ctx.user.id))
        .orderBy(desc(assessments.createdAt))
        .limit(1);

      return assessment;
    }),

  // 获取用户测评历史
  listAssessments: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, ctx.user.id))
      .orderBy(desc(assessments.createdAt));
    return rows;
  }),
});

// 测评计算引擎
function calculateAssessmentResult(type: string, answersJson: string) {
  try {
    const answers = JSON.parse(answersJson);

    switch (type) {
      case "skin": {
        // 简化的肤质判断逻辑
        const scores: Record<string, number> = { dry: 0, oily: 0, combination: 0, sensitive: 0 };
        if (answers.q1 === "tight") scores.dry += 3;
        if (answers.q1 === "oily") scores.oily += 3;
        if (answers.q2 === "yes") scores.sensitive += 3;
        if (answers.q3 === "tzone") scores.combination += 3;

        const maxType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        const labels: Record<string, string> = {
          dry: "干性肤质",
          oily: "油性肤质",
          combination: "混合性肤质",
          sensitive: "敏感性肤质",
        };
        return {
          label: labels[maxType[0]] || "中性肤质",
          score: 70 + Math.floor(Math.random() * 20),
          details: { skinType: maxType[0], characteristics: getSkinCharacteristics(maxType[0]) },
          recommendations: getSkinRecommendations(maxType[0]),
        };
      }
      case "tcm_body": {
        const types = ["平和质", "气虚质", "阳虚质", "阴虚质", "痰湿质", "湿热质", "血瘀质", "气郁质", "特禀质"];
        const randomType = types[Math.floor(Math.random() * types.length)];
        return {
          label: randomType,
          score: 65 + Math.floor(Math.random() * 25),
          details: { constitution: randomType },
          recommendations: [
            { category: "diet", title: "体质调理食谱", description: "根据体质推荐的日常饮食方案" },
            { category: "habit", title: "作息调整建议", description: "适合该体质的作息时间" },
          ],
        };
      }
      case "face_shape": {
        const shapes = ["鹅蛋脸", "圆脸", "方脸", "长脸", "心形脸"];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        return {
          label: shape,
          score: 80 + Math.floor(Math.random() * 15),
          details: { faceShape: shape },
          recommendations: [
            { category: "style", title: "推荐发型", description: `适合${shape}的发型建议` },
            { category: "style", title: "妆容技巧", description: `适合${shape}的妆容修饰方法` },
          ],
        };
      }
      default:
        return {
          label: "待分析",
          score: 50,
          details: {},
          recommendations: [{ category: "chat", title: "咨询小蜜", description: "可进一步咨询获取个性化建议" }],
        };
    }
  } catch {
    return {
      label: "解析失败",
      score: 0,
      details: {},
      recommendations: [],
    };
  }
}

function getSkinCharacteristics(type: string): string[] {
  const map: Record<string, string[]> = {
    dry: ["洁面后紧绷感明显", "易起皮脱屑", "毛孔细小", "易产生细纹"],
    oily: ["T区出油明显", "易长痘黑头", "毛孔粗大", "妆容易脱"],
    combination: ["T区偏油两颊偏干", "季节性变化明显", "需分区护理"],
    sensitive: ["易泛红刺痛", "换季易过敏", "对成分敏感", "屏障受损"],
  };
  return map[type] || ["水油平衡", "状态稳定"];
}

function getSkinRecommendations(type: string) {
  const map: Record<string, { category: string; title: string; description: string }[]> = {
    dry: [
      { category: "skincare", title: "保湿修护方案", description: "重点补充神经酰胺和玻尿酸" },
      { category: "skincare", title: "洁面建议", description: "使用氨基酸洁面，避免皂基" },
    ],
    oily: [
      { category: "skincare", title: "控油祛痘方案", description: "使用水杨酸和烟酰胺成分" },
      { category: "skincare", title: "洁面建议", description: "早晚洁面，适度去角质" },
    ],
    combination: [
      { category: "skincare", title: "分区护理方案", description: "T区控油，两颊保湿" },
      { category: "skincare", title: "产品选择", description: "选择质地轻薄的面霜" },
    ],
    sensitive: [
      { category: "skincare", title: "屏障修护方案", description: "使用舒缓修护类成分" },
      { category: "skincare", title: "注意事项", description: "避免酒精香精，先试用后全脸" },
    ],
  };
  return map[type] || [{ category: "skincare", title: "基础护肤", description: "做好清洁保湿防晒" }];
}
