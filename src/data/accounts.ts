export type RoleId = 'student' | 'dormManager' | 'maintenance' | 'admin';

export interface DemoAccount {
  role: RoleId;
  username: string;
  password: string;
  displayName: string;
  roleName: string;
  scope: string;
}

export const demoAccounts: DemoAccount[] = [
  { role: 'student', username: '202602341', password: 'Dorma2026', displayName: '林晓屿', roleName: '学生', scope: '仅访问本人住宿业务与公开信息' },
  { role: 'dormManager', username: 'dm0301', password: 'Dorma2026', displayName: '周老师', roleName: '宿管人员', scope: '管理南苑 3 栋的学生、房间与床位' },
  { role: 'maintenance', username: 'wx008', password: 'Dorma2026', displayName: '陈师傅', roleName: '维修人员', scope: '查看本人接收的维修工单与统计' },
  { role: 'admin', username: 'admin', password: 'Dorma2026', displayName: '系统管理员', roleName: '系统管理员', scope: '管理全系统数据、流程、权限与备份' },
];
