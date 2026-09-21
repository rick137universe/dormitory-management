export type RoleId = 'student' | 'dormManager' | 'maintenance' | 'admin';
export type ModuleId = 'personal' | 'base' | 'accommodation' | 'bed' | 'payment' | 'repair' | 'analytics' | 'system';

export interface DemoAccount {
  role: RoleId;
  username: string;
  password: string;
  displayName: string;
  roleName: string;
  scope: string;
}

export interface WorkspaceMetric { label: string; value: string; note: string; tone: 'lime' | 'peach' | 'violet' | 'blue'; }
export interface WorkspaceTask { id: string; title: string; meta: string; status: string; }

export const demoAccounts: DemoAccount[] = [
  { role: 'student', username: '202602341', password: 'Dorma2026', displayName: '林晓屿', roleName: '学生', scope: '仅访问本人住宿业务与公开信息' },
  { role: 'dormManager', username: 'dm0301', password: 'Dorma2026', displayName: '周老师', roleName: '宿管人员', scope: '管理南苑 3 栋的学生、房间与床位' },
  { role: 'maintenance', username: 'wx008', password: 'Dorma2026', displayName: '陈师傅', roleName: '维修人员', scope: '查看本人接收的维修工单与统计' },
  { role: 'admin', username: 'admin', password: 'Dorma2026', displayName: '系统管理员', roleName: '系统管理员', scope: '管理全系统数据、流程、权限与备份' },
];

export const moduleCatalog: Record<ModuleId, { index: string; name: string; short: string }> = {
  personal: { index: '01', name: '个人中心', short: '资料、密码、消息与待办' },
  base: { index: '02', name: '基础信息', short: '学生、楼栋、房间与床位' },
  accommodation: { index: '03', name: '住宿业务', short: '入住、调宿与退宿流程' },
  bed: { index: '04', name: '床位状态', short: '床位流转与异常校验' },
  payment: { index: '05', name: '缴费管理', short: '账单、缴费、欠费与明细' },
  repair: { index: '06', name: '报修维修', short: '报修、初审、派工与评价' },
  analytics: { index: '07', name: '统计分析', short: '入住率、欠费与维修指标' },
  system: { index: '08', name: '系统管理', short: '权限、公告、备份与参数' },
};

export const roleWorkspace: Record<RoleId, {
  greeting: string;
  caption: string;
  modules: ModuleId[];
  metrics: WorkspaceMetric[];
  tasks: WorkspaceTask[];
  focusTitle: string;
  focusRows: Array<{ label: string; value: string; detail: string }>;
}> = {
  student: {
    greeting: '下午好，林晓屿', caption: '你的入住、缴费和报修进度都在这里。',
    modules: ['personal', 'accommodation', 'payment', 'repair'],
    metrics: [
      { label: '当前床位', value: '502 · 02', note: '南苑 3 栋 / 已入住', tone: 'lime' },
      { label: '本月待缴', value: '¥ 128.60', note: '水费与电费', tone: 'violet' },
      { label: '报修进度', value: '1 处理中', note: '水龙头漏水', tone: 'peach' },
      { label: '未读消息', value: '3', note: '含 1 条缴费提醒', tone: 'blue' },
    ],
    tasks: [
      { id: 'ST-01', title: '确认 2026—2027 学年住宿信息', meta: '住宿业务 · 今天', status: '待确认' },
      { id: 'BX-0918', title: '卫生间水龙头漏水', meta: '维修师傅已接单', status: '处理中' },
      { id: 'ZF-09', title: '缴纳 9 月水电费', meta: '截止 09.28', status: '待缴费' },
    ],
    focusTitle: '我的住宿', focusRows: [
      { label: '房间', value: '502 室', detail: '四人间 · 独立卫浴' },
      { label: '床位', value: '02 床', detail: '状态正常' },
      { label: '入住日期', value: '2026.09.01', detail: '自动分配' },
    ],
  },
  dormManager: {
    greeting: '下午好，周老师', caption: '南苑 3 栋今日有 12 项业务需要处理。',
    modules: ['personal', 'base', 'accommodation', 'bed', 'payment', 'repair', 'analytics'],
    metrics: [
      { label: '楼栋入住率', value: '92.8%', note: '371 / 400 床', tone: 'lime' },
      { label: '住宿申请', value: '8', note: '入住 5 · 调宿 2 · 退宿 1', tone: 'blue' },
      { label: '报修初审', value: '4', note: '其中 1 项较紧急', tone: 'peach' },
      { label: '欠费学生', value: '17', note: '合计 ¥ 2,846.40', tone: 'violet' },
    ],
    tasks: [
      { id: 'RZ-0328', title: '王同学入住申请与床位分配', meta: '5 层 · 可分配 3 个床位', status: '待审核' },
      { id: 'TS-0082', title: '502 → 406 调宿申请', meta: '目标床位当前空闲', status: '待审核' },
      { id: 'BX-0921', title: '公共洗衣区排水异常', meta: '信息完整 · 建议上报', status: '待初审' },
    ],
    focusTitle: '床位总览', focusRows: [
      { label: '已入住', value: '371', detail: '92.8%' },
      { label: '空闲床位', value: '25', detail: '可立即分配 21' },
      { label: '维修停用', value: '4', detail: '预计本周恢复' },
    ],
  },
  maintenance: {
    greeting: '下午好，陈师傅', caption: '今天已完成 3 单，还有 4 个派发工单。',
    modules: ['personal', 'repair', 'analytics'],
    metrics: [
      { label: '今日工单', value: '7', note: '已完成 3 · 待处理 4', tone: 'peach' },
      { label: '处理中', value: '2', note: '最早派工 10:20', tone: 'blue' },
      { label: '本月完成率', value: '94.6%', note: '53 / 56 单', tone: 'lime' },
      { label: '服务评分', value: '4.9', note: '本月 41 次评价', tone: 'violet' },
    ],
    tasks: [
      { id: 'BX-0918', title: '502 室卫生间水龙头漏水', meta: '水电设施 · 已接单 14:06', status: '处理中' },
      { id: 'BX-0920', title: '312 室空调无法制冷', meta: '空调设备 · 距离 120 m', status: '待处理' },
      { id: 'BX-0921', title: '公共洗衣区排水异常', meta: '公共区域 · 宿管已初审', status: '新工单' },
    ],
    focusTitle: '今日路线', focusRows: [
      { label: '14:30', value: '南苑 3 栋 502', detail: '水龙头漏水' },
      { label: '15:10', value: '南苑 3 栋 312', detail: '空调无法制冷' },
      { label: '16:00', value: '南苑 3 栋 1F', detail: '洗衣区排水' },
    ],
  },
  admin: {
    greeting: '下午好，系统管理员', caption: '全校公寓运行正常，当前有 6 项全局待办。',
    modules: ['personal', 'base', 'accommodation', 'bed', 'payment', 'repair', 'analytics', 'system'],
    metrics: [
      { label: '全校入住率', value: '91.4%', note: '6,582 / 7,200 床', tone: 'lime' },
      { label: '待派工', value: '13', note: '较昨日减少 6 单', tone: 'peach' },
      { label: '本月欠费', value: '¥ 48.2k', note: '涉及 286 名学生', tone: 'violet' },
      { label: '系统状态', value: '正常', note: '昨夜备份成功', tone: 'blue' },
    ],
    tasks: [
      { id: 'PG-0921', title: '为 13 个待处理报修工单派工', meta: '覆盖 6 栋公寓', status: '待派工' },
      { id: 'DR-01', title: '核对新学期批量导入结果', meta: '6,824 条 · 2 条待修正', status: '待处理' },
      { id: 'BK-0922', title: '执行系统升级前完整备份', meta: '计划 09.22 02:00', status: '已计划' },
    ],
    focusTitle: '全局运行', focusRows: [
      { label: '数据规模', value: '6,824 学生', detail: '24 栋 · 1,836 房间' },
      { label: '维修效率', value: '93.2%', detail: '本月按时完成率' },
      { label: '最近备份', value: '09.21 02:00', detail: '校验通过 · 18.4 GB' },
    ],
  },
};
