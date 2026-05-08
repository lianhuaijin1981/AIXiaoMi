import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ==========================================
// 1. 用户系统（OAuth + 扩展资料）
// ==========================================

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==========================================
// 2. 数字分身画像系统
// ==========================================

export const avatars = mysqlTable("avatars", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  // 基础形象数据
  faceShape: varchar("face_shape", { length: 50 }), // oval, round, square, heart, long
  skinTone: varchar("skin_tone", { length: 50 }), // fair, light, medium, tan, deep
  hairType: varchar("hair_type", { length: 50 }), // straight, wavy, curly, coily
  hairColor: varchar("hair_color", { length: 50 }),
  bodyShape: varchar("body_shape", { length: 50 }), // apple, pear, hourglass, rectangle, inverted-triangle
  height: int("height"), // cm
  weight: int("weight"), // kg
  shoulderWidth: int("shoulder_width"), // cm
  waistWidth: int("waist_width"), // cm
  hipWidth: int("hip_width"), // cm
  // 3D模型数据（JSON存储关键特征点）
  faceFeatures: text("face_features"), // JSON: {eyeDistance, noseHeight, lipWidth, browPosition}
  // 活跃人设
  activePersona: varchar("active_persona", { length: 50 }).default("lingzhi"),
  // 形象照片URL（用户上传的正/侧脸照）
  frontPhotoUrl: text("front_photo_url"),
  sidePhotoUrl: text("side_photo_url"),
  fullBodyPhotoUrl: text("full_body_photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Avatar = typeof avatars.$inferSelect;

// 用户扩展资料（体质/肤质/习惯等）
export const userProfiles = mysqlTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  activePersona: varchar("active_persona", { length: 50 }).default("lingzhi"),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  height: int("height"),
  weight: int("weight"),
  skinType: varchar("skin_type", { length: 50 }),
  bodyType: varchar("body_type", { length: 50 }),
  tcmConstitution: varchar("tcm_constitution", { length: 50 }),
  fitnessGoal: varchar("fitness_goal", { length: 100 }),
  sleepGoal: varchar("sleep_goal", { length: 50 }).default("23:00"),
  streakDays: int("streak_days").default(0),
  totalMessages: int("total_messages").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserProfile = typeof userProfiles.$inferSelect;

// 虚拟人设档案（IP角色设定）
export const personas = mysqlTable("personas", {
  id: serial("id").primaryKey(),
  personaKey: varchar("persona_key", { length: 50 }).notNull().unique(), // lingzhi, huge, wukong, ruoqi
  name: varchar("name", { length: 100 }).notNull(),
  title: varchar("title", { length: 100 }), // "温柔知性女神" / "沉稳理性顾问"
  avatarImage: text("avatar_image"), // 形象图片URL
  voiceType: varchar("voice_type", { length: 50 }), // 声线描述
  personality: text("personality"), // 性格特征描述
  speakingStyle: text("speaking_style"), // 说话风格
  expertiseAreas: text("expertise_areas"), // JSON: ["sleep", "skincare", "mental"]
  systemPrompt: text("system_prompt").notNull(), // 完整系统Prompt
  greetingTemplate: text("greeting_template"), // 问候语模板
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Persona = typeof personas.$inferSelect;

// ==========================================
// 3. 用户测评系统
// ==========================================

export const assessments = mysqlTable("assessments", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  assessmentType: mysqlEnum("assessment_type", [
    "skin",        // 肤质测评
    "tcm_body",    // 中医体质
    "body_shape",  // 体型测评
    "face_shape",  // 脸型测评
    "sleep",       // 睡眠质量
    "mental",      // 心理健康
    "fitness",     // 体能测评
    "diet",        // 饮食习惯
    "career",      // 职业倾向
  ]).notNull(),
  // 测评答案（JSON存储问卷答案）
  answers: text("answers"), // JSON: {q1: "a", q2: "b"}
  // 测评结果
  resultLabel: varchar("result_label", { length: 100 }), // "混油敏感肌" / "气虚体质"
  resultScore: int("result_score"), // 综合分数 0-100
  resultDetails: text("result_details"), // JSON详细结果
  // 推荐方案
  recommendations: text("recommendations"), // JSON: [{category, title, description}]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;

// ==========================================
// 4. 知识库系统（12维度专业知识）
// ==========================================

export const knowledgeBase = mysqlTable("knowledge_base", {
  id: serial("id").primaryKey(),
  // 分类体系
  category: mysqlEnum("category", [
    "sleep",      // 睡眠助眠
    "mental",     // 情绪心理
    "skincare",   // 护肤美容
    "fitness",    // 健身塑形
    "diet",       // 饮食养生
    "style",      // 穿搭形象
    "social",     // 人情世故
    "finance",    // 财务记账
    "career",     // 职业发展
    "chat",       // 闲聊陪伴
    "habit",      // 自律习惯
    "health",     // 健康管理
  ]).notNull(),
  // 子分类
  subcategory: varchar("subcategory", { length: 50 }), // e.g. "white_noise", "moisturizer", "strength_training"
  // 内容类型
  contentType: mysqlEnum("content_type", [
    "guide",      // 指南/教程
    "faq",        // FAQ问答
    "template",   // 模板（话术/祝福语/简历）
    "tip",        // 小贴士
    "plan",       // 方案/计划
    "recipe",     // 食谱/护肤配方
    "exercise",   // 运动/动作
    "warning",    // 避坑/警示
  ]).default("guide").notNull(),
  // 内容
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"), // 摘要，用于快速匹配
  // 适用条件（JSON条件表达式）
  conditions: text("conditions"), // JSON: {skinType: ["oily"], ageRange: "20-30"}
  // 标签（用于检索）
  tags: text("tags"), // JSON: ["痘痘", "油皮", "夏季"]
  // 排序权重
  priority: int("priority").default(0),
  // 适用人群
  targetAudience: text("target_audience"), // JSON: {gender, ageRange, skinType, bodyType}
  // 是否激活
  isActive: boolean("is_active").default(true).notNull(),
  // 来源/可信度
  source: varchar("source", { length: 255 }), // "皮肤科医生建议" / "中医典籍"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type KnowledgeItem = typeof knowledgeBase.$inferSelect;

// 用户意图匹配记录（用于优化AI理解）
export const intentLogs = mysqlTable("intent_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  userMessage: text("user_message").notNull(),
  matchedCategory: varchar("matched_category", { length: 50 }).notNull(),
  matchedKeywords: text("matched_keywords"), // JSON
  confidence: int("confidence"), // 0-100 匹配置信度
  usedKnowledgeId: bigint("used_knowledge_id", { mode: "number", unsigned: true }),
  aiResponse: text("ai_response"),
  feedback: mysqlEnum("feedback", ["helpful", "not_helpful", "irrelevant"]), // 用户反馈
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IntentLog = typeof intentLogs.$inferSelect;

// ==========================================
// 5. 聊天消息（原有）
// ==========================================

export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  persona: varchar("persona", { length: 50 }).default("lingzhi"),
  // 关联知识库（记录AI使用了哪条知识）
  knowledgeId: bigint("knowledge_id", { mode: "number", unsigned: true }),
  intentCategory: varchar("intent_category", { length: 50 }),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

// ==========================================
// 6. 任务系统（原有）
// ==========================================

export const tasks = mysqlTable("tasks", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).default("general").notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium").notNull(),
  completed: boolean("completed").default(false).notNull(),
  dueTime: varchar("due_time", { length: 10 }),
  dueDate: timestamp("due_date"),
  repeatPattern: varchar("repeat_pattern", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;

// ==========================================
// 7. 日程系统（原有）
// ==========================================

export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  type: mysqlEnum("type", ["work", "personal", "health", "reminder", "social"]).default("personal").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  allDay: boolean("all_day").default(false).notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurrenceRule: varchar("recurrence_rule", { length: 100 }),
  remindBefore: int("remind_before").default(15),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Event = typeof events.$inferSelect;

// ==========================================
// 8. 人脉档案（社交维度）
// ==========================================

export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 50 }), // 亲友/同事/客户
  phone: varchar("phone", { length: 20 }),
  birthday: timestamp("birthday"),
  // 关键信息
  personality: text("personality"), // 性格描述
  hobbies: text("hobbies"), // 喜好
  importantDates: text("important_dates"), // JSON: [{date, event}]
  giftPreferences: text("gift_preferences"), // 送礼偏好
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Contact = typeof contacts.$inferSelect;

// ==========================================
// 9. 记账/财务记录
// ==========================================

export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  amount: int("amount").notNull(), // 金额（分）
  type: mysqlEnum("type", ["income", "expense"]).default("expense").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 餐饮/交通/购物/娱乐/医疗
  subcategory: varchar("subcategory", { length: 50 }),
  description: text("description"),
  merchant: varchar("merchant", { length: 255 }),
  // 语音原始文本
  voiceText: text("voice_text"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
