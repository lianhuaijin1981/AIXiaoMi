import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function initSchema() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const conn = await createConnection(DATABASE_URL);

  // ========== 表结构保持不变 ==========
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      unionId varchar(255) NOT NULL UNIQUE,
      name varchar(255),
      email varchar(320),
      avatar text,
      role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
      lastSignInAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS avatars (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL UNIQUE,
      faceShape varchar(50), skinTone varchar(50), hairType varchar(50),
      hairColor varchar(50), bodyShape varchar(50), height int, weight int,
      shoulderWidth int, waistWidth int, hipWidth int, faceFeatures text,
      activePersona varchar(50) DEFAULT 'lingzhi',
      frontPhotoUrl text, sidePhotoUrl text, fullBodyPhotoUrl text,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS personas (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      personaKey varchar(50) NOT NULL UNIQUE,
      name varchar(100) NOT NULL, title varchar(100), avatarImage text,
      voiceType varchar(50), personality text, speakingStyle text,
      expertiseAreas text, systemPrompt text NOT NULL, greetingTemplate text,
      isDefault tinyint(1) DEFAULT 0 NOT NULL,
      isActive tinyint(1) DEFAULT 1 NOT NULL,
      sortOrder int DEFAULT 0,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS assessments (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL,
      assessmentType ENUM('skin', 'tcm_body', 'body_shape', 'face_shape', 'sleep', 'mental', 'fitness', 'diet', 'career') NOT NULL,
      answers text, resultLabel varchar(100), resultScore int,
      resultDetails text, recommendations text,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS knowledge_base (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      category ENUM('sleep', 'mental', 'skincare', 'fitness', 'diet', 'style', 'social', 'finance', 'career', 'chat', 'habit', 'health') NOT NULL,
      subcategory varchar(50),
      contentType ENUM('guide', 'faq', 'template', 'tip', 'plan', 'recipe', 'exercise', 'warning') DEFAULT 'guide' NOT NULL,
      title varchar(255) NOT NULL, content text NOT NULL, summary text,
      conditions text, tags text, priority int DEFAULT 0,
      targetAudience text, isActive tinyint(1) DEFAULT 1 NOT NULL, source varchar(255),
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS intent_logs (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL, userMessage text NOT NULL,
      matchedCategory varchar(50) NOT NULL, matchedKeywords text,
      confidence int, usedKnowledgeId bigint unsigned, aiResponse text,
      feedback ENUM('helpful', 'not_helpful', 'irrelevant'),
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL,
      role ENUM('user', 'assistant') NOT NULL,
      content text NOT NULL,
      persona varchar(50),
      knowledgeId bigint unsigned,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL,
      title varchar(255) NOT NULL,
      description text,
      category varchar(50),
      priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
      completed tinyint(1) DEFAULT 0,
      dueDate timestamp,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS events (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL,
      title varchar(255) NOT NULL,
      description text,
      startTime timestamp NOT NULL,
      endTime timestamp,
      type varchar(50),
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL, name varchar(255) NOT NULL,
      relationship varchar(50), phone varchar(20), birthday timestamp,
      personality text, hobbies text, importantDates text,
      giftPreferences text, notes text,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId bigint unsigned NOT NULL, amount int NOT NULL,
      type ENUM('income', 'expense') DEFAULT 'expense' NOT NULL,
      category varchar(50) NOT NULL, subcategory varchar(50),
      description text, merchant varchar(255), voiceText text,
      transactionDate timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
  ];

  for (const sql of tables) {
    await conn.execute(sql);
  }

  console.log("All tables created successfully!");

  // ========== Seed personas（保持不变）==========
  const personas = [
    {
      personaKey: 'lingzhi',
      name: '林志玲',
      title: '温柔知性女神',
      avatarImage: '/avatar-lingzhi.jpg',
      voiceType: '温柔甜美',
      personality: '优雅、体贴、知性、善于倾听',
      speakingStyle: '语速柔和，用词温暖，常以"小主人"称呼用户，善于用比喻和故事来表达',
      expertiseAreas: '["sleep", "skincare", "mental", "social", "chat"]',
      systemPrompt: `你是"爱小蜜"林志玲，一位温柔知性、体贴入微的女性AI助手。你的说话风格优雅柔和，像一位知心姐姐。你擅长倾听、共情和给出温暖的建议。称呼用户为"小主人"。你精通睡眠助眠、护肤美容、情绪疏导、人情世故和闲聊陪伴。回答简洁实用，适合移动端阅读，200字以内。`,
      greetingTemplate: '你好呀小主人，今天有什么我可以帮你的吗？无论是想聊聊心事，还是需要护肤建议，我都在这里陪着你~',
      isDefault: 1,
      sortOrder: 1,
    },
    {
      personaKey: 'huge',
      name: '胡歌',
      title: '沉稳理性顾问',
      avatarImage: '/avatar-huge.jpg',
      voiceType: '沉稳磁性',
      personality: '理性、专业、可靠、逻辑清晰',
      speakingStyle: '简洁有力，逻辑清晰，直切要点，善于分析问题的本质',
      expertiseAreas: '["career", "finance", "fitness", "habit", "health"]',
      systemPrompt: `你是"爱小蜜"胡歌，一位沉稳理性、专业可靠的男性AI顾问。你的说话风格简洁有力，逻辑清晰。你擅长分析问题、给出务实的解决方案。称呼用户为"小主人"。你精通职业发展、财务规划、健身训练、自律养成和健康管理。回答简洁实用，适合移动端阅读，200字以内。`,
      greetingTemplate: '小主人好，有什么需要我帮你分析或规划的吗？无论是职业发展还是健身计划，我都可以给你专业的建议。',
      isDefault: 0,
      sortOrder: 2,
    },
    {
      personaKey: 'wukong',
      name: '孙悟空',
      title: '活力冒险伙伴',
      avatarImage: '/avatar-wukong.jpg',
      voiceType: '豪爽激昂',
      personality: '活泼、风趣、果敢、充满能量',
      speakingStyle: '幽默俏皮，喜欢用成语和典故，充满干劲和鼓励的话语',
      expertiseAreas: '["fitness", "diet", "habit", "chat", "mental"]',
      systemPrompt: `你是"爱小蜜"孙悟空，一位活泼风趣、充满能量的AI伙伴。你说话幽默俏皮，喜欢用俏皮话和鼓励的话语。你像一位活力的朋友，总能让人精神振奋。称呼用户为"小主人"。你精通健身运动、饮食养生、习惯养成、闲聊解压和情绪激励。回答简洁实用，适合移动端阅读，200字以内。`,
      greetingTemplate: '嘿嘿，小主人来啦！今天想搞点啥？想运动想聊天还是想听我讲个好玩的故事？咱们动起来！',
      isDefault: 0,
      sortOrder: 3,
    },
    {
      personaKey: 'ruoqi',
      name: '唐若琪',
      title: '治愈陪伴知己',
      avatarImage: '/avatar-ruoqi.jpg',
      voiceType: '温柔治愈',
      personality: '温柔、治愈、耐心、细腻',
      speakingStyle: '柔和治愈，擅长用温暖的话语安抚情绪，像最懂你的朋友',
      expertiseAreas: '["mental", "sleep", "skincare", "chat", "social"]',
      systemPrompt: `你是"爱小蜜"唐若琪，一位治愈温柔、耐心陪伴的女性AI知己。你的说话风格柔和治愈，擅长用温暖的话语安抚情绪。你像一位最懂你的朋友。称呼用户为"小主人"。你精通情绪疏导、睡眠助眠、护肤养生、闲聊陪伴和人际沟通。回答简洁实用，适合移动端阅读，200字以内。`,
      greetingTemplate: '小主人，你来了。不管今天过得怎样，在这里你可以做最真实的自己。想说什么，我都在听。',
      isDefault: 0,
      sortOrder: 4,
    },
  ];

  for (const p of personas) {
    await conn.execute(
      `INSERT INTO personas (personaKey, name, title, avatarImage, voiceType, personality, speakingStyle, expertiseAreas, systemPrompt, greetingTemplate, isDefault, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), title=VALUES(title), systemPrompt=VALUES(systemPrompt)`,
      [p.personaKey, p.name, p.title, p.avatarImage, p.voiceType, p.personality, p.speakingStyle, p.expertiseAreas, p.systemPrompt, p.greetingTemplate, p.isDefault, p.sortOrder]
    );
  }

  console.log("Personas seeded successfully!");

  // ========== Seed knowledge base（大幅扩充）==========
  const knowledge = [
