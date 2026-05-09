# AI小蜜 (AI XiaoMi)

<p align="center">
  <img src="/public/logo.png" alt="AI小蜜 Logo" width="120" />
</p>

<h1 align="center">AI小蜜 - 你的专属AI数字分身管家</h1>

<p align="center">
  全天候 · 全场景 · 有温度的数字分身助手
</p>

<p align="center">
  <a href="#功能特点">功能特点</a> ·
  <a href="#技术栈">技术栈</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#项目结构">项目结构</a> ·
  <a href="#环境变量">环境变量</a> ·
  <a href="#许可证">许可证</a>
</p>

---

## 📋 项目简介

**AI小蜜** 是一款基于AI的数字分身管家应用，为用户提供12大维度的智能服务。通过先进的人工智能技术和精美的UI设计，帮助用户管理日常生活、提升生活质量。

### 🎯 核心价值

- **全场景覆盖**：从睡眠助眠到职业发展，全方位守护你的生活
- **个性化体验**：支持4种不同性格的AI人设（灵智、胡歌、悟空、若琪）
- **智能交互**：自然语言对话，懂你所需
- **数据驱动**：基于用户行为和偏好，提供精准建议

---

## ✨ 功能特点

### 🌙 12大服务维度

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| **睡眠助眠** | 白噪音、冥想引导、睡眠质量分析 | ✅ 已完成 |
| **情绪疏导** | 情感陪伴、心理疏导、压力释放 | ✅ 已完成 |
| **护肤管理** | 肤质测评、护肤建议、产品推荐 | ✅ 已完成 |
| **健身塑形** | 健身计划、动作指导、进度追踪 | ✅ 已完成 |
| **饮食养生** | 饮食建议、营养分析、食谱推荐 | ✅ 已完成 |
| **穿搭形象** | 穿搭建议、形象管理、风格塑造 | ✅ 已完成 |
| **人情世故** | 社交建议、人际关系管理 | ✅ 已完成 |
| **财务记账** | 收支记录、财务分析、理财建议 | ✅ 已完成 |
| **职业发展** | 职业规划、技能提升、职场建议 | ✅ 已完成 |
| **闲聊陪伴** | 日常聊天、趣味互动、情感陪伴 | ✅ 已完成 |
| **自律打卡** | 习惯养成、目标管理、连续打卡 | ✅ 已完成 |
| **健康管理** | 健康数据、体检提醒、养生建议 | ✅ 已完成 |

### 🎨 核心特色

- **🎭 多人格AI系统**：4种不同性格的AI人设，满足不同场景需求
- **💬 智能对话**：基于tRPC的类型安全API通信
- **📊 数据可视化**：Recharts图表展示健康、财务等数据
- **🎯 个性化推荐**：基于用户画像的精准内容推荐
- **📱 移动优先**：响应式设计，完美适配移动端
- **🌙 暗色主题**：精致的霓虹色调设计，护眼舒适

---

## 🛠️ 技术栈

### 前端技术

- **框架**：[React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**：[Vite 7](https://vitejs.dev/)
- **路由管理**：[React Router 7](https://reactrouter.com/)
- **状态管理**：[TanStack React Query](https://tanstack.com/query/latest)
- **API通信**：[tRPC 11](https://trpc.io/)
- **UI组件**：[Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **表单处理**：[React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **图标库**：[Lucide React](https://lucide.dev/)
- **图表库**：[Recharts](https://recharts.org/)

### 后端技术

- **运行环境**：[Node.js](https://nodejs.org/)
- **Web框架**：[Hono](https://hono.dev/)
- **API层**：[tRPC](https://trpc.io/)
- **ORM**：[Drizzle ORM](https://orm.drizzle.team/)
- **数据库**：MySQL
- **认证**：JWT (jose)
- **文件存储**：AWS S3

### 开发工具

- **代码规范**：[ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **类型检查**：TypeScript 5.9
- **测试框架**：[Vitest](https://vitest.dev/)
- **容器化**：[Docker](https://www.docker.com/)

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/lianhuaijin1981/AIXiaoMi.git
cd AIXiaoMi
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=mysql://user:password@localhost:3306/ai_xiaomi

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key

# OAuth配置（Kimi）
VITE_KIMI_AUTH_URL=https://kimi.moonshot.cn
VITE_APP_ID=your-app-id

# AWS S3配置（可选）
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

4. **数据库初始化**

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 种子数据（可选）
npm run db:seed
```

5. **启动开发服务器**

```bash
# 前端开发服务器（默认端口5173）
npm run dev

# API开发服务器（需要单独启动）
npm run dev:api
```

6. **构建生产版本**

```bash
npm run build
npm run start
```

---

## 📁 项目结构

```
AIXiaoMi/
├── api/                    # 后端API
│   ├── auth-router.ts     # 认证路由
│   ├── chat-router.ts     # 聊天路由
│   ├── task-router.ts     # 任务管理路由
│   ├── schedule-router.ts # 日程管理路由
│   ├── user-router.ts     # 用户管理路由
│   ├── knowledge-router.ts# 知识库路由
│   ├── avatar-router.ts   # 头像管理路由
│   ├── middleware.ts      # tRPC中间件
│   ├── context.ts         # 上下文处理
│   └── boot.ts           # 启动入口
├── contracts/             # 类型契约
├── db/                    # 数据库
│   ├── schema.ts         # 数据库表定义
│   ├── relations.ts      # 表关系定义
│   └── migrations/       # 数据库迁移文件
├── public/                # 静态资源
├── src/                   # 前端源代码
│   ├── components/       # React组件
│   │   └── ui/          # UI组件库（52个组件）
│   ├── hooks/            # 自定义Hooks
│   ├── lib/             # 工具库
│   ├── pages/           # 页面组件
│   │   ├── Home.tsx     # 首页（Landing Page）
│   │   ├── Dashboard.tsx# 仪表盘
│   │   ├── Chat.tsx     # 聊天页面
│   │   ├── Login.tsx    # 登录页面
│   │   └── ...          # 其他页面
│   ├── providers/       # Provider组件
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   ├── App.css          # 应用样式
│   └── index.css        # 全局样式
├── .env.example           # 环境变量示例
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
├── tailwind.config.js    # Tailwind配置
├── drizzle.config.ts     # Drizzle ORM配置
└── README.md            # 项目说明
```

---

## 🔧 可用的脚本命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动前端开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run lint` | 运行ESLint检查 |
| `npm run preview` | 预览生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run check` | TypeScript类型检查 |
| `npm run format` | Prettier代码格式化 |
| `npm run test` | 运行单元测试 |
| `npm run db:generate` | 生成Drizzle迁移文件 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:push` | 推送Schema到数据库 |

---

## 🔐 认证系统

### OAuth 2.0 集成

项目集成了Kimi OAuth认证系统：

1. **登录流程**：
   - 用户点击"Sign in with Kimi"
   - 跳转到Kimi授权页面
   - 授权成功后回调到 `/api/oauth/callback`
   - 后端验证并创建会话
   - 返回JWT Token

2. **API认证**：
   - 使用 `jose` 库处理JWT
   - 通过Cookie存储会话信息
   - tRPC中间件验证用户身份

3. **权限控制**：
   - `publicQuery`：公开接口
   - `authedQuery`：需要认证
   - `adminQuery`：需要管理员权限

---

## 📊 数据库设计

### 核心表结构

<details>
<summary>点击查看完整数据库表设计</summary>

```sql
-- 用户表
users: id, unionId, name, email, avatar, role, createdAt, updatedAt, lastSignInAt

-- 数字分身画像表
avatars: id, userId, faceShape, skinTone, hairType, hairColor, bodyShape, 
         height, weight, shoulderWidth, waistWidth, hipWidth, faceFeatures,
         activePersona, frontPhotoUrl, sidePhotoUrl, fullBodyPhotoUrl

-- 用户扩展资料表
userProfiles: id, userId, activePersona, age, gender, height, weight,
              skinType, bodyType, tcmConstitution, fitnessGoal, sleepGoal,
              streakDays, totalMessages

-- 虚拟人设表
personas: id, personaKey, name, title, avatarImage, voiceType,
          personality, speakingStyle, expertiseAreas, systemPrompt,
          greetingTemplate, isDefault, isActive, sortOrder

-- 测评记录表
assessments: id, userId, assessmentType, answers, resultLabel,
             resultScore, resultDetails, recommendations

-- 知识库表
knowledgeBase: id, category, subcategory, contentType, title,
               content, summary, conditions, tags, priority,
               targetAudience, isActive, source

-- 聊天记录表
messages: id, userId, role, content, persona, knowledgeId,
          intentCategory, mediaUrl, mediaType

-- 任务表
tasks: id, userId, title, category, priority, completed,
       dueTime, dueDate, repeatPattern

-- 日程表
events: id, userId, title, description, location, type,
        startTime, endTime, allDay, isRecurring,
        recurrenceRule, remindBefore

-- 联系人表
contacts: id, userId, name, relationship, phone, birthday,
          personality, hobbies, importantDates, giftPreferences

-- 交易记录表
transactions: id, userId, amount, type, category, subcategory,
              description, merchant, voiceText, transactionDate
```

</details>

---

## 🎨 UI组件库

项目包含52个完整的UI组件，基于Radix UI和Tailwind CSS构建：

### 表单组件
`button`, `input`, `textarea`, `checkbox`, `radio-group`, `switch`, `select`, `form`, `field`, `label`, `input-otp`, `input-group`, `button-group`

### 布局组件
`card`, `dialog`, `alert-dialog`, `drawer`, `sheet`, `sidebar`, `separator`, `resizable`, `aspect-ratio`

### 导航组件
`navigation-menu`, `breadcrumb`, `menubar`, `dropdown-menu`, `context-menu`, `pagination`, `tabs`

### 数据展示
`table`, `calendar`, `chart`, `carousel`, `avatar`, `scroll-area`, `alert`, `badge`, `progress`, `skeleton`, `spinner`, `sonner`, `tooltip`, `hover-card`, `popover`, `empty`

### 交互组件
`accordion`, `collapsible`, `command`, `slider`, `toggle`, `toggle-group`, `item`, `kbd`

---

## 🌐 部署指南

### Docker部署

1. **构建Docker镜像**

```bash
docker build -t ai-xiaomi .
```

2. **运行容器**

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=your-database-url \
  -e JWT_SECRET=your-jwt-secret \
  --name ai-xiaomi \
  ai-xiaomi
```

### 传统部署

1. **构建项目**

```bash
npm run build
```

2. **配置环境变量**

确保生产环境配置了正确的 `.env` 文件

3. **启动服务**

```bash
npm run start
```

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 提交前运行 `npm run lint` 和 `npm run format`
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📧 联系方式

- **作者**：lianhuaijin1981
- **GitHub**：[@lianhuaijin1981](https://github.com/lianhuaijin1981)
- **项目链接**：[https://github.com/lianhuaijin1981/AIXiaoMi](https://github.com/lianhuaijin1981/AIXiaoMi)

---

<p align="center">
  ⭐️ 如果这个项目对你有帮助，请给它一个星标！⭐️
</p>
