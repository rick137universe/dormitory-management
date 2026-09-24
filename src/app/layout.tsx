import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
export const metadata: Metadata = { title: 'student-housing-maintenance-management-system · Dorma', description: '学生公寓住宿与报修服务 · 前端交互原型' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body><ThemeProvider>{children}</ThemeProvider></body></html>; }
