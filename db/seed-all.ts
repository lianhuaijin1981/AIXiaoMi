import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function initSchema() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const conn = await createConnection(DATABASE_URL);

  const tables = [
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

  // Seed personas
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

  // Seed knowledge base
  const knowledge = [
    // 睡眠知识
    {
      category: 'sleep', subcategory: 'white_noise', contentType: 'guide',
      title: '白噪音助眠指南',
      content: '白噪音通过掩盖环境中的突发噪音来帮助入睡。推荐类型：雨声（适合焦虑型失眠）、溪流声（适合思绪过多）、森林鸟鸣（适合压力型失眠）。音量建议：30-40分贝，播放时长：可设置定时关闭，一般30-60分钟即可入睡。',
      summary: '白噪音助眠原理及推荐类型', tags: '["白噪音", "助眠", "失眠", "雨声"]',
      priority: 10, source: '睡眠医学研究',
    },
    {
      category: 'sleep', subcategory: 'sleep_hygiene', contentType: 'tip',
      title: '睡前3小时黄金法则',
      content: '1. 避免咖啡因（咖啡、茶、可乐）；2. 避免剧烈运动；3. 避免蓝光（手机、电脑）；4. 调暗室内灯光；5. 室温保持在18-22°C；6. 可泡温水脚或洗热水澡。',
      summary: '睡前3小时应该避免和应该做的事情', tags: '["睡前", "作息", "习惯", "咖啡因"]',
      priority: 9, source: '睡眠医学协会',
    },
    // 护肤知识
    {
      category: 'skincare', subcategory: 'skin_type', contentType: 'guide',
      title: '四大肤质判断指南',
      content: '干性肤质：洁面后紧绷感明显，易起皮，毛孔细小。油性肤质：T区出油多，易长痘，毛孔粗大。混合性：T区油，两颊干。敏感性：易泛红、刺痛，换季易过敏。判断方法：洁面后1小时不涂产品，观察皮肤状态。',
      summary: '四种基本肤质的判断方法', tags: '["肤质", "干皮", "油皮", "敏感肌"]',
      priority: 10, source: '皮肤科临床指南',
    },
    {
      category: 'skincare', subcategory: 'routine', contentType: 'plan',
      title: '标准早晚护肤流程',
      content: '晨间：洁面→爽肤水→精华→乳液/面霜→防晒。晚间：卸妆→洁面→爽肤水→精华→眼霜→乳液/面霜。要点：1. 防晒是白天最后一步；2. 精华按质地从薄到厚；3. 眼霜在精华之后；4. 每步间隔1-2分钟让产品吸收。',
      summary: '早晚护肤的正确步骤顺序', tags: '["护肤流程", "早晚", "防晒", "精华"]',
      priority: 10, source: '美容护肤专业指南',
    },
    // 健身知识
    {
      category: 'fitness', subcategory: 'beginner', contentType: 'plan',
      title: '新手居家健身7天计划',
      content: 'Day1：全身激活（开合跳30秒×3组、深蹲15个×3组、俯卧撑跪姿10个×3组）。Day2：核心训练（平板支撑30秒×3组、卷腹15个×3组、臀桥20个×3组）。Day3：休息日（轻度拉伸）。Day4：下肢力量。Day5：上肢力量。Day6：有氧燃脂。Day7：全身拉伸。',
      summary: '零基础居家健身一周计划', tags: '["新手", "居家健身", "计划", "零基础"]',
      priority: 10, source: '运动科学训练手册',
    },
    {
      category: 'fitness', subcategory: 'posture', contentType: 'guide',
      title: '圆肩驼背矫正训练',
      content: '成因：长期伏案、低头玩手机导致胸肌紧张、背部肌群无力。矫正动作：1. 墙壁天使（背靠墙，手臂上下滑动15次×3组）；2. YTWL训练（俯卧，手臂呈Y/T/W/L形状，各15次×3组）；3. 猫牛式伸展（30秒×3组）；4. 每天提醒自己做3次肩膀后收。',
      summary: '圆肩驼背的原因和矫正动作', tags: '["体态", "圆肩", "驼背", "矫正"]',
      priority: 9, source: '物理治疗康复指南',
    },
    // 饮食养生
    {
      category: 'diet', subcategory: 'tcm', contentType: 'guide',
      title: '中医九种体质辨识',
      content: '1.平和质：面色红润，精力充沛。2.气虚质：易疲劳，气短懒言。3.阳虚质：怕冷，手脚冰凉。4.阴虚质：口干咽燥，手足心热。5.痰湿质：体型偏胖，面部油腻。6.湿热质：易长痘，口苦口臭。7.血瘀质：面色晦暗，易有瘀斑。8.气郁质：情绪敏感，多愁善感。9.特禀质：易过敏。',
      summary: '中医九种体质的特征描述', tags: '["体质", "中医", "气虚", "阳虚", "阴虚"]',
      priority: 10, source: '中医体质分类与判定标准',
    },
    {
      category: 'diet', subcategory: 'recipe', contentType: 'recipe',
      title: '湿气重推荐：红豆薏米粥',
      content: '材料：红豆50g、薏米50g、芡实20g、山药30g。做法：1. 红豆薏米提前浸泡4小时；2. 所有材料加水煮沸后转小火煮40分钟；3. 可加少量冰糖调味。功效：利水消肿、健脾祛湿。适合：舌苔厚腻、身体沉重、面部油腻者。注意：薏米性寒，经期和孕妇不宜。',
      summary: '祛湿食疗方：红豆薏米粥', tags: '["祛湿", "红豆", "薏米", "食疗", "湿气"]',
      priority: 9, source: '中医食疗养生',
    },
    // 情绪心理
    {
      category: 'mental', subcategory: 'cbt', contentType: 'guide',
      title: '4-7-8呼吸放松法',
      content: '方法：1. 用鼻子吸气4秒；2. 屏住呼吸7秒；3. 用嘴呼气8秒；4. 重复3-4个循环。原理：激活副交感神经，降低心率，缓解焦虑。适用场景：睡前放松、紧张时刻、焦虑发作时。建议：每天练习2次，每次4个循环，坚持2周形成习惯。',
      summary: '4-7-8呼吸法的步骤和原理', tags: '["呼吸", "放松", "焦虑", "CBT", "冥想"]',
      priority: 10, source: '认知行为治疗手册',
    },
    {
      category: 'mental', subcategory: 'anxiety', contentType: 'tip',
      title: '快速缓解焦虑的5个小技巧',
      content: '1. 5-4-3-2-1 grounding：说出5个看到的、4个听到的、3个触摸到的、2个闻到的、1个尝到的；2. 冷水洗脸或握冰块，刺激迷走神经；3. 写下焦虑的事情，然后撕掉；4. 快速走动5分钟，释放肾上腺素；5. 对自己说"这只是焦虑，不是危险"。',
      summary: '5个快速缓解焦虑的实用技巧', tags: '["焦虑", "缓解", "grounding", "技巧"]',
      priority: 9, source: '临床心理学实践',
    },
    // 穿搭形象
    {
      category: 'style', subcategory: 'face_shape', contentType: 'guide',
      title: '脸型与发型的搭配法则',
      content: '圆脸：适合有层次感的中长发、侧分刘海，避免齐刘海和短bob。方脸：适合波浪卷发、斜刘海，柔化下颌线条。长脸：适合空气刘海、横向拓宽的发型。心形脸：适合及肩中长发、碎发刘海平衡宽额头。鹅蛋脸：百搭，大多数发型都适合。',
      summary: '不同脸型适合的发型推荐', tags: '["发型", "脸型", "搭配", "圆脸", "方脸"]',
      priority: 9, source: '形象设计专业指南',
    },
    // 人情世故
    {
      category: 'social', subcategory: 'template', contentType: 'template',
      title: '高情商拒绝话术模板',
      content: '模板1（时间冲突）："谢谢想到我！但这段时间我安排了其他事情，实在抽不开身，下次有机会一定参加。"模板2（能力不足）："这个任务我可能做不来/做不到你期望的水平，建议你找XX，他在这方面更有经验。"模板3（原则问题）："我理解你的需求，但这和我现在的原则/计划不太一致，抱歉帮不上忙。"要点：先感谢+说明原因+提供替代方案。',
      summary: '高情商拒绝他人的话术模板', tags: '["拒绝", "话术", "情商", "沟通"]',
      priority: 10, source: '社交心理学',
    },
    // 财务记账
    {
      category: 'finance', subcategory: 'budget', contentType: 'guide',
      title: '新手理财：50/30/20法则',
      content: '收入分配法则：50%用于必要支出（房租、餐饮、交通、账单）；30%用于个人消费（娱乐、购物、社交）；20%用于储蓄和投资（应急金、定投、保险）。执行步骤：1. 记账1个月了解真实支出；2. 找出可以削减的非必要支出；3. 设置自动转账到储蓄账户；4. 建立3-6个月生活费的应急金。',
      summary: '收入分配的50/30/20法则', tags: '["理财", "预算", "储蓄", "投资", "记账"]',
      priority: 10, source: '个人理财规划指南',
    },
    // 职业发展
    {
      category: 'career', subcategory: 'interview', contentType: 'template',
      title: '面试自我介绍黄金公式',
      content: '公式：背景（1句）+ 核心能力（2-3句）+ 岗位匹配（1句）+ 结尾（1句）。示例："我是XX大学计算机专业的毕业生（背景）。在校期间主导过2个全栈项目，擅长React和Node.js，有完整的上线经验（能力）。看到贵司在招前端工程师，和我做的项目非常契合（匹配）。希望能有机会为贵司贡献我的技术能力（结尾）。"时长：控制在1-2分钟。',
      summary: '面试自我介绍的黄金公式模板', tags: '["面试", "自我介绍", "求职", "简历"]',
      priority: 10, source: '职业咨询实践',
    },
    // 自律习惯
    {
      category: 'habit', subcategory: 'method', contentType: 'guide',
      title: '微习惯养成法：从不可能失败开始',
      content: '核心原则：把目标缩小到"不可能失败"的程度。例如：不要定"每天运动1小时"，改为"每天做1个俯卧撑"。执行步骤：1. 选择1个小到可笑的目标；2. 把它绑定到已有习惯上（如"刷完牙后做1个俯卧撑"）；3. 完成后给自己积极反馈；4. 允许超额完成但不强求；5. 坚持21天后逐步加码。原理：降低心理阻力，通过"完成感"建立正向循环。',
      summary: '微习惯养成法的核心原则和步骤', tags: '["习惯", "自律", "微习惯", "养成", "拖延"]',
      priority: 10, source: '行为心理学研究',
    },
    // 健康管理
    {
      category: 'health', subcategory: 'checkup', contentType: 'guide',
      title: '各年龄段推荐体检项目',
      content: '20-30岁：血常规、尿常规、肝功能、肾功能、血脂、血糖、心电图、腹部B超。30-40岁：增加甲状腺检查、乳腺/前列腺检查、颈椎检查、幽门螺杆菌检测。40-50岁：增加肿瘤标志物筛查、胃肠镜检查、骨密度检查。50岁以上：增加心脑血管检查、眼底检查、颈动脉超声。建议：每年1次全面体检，有家族史的增加专项检查。',
      summary: '不同年龄段的推荐体检项目清单', tags: '["体检", "健康", "筛查", "年龄段"]',
      priority: 9, source: '健康管理指南',
    },
  ];

  for (const k of knowledge) {
    await conn.execute(
      `INSERT INTO knowledge_base (category, subcategory, contentType, title, content, summary, tags, priority, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE content=VALUES(content), summary=VALUES(summary)`,
      [k.category, k.subcategory, k.contentType, k.title, k.content, k.summary, k.tags, k.priority, k.source]
    );
  }

  console.log(`Knowledge base seeded with ${knowledge.length} items!`);
  await conn.end();
}

initSchema().catch(console.error);
