# student-housing-maintenance-management-system

Dorma 是面向学生、宿管、维修人员和系统管理员的校园住宿服务前端演示。首页用镜头与滚动动画展示当前身份可用的业务；顶部功能导航始终可见，点击任意功能会直接进入对应的详情页，无需先滚动到该章节。

## 本地运行

需要 Node.js 24 或以上。

```powershell
npm install
npm run dev -- --port 3100
```

打开 <http://localhost:3100>。提交前运行 `npm run check`，它会依次执行 ESLint、TypeScript 类型检查和生产构建。

## 演示方式

点击首页的「登录工作台」，选择身份，或输入以下演示账号。所有账号的密码都是 `Dorma2026`。

| 身份 | 用户名 | 首页功能数 |
| --- | --- | ---: |
| 学生 | `202602341` | 5 |
| 宿管人员 | `dm0301` | 5 |
| 维修人员 | `wx008` | 4 |
| 系统管理员 | `admin` | 6 |

登录后，顶部导航按当前身份列出全部功能。点击导航项会直接打开该功能的第一个详情操作。也可以继续滚动首页镜头，或使用右侧操作卡进入具体业务。详情页地址格式为 `/workspace/{role}/{feature}/{action}`，页内可切换同一功能的其他操作。顶部主题切换支持跟随系统、浅色和深色。

## 代码位置

- `src/components/sites/animejs-com-23cc7dc7/root-8a5edab2/HomePage.tsx`：登录后的首页、滚动章节、顶部导航及详情入口。
- 同目录的 `LensHome.module.css`、`LensExperience.tsx`、`LensMotionDetails.tsx`：首页布局、镜头和动画。
- 同目录的 `WorkspaceRoute.tsx`、`ActionWorkspace.tsx`、`MaintenanceWorkspace.tsx`、`RepairWorkspace.tsx`：业务详情与演示交互。
- `src/lib/role-experiences.ts`：各身份可用的功能与操作清单。
- `src/lib/role-workspaces.ts`：演示账号及工作台数据。
- `src/lib/demo-session.ts`：浏览器会话中的演示身份。

这是前端演示：账号、业务数据与表单操作均为模拟内容；没有真实身份认证、后端持久化或支付接口。演示身份保存在当前浏览器的 `sessionStorage`，关闭会话后需要重新登录。

## 协作

克隆仓库后安装依赖，基于最新代码开发，提交前执行 `npm run check`。新增或调整功能时，保持 `role-experiences.ts` 中的功能 ID、操作 ID 与详情页路径一致。
