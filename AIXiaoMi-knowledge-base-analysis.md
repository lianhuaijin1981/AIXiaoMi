# AIXiaoMi 知识库深化方案分析报告

> 生成时间：2026-05-09
> 项目：https://github.com/lianhuaijin1981/AIXiaoMi

---

## 一、项目现状概览

### 1.1 技术栈

| 层级 | 技术选型 |
|------|---------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 状态/通信 | tRPC + React Query |
| 后端 | Node.js + tRPC Routers |
| 数据库 | Drizzle ORM |
| AI集成 | Kimi AI (Moonshot) |
| UI组件 | 53个可复用组件（Radix UI系） |

### 1.2 项目规模

| 指标 | 数值 |
|------|------|
| 数据库表 | 12个 |
| API路由组 | 8个 |
| 前端页面 | 13个 |
| AI人设 | 4个（林志玲/胡歌/孙悟空/唐若琪） |
| 知识分类 | 12维度 |
| 当前提交 | 2次 |

---

## 二、知识库现有实现分析

### 2.1 数据库层（✅ 骨架完整）

```typescript
// db/schema.ts - knowledge_base 表结构
knowledge_base {
  id: serial().primaryKey()
  category: enum("sleep"|"mental"|"skincare"|"fitness"|"diet"|
                "style"|"social"|"finance"|"career"|"chat"|"habit"|"health")
  subcategory: varchar(50)
  contentType: enum("guide"|"faq"|"template"|"tip"|"plan"|"recipe"|"exercise"|"warning")
  title: varchar(255)
  content: text
  summary: text
  conditions: text(JSON)      // 适用条件
  tags: text(JSON)            // 检索标签
  targetAudience: text(JSON)  // 目标人群
  priority: int
  isActive: boolean
  source: varchar(255)
  createdAt/updatedAt: timestamp
}
```

**评估：✅ 表结构设计良好，支持多维检索和个性化匹配**

### 2.2 API层（⚠️ 基础功能已实现）

| 端点 | 功能 | 状态 |
|------|------|------|
| `knowledge.search` | 关键词搜索 | ✅ 已实现 |
| `knowledge.listByCategory` | 分类列表 | ✅ 已实现 |
| `knowledge.getById` | ID查询 | ✅ 已实现 |
| `knowledge.matchIntent` | 意图匹配 | ✅ 已实现 |
| `knowledge.createAssessment` | 创建测评 | ✅ 已实现 |
| `knowledge.listAssessments` | 测评列表 | ✅ 已实现 |

**Intent Detection 函数分析：**
```typescript
// 当前实现：基于关键词匹配的简单规则
const intentKeywords: Record<string, string[]> = {
  sleep: ["睡", "眠", "失眠", "睡不着", "熬夜", ...],
  mental: ["焦虑", "抑郁", "压力", "情绪", ...],
  // ... 12个分类
};

function detectIntent(userMessage: string): { category, confidence, keywords } {
  // 简单匹配：计算命中关键词数量
  // confidence = 30 + score * 20 (上限95)
}
```

**评估：⚠️ 基础CRUD完整，但检索能力初级（无向量搜索）**

### 2.3 前端层（⚠️ UI框架完成，内容空洞）

```tsx
// src/pages/KnowledgePage.tsx 核心功能
- 12个分类配置（带图标和颜色）
- 搜索输入（≥2字符触发）
- 分类列表展示
- 详情弹窗
- 跳转AI咨询
```

**评估：⚠️ 交互完整，但无知识内容填充**

---

## 三、核心缺口识别（P0阻塞项）

### 3.1 缺口矩阵

| 缺口 | 严重度 | 影响 |
|------|--------|------|
| 知识库内容缺失 | 🔴 P0 | 12维度全部为空，AI无法提供专业建议 |
| 向量检索缺失 | 🔴 P0 | 无法语义匹配，只能关键词匹配 |
| 肤质测评算法 | 🔴 P0 | 仅简单加权计算，无专业判定逻辑 |
| 体质测评缺失 | 🟡 P1 | TCM体质测评问卷和算法缺失 |
| 个性化推荐 | 🟡 P1 | 缺少基于用户画像的知识推荐 |
| 内容来源管理 | 🟡 P1 | 缺少知识审核和版本管理 |

### 3.2 PRD对照分析

根据PRD_AUDIT.md，12维度功能对应的知识库需求：

| 维度 | 知识库需求 | 当前状态 |
|------|-----------|----------|
| 睡眠助眠 | 白噪音资源、冥想引导、睡眠日志 | ❌ 全部缺失 |
| 情绪疏导 | CBT方法、呼吸法、正念指南 | ❌ 全部缺失 |
| 护肤管理 | 肤质判定、成分解读、护肤步骤 | ⚠️ 测评框架有，内容缺失 |
| 健身塑形 | 训练计划、动作库、体态矫正方案 | ❌ 全部缺失 |
| 饮食养生 | 体质测评、食谱库、食疗知识 | ❌ 全部缺失 |
| 穿搭形象 | 脸型分析、发型知识、穿搭规则 | ❌ 全部缺失 |
| 人情世故 | 话术模板、节假日数据、社交礼仪 | ❌ 全部缺失 |
| 财务记账 | 消费分类引擎、预算模板 | ❌ 全部缺失 |
| 职业发展 | 简历模板、面试题库 | ❌ 全部缺失 |
| 闲聊陪伴 | 故事库、兴趣入门知识 | ❌ 全部缺失 |
| 自律习惯 | 习惯模板、任务拆解方法 | ❌ 全部缺失 |
| 健康管理 | 体检指南、用药常识 | ❌ 全部缺失 |

**结论：知识库内容为0，需系统性填充**

---

## 四、知识库深化方案

### 4.1 方案一：快速上线方案（2周）

**目标：** 填充核心知识，实现基础RAG

#### Phase 1: 知识库填充（第1周）

```
每日任务量建议（按维度）：
- 每个维度至少填充 20-30 条知识条目
- 每条知识包含：title, content, summary, tags, conditions
- 优先填充高频需求：护肤、饮食、睡眠、情绪
```

| 维度 | 目标条目数 | 优先级 | 知识类型 |
|------|-----------|--------|----------|
| skincare | 50 | P0 | 指南、食谱、避坑 |
| diet | 50 | P0 | 体质测评、食谱、食疗 |
| sleep | 40 | P0 | 白噪音指南、睡眠改善 |
| mental | 40 | P0 | CBT方法、呼吸放松 |
| fitness | 30 | P1 | 训练计划、动作指导 |
| style | 30 | P1 | 脸型分析、穿搭指南 |
| social | 30 | P1 | 话术模板、社交礼仪 |
| career | 30 | P1 | 简历模板、面试题库 |
| habit | 20 | P2 | 习惯养成、目标管理 |
| health | 20 | P2 | 体检指南、用药常识 |
| chat | 20 | P2 | 趣味知识、故事 |
| finance | 20 | P2 | 记账方法、理财入门 |

**数据格式示例：**
```typescript
// 护肤知识示例
{
  category: "skincare",
  subcategory: "routine",
  contentType: "guide",
  title: "干性肤质早晚护肤流程",
  content: `【干性肤质早晚护肤流程】
  
一、晨间护肤（5步）
1. 温水洁面（30秒内）
2. 喷雾补水（雅漾/理肤泉）
3. 精华（玻尿酸/神经酰胺）
4. 面霜（厚敷）
5. 防晒（SPF30+）

二、晚间护肤（6步）
1. 卸妆（温和卸妆油）
2. 洁面（氨基酸洁面）
3. 喷雾补水
4. 精华（修复型）
5. 面霜/护肤油
6. 唇部护理

三、每周护理
- 2-3次补水面膜
- 1次去角质（敏感肌跳过）
- 1-2次睡眠面膜`,
  summary: "专为干性肤质设计的早晚护肤流程，含产品推荐",
  tags: ["干性", "保湿", "早间", "晚间", "面膜"],
  conditions: JSON.stringify({
    skinType: ["dry", "dry-sensitive"],
    season: ["all"],
    ageRange: [18, 60]
  }),
  targetAudience: JSON.stringify({
    gender: ["female", "male"],
    concern: ["dryness", "wrinkle-prevention"]
  }),
  priority: 85,
  isActive: true,
  source: "AI小秘护肤专家团队"
}
```

#### Phase 2: 检索增强（第2周）

**2.1 关键词匹配优化**
```typescript
// 升级 intentKeywords，更精细化
const intentKeywords = {
  skincare: {
    primary: ["护肤", "皮肤", "肤质", "痘痘", "油皮", "干皮"],
    secondary: ["洗面", "精华", "面霜", "防晒", "美白"],
    advanced: {
      acne: ["痘", "痘痘", "痤疮", "闭口", "黑头"],
      antiaging: ["皱纹", "抗老", "衰老", "松垮"],
      whitening: ["美白", "淡斑", "色斑", "暗沉"]
    }
  }
  // ... 其他维度
};
```

**2.2 语义匹配准备**
```typescript
// 为每条知识生成语义向量（预留接口）
interface KnowledgeEmbedding {
  knowledgeId: number;
  embedding: number[];  // 1536维向量（OpenAI text-embedding-3-small）
  chunkIndex: number;   // 分块索引（长内容拆分）
}
```

### 4.2 方案二：完整RAG方案（4周）

#### Phase 1: 知识库建设（1-2周）
- 系统性内容填充（目标：500+条目/维度）
- 知识质量审核流程
- 知识分类体系优化

#### Phase 2: 向量检索集成（1周）
```typescript
// 集成向量数据库（以Qdrant为例）
import { QdrantClient } from '@qdrant/js-client-rest';

// 向量检索核心代码
async function semanticSearch(query: string, userProfile: UserProfile) {
  // 1. 生成查询向量
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  // 2. 语义搜索
  const results = await qdrant.searchCollections('knowledge_base', {
    vector: queryEmbedding.data[0].embedding,
    limit: 5,
    filter: {
      must: [
        { key: 'category', match: { value: userProfile.primaryConcern } }
      ]
    }
  });
  
  // 3. Rerank排序
  return await rerank(results, query);
}
```

#### Phase 3: 个性化推荐引擎（1周）
```typescript
// 用户画像 + 知识匹配
interface PersonalizedKnowledgeEngine {
  // 基于用户测评结果推荐
  recommendByAssessment(userId: string): KnowledgeItem[];
  
  // 基于对话上下文推荐
  recommendByContext(messages: Message[]): KnowledgeItem[];
  
  // 基于时间/事件推荐
  recommendBySchedule(userId: string, date: Date): KnowledgeItem[];
}
```

---

## 五、实施计划

### 5.1 推荐实施路径（6周）

| 周次 | 阶段 | 主要任务 | 交付物 |
|------|------|----------|--------|
| 第1周 | 知识库填充 | 填充P0维度：skincare/diet/sleep/mental | 200条知识条目 |
| 第2周 | 知识库填充 | 填充P1维度：fitness/style/social/career | 200条知识条目 |
| 第3周 | 知识库填充 | 填充P2维度 + 内容审核 | 150条 + 审核流程 |
| 第4周 | RAG基础 | 意图匹配优化 + 检索算法升级 | 检索准确率>80% |
| 第5周 | 向量集成 | 向量数据库集成 + 语义搜索 | 语义匹配API |
| 第6周 | 个性化 | 推荐引擎 + 测评系统完善 | 个性化推荐功能 |

### 5.2 立即可执行任务

#### 任务1：护肤知识库填充（最高优先）
```
目标：50条高质量护肤知识
分类：
- 肤质判定（10条）
- 护肤步骤（10条）
- 成分解读（10条）
- 问题解决（10条）
- 产品推荐（10条）
```

#### 任务2：睡眠知识库填充
```
目标：40条睡眠助眠知识
分类：
- 睡眠环境（10条）
- 睡前习惯（10条）
- 助眠方法（10条）
- 问题解决（10条）
```

#### 任务3：情绪疏导知识库
```
目标：40条情绪管理知识
分类：
- 情绪识别（10条）
- CBT方法（10条）
- 呼吸放松（10条）
- 正念练习（10条）
```

---

## 六、知识库Seed数据建议

### 6.1 数据结构

```typescript
// db/knowledge-seed.ts
export const knowledgeSeedData = [
  // ========== 护肤维度 ==========
  {
    category: 'skincare',
    subcategory: 'skin_type',
    contentType: 'guide',
    title: '如何判断自己的肤质',
    content: `【肤质判断指南】

一、洁面测试法（最准确）
1. 彻底清洁面部，不使用任何护肤品
2. 等待1-2小时
3. 观察面部出油情况：
   - 全脸出油 → 油性肤质
   - 仅T区出油 → 混合性肤质
   - 全脸紧绷/起皮 → 干性肤质
   - 易泛红/刺痛 → 敏感性肤质

二、纸巾测试法
1. 睡前清洁面部
2. 第二天早上用纸巾轻压面部
3. 观察纸巾：
   - 大量油渍 → 油性
   - T区油U区干 → 混合
   - 几乎无变化 → 干性/中性`,
    summary: '通过洁面测试法和纸巾测试法判断肤质',
    tags: ['肤质判定', '测试', '油皮', '干皮', '混合'],
    conditions: JSON.stringify({ skinType: ['unknown'] }),
    targetAudience: JSON.stringify({ gender: ['all'], ageRange: [16, 60] }),
    priority: 95,
    isActive: true,
    source: 'AI小秘护肤专家'
  },
  // ... 更多数据
];
```

### 6.2 批量导入脚本

```typescript
// db/seed-knowledge.ts
import { db } from './index';
import { knowledgeBase } from './schema';
import { knowledgeSeedData } from './knowledge-seed';

async function seedKnowledge() {
  console.log('开始填充知识库...');
  
  for (const item of knowledgeSeedData) {
    await db.insert(knowledgeBase).values({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  console.log(`知识库填充完成，共 ${knowledgeSeedData.length} 条`);
}

seedKnowledge();
```

---

## 七、风险与建议

### 7.1 主要风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 知识内容质量参差 | 高 | 建立审核流程，多轮校对 |
| 检索准确率不足 | 高 | 先优化关键词，逐步引入向量 |
| 知识更新维护成本 | 中 | 设计知识版本管理机制 |
| 个性化推荐效果 | 中 | A/B测试，持续优化 |

### 7.2 建议优先级

1. **立即行动**：填充P0维度知识库（skincare/diet/sleep/mental）
2. **短期目标**：完善意图匹配 + 检索算法
3. **中期目标**：引入向量数据库 + RAG系统
4. **长期目标**：知识图谱 + 个性化推荐引擎

---

## 八、结论

AIXiaoMi项目的知识库**骨架完善**，但**内容严重缺失**。当前的首要任务是**系统性填充12维度专业知识库**，建议采用"快速迭代"策略：

1. 第1-2周：优先填充P0维度（护肤、饮食、睡眠、情绪）
2. 第3周：覆盖所有12维度
3. 第4周起：逐步升级检索能力（关键词→向量→个性化）

**核心原则：小步快跑，快速验证，持续迭代**

---

*报告生成工具：WorkBuddy AI*
