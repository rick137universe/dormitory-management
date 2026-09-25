export type Service = 'room' | 'repair' | 'bill' | 'profile' | 'notice-water' | 'notice-safety';
export interface RepairRecord { id: string; title: string; status: string; date: string; }
export const student = { name: '林同学', building: '南苑 3 栋', room: '502', bed: '02', term: '2026 — 2027 学年', campus: '南苑生活区' };
export const initialRepairs: RepairRecord[] = [{id:'BX20260918001', title:'卫生间水龙头漏水', status:'处理中',date:'09.18'},{id:'BX20260912002',title:'书桌灯管不亮',status:'已完成',date:'09.12'}];
export const bill = { accommodation: 0, water: 28.60, electricity: 100, total: 128.60, month: '2026 年 9 月' };
