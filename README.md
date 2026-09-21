# Dorma 连续三维公寓首页

独立项目：D:/03_Workspace/dormitory-management。原 ai-website-cloner 模板代码未修改。

## 启动

Node.js 24 或以上。

```powershell
cd D:\03_Workspace\dormitory-management
npm install
npm run dev -- --port 3100
```

访问 http://localhost:3100 。检查命令：`npm run check`。

## 当前版本

全页一个持久 WebGL 画布、一个公寓模型。Next.js 16 / React 19 / TypeScript / Three.js / Anime.js。

原先的两组 SVG 模型已从页面移除。滚动推动同一条 Anime.js 时间轴，连续控制模型旋转、25 个部件的展开、镜头缩放、背景颜色和线稿材质：

1. 完整五层公寓，显示阳台、玻璃窗、窗框、屋顶光伏和水箱。
2. 公寓转向，外墙开始分离。
3. 浅色住宿场景，露出房间、床铺、书桌和柜子。
4. 维修场景，突出空调与水管系统。
5. 账单场景，突出电表与配电线路。
6. 浅色建筑线稿全貌，楼板、外墙、屋顶、服务设备完整展开。

向上滚动可逆向组装。顶部及底部导航沿相同时间轴转场；进度条可拖动。点击模型能进入其所属功能，文字按钮提供键盘等价入口。

住宿详情、模拟报修提交与记录更新、账单和公告保留。数据仅在当前页面会话保存，刷新重置，没有真实后端、身份认证或支付。

## 代码入口

- `src/components/sites/animejs-com-23cc7dc7/root-8a5edab2/HomePage.tsx`：滚动叙事、业务弹窗。
- `ContinuousResidence.tsx`：唯一 WebGL 场景、Anime.js 时间轴、点击拾取和资源释放。
- `residence-model.ts`：程序化三维建筑、25 个可拆部件、合并几何体。
- `Narrative.module.css`：固定场景上的文字、导航和移动布局。
- `src/lib/mock-campus.ts`：模拟业务数据。

## 参考与范围

参考 https://animejs.com/ 的单模型滚动叙事、拆解旋转和浅色线稿过渡。公寓为原创程序化几何模型，不是官网下载的机械引擎模型，也不声称逐像素还原。源站字体 DINish 延用前版本地资产；无新增远程图片、模型或纹理依赖。

研究与分镜位于 `docs/research/animejs-com-23cc7dc7/root-8a5edab2/revision-2/`。桌面与手机截图、交互检查在 `docs/qa/revision-2/`。旧版截图仅作历史记录。

## 验证范围

检查唯一 canvas 跨章节保持同一 DOM 实例，25 个部件；桌面六场景无运行异常。报修提交、账单、住宿、手机菜单、Escape 和减少动态效果测试通过。模型使用合并几何体，当前约 298 次渲染调用（包含轮廓与地网格），并限制渲染像素比。尚未在实体低端手机上测量性能；不支持 WebGL 的浏览器会保留文字功能入口并显示提示。
