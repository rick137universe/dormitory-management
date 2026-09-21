# Dorma 校园公寓服务首页

独立项目：D:/03_Workspace/dormitory-management。使用 ai-website-cloner 技能和模板启动；原模板的页面代码未修改。

## 本地运行

需要 Node.js 24 或以上。

```powershell
cd D:\03_Workspace\dormitory-management
npm install
npm run dev -- --port 3100
```

打开 http://localhost:3100 。质量检查：`npm run check`。

## 已实现

- Anime.js 官网风格的暖黑首页、彩色建筑轮廓、环绕轨道与窗户动效。
- 向下滚动，公寓逐层展开；住宿 / 维修 / 账单入口依次高亮。楼层本身与文字入口均可点击。
- 住宿详情、模拟报修提交与记录更新、账单展示、两条公告。
- 手机导航、弹窗键盘操作、动画暂停及系统减少动态效果设置。

使用 Next.js 16 / React 19 / TypeScript / Anime.js 4。公寓为可分层的 SVG 等距视角图形，不是真实 WebGL 三维模型。模拟报修仅保留在本次页面会话，刷新即重置；没有登录、支付或后端接入。

## 源码

- `src/components/sites/animejs-com-23cc7dc7/root-8a5edab2/HomePage.tsx`：首页、滚动进度与弹窗。
- `ResidenceEngine.tsx`：分层公寓 SVG。
- `ServiceSection.tsx`：服务与公告区域。
- `src/lib/mock-campus.ts`：模拟数据，后续可由接口层替换。
- `docs/research/`：参考提取、输出计划、三份组件规格。
- `docs/design-references/` 与 `docs/qa/`：参考图及本地验证截图。

## 参考和范围

参考 https://animejs.com/ 首页，目标路由 `/`。保留深色调、大标题、环形动效、滚动叙事；按用户要求改为公寓主题、中文文案及楼层拆解，因此不是 Anime.js 官网的逐像素复制。未复制官网三维引擎模型。字体 DINish 从目标网站加载并保存于 `public/sites/animejs-com-23cc7dc7/shared/dinish.woff2`，中文使用系统字体；图形由 SVG 实现。

共三项主体组件（首页、分层公寓、服务区），三份规格；页面包含导航、首屏、滚动拆解、服务、公告和页脚。下载一份字体，无图片或视频依赖。

## 验证

已完成 1440px 桌面、768px 平板、390px 手机检查，手机/平板无横向溢出。报修提交、账单弹窗、手机菜单、Escape 关闭通过；浏览器未捕获运行错误。减少动态效果时停止循环动画并静态展开。检查记录见 `docs/qa/results.json`。
