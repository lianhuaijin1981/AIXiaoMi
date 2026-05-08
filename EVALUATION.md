# 爱小蜜 APP 上线评估报告

## 当前状态
- ✅ 前端6大页面已完成（Landing/Dashboard/Chat/Schedule/Tasks/Profile）
- ✅ 视觉设计系统（暗黑霓虹主题）
- ✅ 响应式布局 + 移动端适配
- ❌ 无后端API，所有数据为前端Mock
- ❌ 无数据库持久化
- ❌ 无用户认证
- ❌ 无AI对话真实能力

---

## P0（必须完成，否则无法上线）

### 1. 后端基础设施
- tRPC + Hono HTTP服务器
- Drizzle ORM + MySQL数据库连接
- OAuth 2.0 用户认证（Kimi登录）
- 前后端类型安全通信

### 2. 数据库Schema
- `users` - 用户信息表（OAuth用户）
- `conversations` - 对话/消息表
- `tasks` - 任务清单表
- `events` - 日程/日历事件表
- `user_profiles` - 用户扩展资料（体质/肤质/习惯等）
- `habit_logs` - 习惯打卡记录表

### 3. API Routers
- `auth` - 登录/登出/获取当前用户（已由init.sh生成）
- `chat` - 发送消息、获取历史、AI回复（需调用LLM）
- `task` - CRUD任务、toggle完成状态
- `schedule` - CRUD日程事件
- `user` - 获取/更新用户资料、头像人设切换

### 4. AI对话能力
- 后端调用LLM API（基于用户人设生成回复）
- 系统Prompt工程（包含12个维度的人设知识）
- 对话上下文管理（最近的N轮对话）

### 5. 前端接入
- tRPC Provider替换所有Mock数据
- useAuth Hook接入登录状态
- 消息、任务、日程全部走真实API
- 加载状态、错误处理

---

## P1（上线后2周内完成）

- 睡眠记录分析（sleep_logs表）
- 情绪追踪图表（mood_logs表）
- 记账/财务数据（transactions表）
- 人脉档案（contacts表）
- 体质/肤质测评记录
- 推送通知系统（Web Push）
- 离线缓存（IndexedDB）
- 数据导出/备份

---

## 实现计划
1. 初始化backend-building（auth + db）
2. 设计并推送数据库Schema
3. 实现所有tRPC routers
4. 接入LLM实现AI对话
5. 前端全部替换为真实API调用
6. 构建 + 版本管理器保存
