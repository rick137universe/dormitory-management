'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight, BarChart3, BedDouble, Bell, Building2, Check, ChevronRight,
  CircleUserRound, ClipboardCheck, CreditCard, Database, DoorOpen, HardHat,
  KeyRound, LayoutDashboard, LogOut, PackageCheck, Search,
  Settings2, ShieldCheck, UsersRound, Wrench, X,
  type LucideIcon,
} from 'lucide-react';
import {
  demoAccounts, moduleCatalog, roleWorkspace,
  type DemoAccount, type ModuleId,
} from '@/lib/role-workspaces';
import { ModulePage } from './ModulePage';
import s from './RolePortal.module.css';

interface Props {
  open: boolean;
  requestedView: 'overview' | ModuleId;
  onClose: () => void;
  onViewChange: (view: 'overview' | ModuleId) => void;
  onSessionChange: (account: DemoAccount | null) => void;
}

const moduleIcons: Record<ModuleId, LucideIcon> = {
  personal: CircleUserRound,
  base: Database,
  accommodation: DoorOpen,
  bed: BedDouble,
  payment: CreditCard,
  repair: Wrench,
  analytics: BarChart3,
  system: Settings2,
};

const roleIcons: Record<DemoAccount['role'], LucideIcon> = {
  student: UsersRound,
  dormManager: Building2,
  maintenance: HardHat,
  admin: ShieldCheck,
};

function taskDestination(taskId: string): ModuleId {
  if (taskId.startsWith('BX') || taskId.startsWith('PG')) return 'repair';
  if (taskId.startsWith('ZF')) return 'payment';
  if (taskId.startsWith('DR')) return 'base';
  if (taskId.startsWith('BK')) return 'system';
  return 'accommodation';
}

export function RolePortal({ open, requestedView, onClose, onViewChange, onSessionChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [account, setAccount] = useState<DemoAccount | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const setActiveView = onViewChange;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  function fillDemo(next: DemoAccount) {
    setUsername(next.username);
    setPassword(next.password);
    setError('');
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const match = demoAccounts.find(item => item.username === username.trim() && item.password === password);
    if (!match) {
      setError('账号或密码不正确。可点击下方演示身份自动填入。');
      return;
    }
    setAccount(match);
    const allowed = requestedView === 'overview' || roleWorkspace[match.role].modules.includes(requestedView);
    setActiveView(allowed ? requestedView : 'overview');
    onSessionChange(match);
    setError('');
    setToast('');
  }

  function logout() {
    setAccount(null);
    onSessionChange(null);
    setUsername('');
    setPassword('');
    setToast('');
  }

  function action(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  }

  const workspace = account ? roleWorkspace[account.role] : null;
  const activeView = account && requestedView !== 'overview' && !roleWorkspace[account.role].modules.includes(requestedView) ? 'overview' : requestedView;

  return (
    <dialog
      ref={dialog}
      className={s.portal}
      aria-labelledby="portal-title"
      onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
    >
      {!account ? (
        <div className={s.loginShell}>
          <section className={s.loginBrand}>
            <button className={s.closeLight} onClick={() => dialog.current?.close()} aria-label="关闭登录"><X /></button>
            <p className={s.kicker}>DORMA / ACCESS CONTROL</p>
            <h2 id="portal-title">进入你的<br />公寓工作台。</h2>
            <p>账号决定你能看到的数据与操作。这里用演示账号模拟基于角色的权限控制。</p>
            <div className={s.blueprint} aria-hidden="true">
              <Building2 />
              <span>04 ROLES</span><span>08 MODULES</span><span>01 SYSTEM</span>
            </div>
          </section>
          <section className={s.loginPanel}>
            <button className={s.closeDark} onClick={() => dialog.current?.close()} aria-label="关闭登录"><X /></button>
            <div className={s.loginHeading}><span><KeyRound size={18} /></span><div><small>身份认证</small><h3>登录 Dorma</h3></div></div>
            <form onSubmit={login} className={s.loginForm}>
              <label>账号<input autoFocus autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} placeholder="学号 / 工号 / 管理员账号" /></label>
              <label>密码<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="请输入密码" /></label>
              {error && <p className={s.loginError} role="alert">{error}</p>}
              <button className={s.loginButton} type="submit">登录工作台 <ArrowRight size={17} /></button>
            </form>
            <div className={s.demoAccounts}>
              <div className={s.demoHeader}><span>演示账号</span><small>点击身份自动填入</small></div>
              <div className={s.demoGrid}>
                {demoAccounts.map(item => {
                  const Icon = roleIcons[item.role];
                  return <button key={item.role} onClick={() => fillDemo(item)} data-selected={username === item.username}>
                    <Icon size={17} /><span><strong>{item.roleName}</strong><small>{item.username}</small></span><ChevronRight size={13} />
                  </button>;
                })}
              </div>
              <p>四组账号的演示密码均为 <code>Dorma2026</code></p>
            </div>
          </section>
        </div>
      ) : workspace && (
        <div className={s.workspaceShell}>
          <aside className={s.sidebar}>
            <button className={s.workspaceLogo} onClick={() => setActiveView('overview')}>dorma<span>●</span></button>
            <div className={s.identity}>
              <span>{account.displayName.slice(0, 1)}</span>
              <div><strong>{account.displayName}</strong><small>{account.roleName}</small></div>
            </div>
            <nav aria-label={`${account.roleName}功能导航`}>
              <p>工作台</p>
              <button data-active={activeView === 'overview'} onClick={() => setActiveView('overview')}><LayoutDashboard size={17} />概览</button>
              <p>功能模块</p>
              {workspace.modules.map(moduleId => {
                const Icon = moduleIcons[moduleId];
                return <button key={moduleId} data-active={activeView === moduleId} onClick={() => setActiveView(moduleId)}><Icon size={17} />{moduleCatalog[moduleId].name}<span>{moduleCatalog[moduleId].index}</span></button>;
              })}
            </nav>
            <div className={s.scope}><ShieldCheck size={15} /><p><strong>当前权限范围</strong>{account.scope}</p></div>
            <button className={s.logout} onClick={logout}><LogOut size={16} />退出登录</button>
          </aside>
          <main className={s.workspaceMain}>
            <header className={s.workspaceHeader}>
              <div><p>DORMA / {account.role.toUpperCase()}</p><h2 id="portal-title">{activeView === 'overview' ? '工作台概览' : moduleCatalog[activeView].name}</h2></div>
              <div className={s.headerTools}><label><Search size={15} /><input aria-label="搜索" placeholder="搜索业务、工单或学生" /></label><button aria-label="消息通知"><Bell size={18} /><i /></button><button onClick={() => dialog.current?.close()} aria-label="关闭工作台"><X size={19} /></button></div>
            </header>
            <div className={s.workspaceContent}>
              {activeView === 'overview' ? <>
              <section className={s.welcome}>
                <div><p>{workspace.greeting}</p><h3>{workspace.caption}</h3></div>
                <button onClick={() => setActiveView(workspace.modules.find(moduleId => moduleId !== 'personal') ?? 'personal')}>处理当前业务 <ArrowRight size={16} /></button>
              </section>
              <section className={s.metrics} aria-label="关键指标">
                {workspace.metrics.map(metric => <article key={metric.label} data-tone={metric.tone}><span>{metric.label}</span><strong>{metric.value}</strong><p>{metric.note}</p><i /></article>)}
              </section>
              <div className={s.dashboardGrid}>
                <section className={s.taskPanel}>
                  <div className={s.panelTitle}><div><small>TODO QUEUE</small><h3>待办事项</h3></div><span>{workspace.tasks.length}</span></div>
                  <div className={s.taskList}>{workspace.tasks.map(task => <button key={task.id} onClick={() => setActiveView(taskDestination(task.id))}><span data-status={task.status}><ClipboardCheck size={16} /></span><div><strong>{task.title}</strong><small>{task.id} · {task.meta}</small></div><em>{task.status}</em><ChevronRight size={15} /></button>)}</div>
                </section>
                <section className={s.focusPanel}>
                  <div className={s.panelTitle}><div><small>LIVE OVERVIEW</small><h3>{workspace.focusTitle}</h3></div><PackageCheck size={20} /></div>
                  <div className={s.focusRows}>{workspace.focusRows.map(row => <div key={row.label}><span>{row.label}</span><strong>{row.value}</strong><small>{row.detail}</small></div>)}</div>
                  <button onClick={() => setActiveView(account.role === 'student' ? 'accommodation' : account.role === 'maintenance' ? 'repair' : account.role === 'admin' ? 'analytics' : 'bed')}>查看完整数据 <ArrowRight size={14} /></button>
                </section>
              </div>
              </> : <ModulePage moduleId={activeView} role={account.role} onBack={() => setActiveView('overview')} onAction={action} />}
            </div>
            {toast && <p className={s.toast} role="status"><Check size={15} />{toast}</p>}
          </main>
        </div>
      )}
    </dialog>
  );
}
