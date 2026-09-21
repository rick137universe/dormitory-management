# Shared foundation
New Next.js 16 app. Components directory src/components/sites/animejs-com-23cc7dc7/root-8a5edab2. Palette background #252423, panel #2c2b29, foreground #f6f4f2, muted #b4b1af, lines #45433f. Font var(--font-din) then Microsoft YaHei. Mono ui-monospace. Source nav uses 12px/24px, body 20px/25px, headline 64px bold. Adapted styles specified below are intentional business customization. Use CSS module, no inline styles, named exports, no any.
# ServiceSection
Target: src/components/sites/animejs-com-23cc7dc7/root-8a5edab2/ServiceSection.tsx and ServiceSection.module.css
Props: onOpen: (service: 'room'|'repair'|'bill'|'notice-water'|'notice-safety')=>void; repairCount:number.
Structure: section id=services. eyebrow 01 / CAMPUS SERVICES. heading 你的日常，都有回应。 with 40px/1.25. Intro 住宿、报修、缴费，一处就好。. Three full-width columns service cards separated by thin vertical borders, NO pill rounded card stacks. 01 coral room line-art building icon, 02 lime repair wrench icon, 03 lavender wallet icon. Card text 我的住宿, 维修服务, 账单缴费. Mock content 南苑 3 栋 · 502 · 02 床, repairCount 条报修记录, 本月待缴 ¥128.60. Button text 查看住宿 / 提交报修 / 查看账单 and ArrowUpRight icon.
Container max-width 1280px margin auto padding 88px 40px. Cards transparent background, border-top 1px #45433f, 32px inner padding, min-height 285px; hover lightly tinted background transition 180ms. Heading 28px, body 14px/1.7. Accent colors #ff7167 / #d1ed83 / #b5a1ff. On click invoke prop. Avoid nested button.
Second section id=notices, top border, flex layout label 公寓公告, two horizontal notice rows date 09.21 and 09.18, titles 南苑 3 栋供水维护通知 and 秋季宿舍用电安全提醒. Click opens corresponding notice dialog.
Responsive: <=760px single column cards and notices, 24px padding; <=1100px heading 34px.
Interaction model click-driven, cards hover. No remote images: original Lucide icons and CSS lines appropriate for customized business. Use lucide-react ArrowUpRight, Building2, Wrench, Wallet. Screenshot source at docs/design-references/animejs-com-23cc7dc7/root-8a5edab2/source-desktop.png (inspiration, not identical content).
Validate npx tsc --noEmit before completion.
