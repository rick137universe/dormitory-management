import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Dorma · 让校园生活，轻盈运转', description: '学生公寓住宿与报修服务 · 前端交互原型' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
