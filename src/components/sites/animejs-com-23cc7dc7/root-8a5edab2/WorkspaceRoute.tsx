'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, LogOut, ShieldAlert, X } from 'lucide-react';
import { ActionWorkspace } from './ActionWorkspace';
import { MaintenanceWorkspace } from './MaintenanceWorkspace';
import { RepairWorkspace } from './RepairWorkspace';
import { readDemoSession, saveDemoSession } from '@/lib/demo-session';
import { featureFor, roleFeatures } from '@/lib/role-experiences';
import { demoAccounts, type DemoAccount, type RoleId } from '@/lib/role-workspaces';
import portal from './RolePortal.module.css';
import s from './WorkspaceRoute.module.css';
import { ThemeSelect } from '@/components/ThemeProvider';

const validRoles: RoleId[] = ['student', 'dormManager', 'maintenance', 'admin'];

export function WorkspaceRoute() {
  const params = useParams<{ role: string; feature: string; action?: string[] }>();
  const pathname = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState<DemoAccount | null | undefined>(undefined);
  const [toast, setToast] = useState('');
  const [detail, setDetail] = useState('');
  const role = validRoles.includes(params.role as RoleId) ? params.role as RoleId : null;
  const feature = role ? featureFor(role, params.feature) : undefined;
  const actionId = pathname.split('/')[4];
  const action = feature?.actions.find(item => item.id === actionId) ?? feature?.actions[0];

  useEffect(() => {
    const syncLocation = () => setDetail(new URLSearchParams(window.location.search).get('detail') ?? '');
    const frame = window.requestAnimationFrame(() => {
      setAccount(readDemoSession());
      syncLocation();
    });
    window.addEventListener('popstate', syncLocation);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('popstate', syncLocation);
    };
  }, []);

  function logout() {
    saveDemoSession(null);
    router.push('/');
  }

  function completeDetail() {
    setToast(detail + '已完成演示操作');
    setDetail('');
    window.history.replaceState(null, '', pathname);
    window.setTimeout(() => setToast(''), 2200);
  }

  if (account === undefined) return <main className={s.loading}>正在确认身份…</main>;

  if (!account || !role || !feature) return <main className={s.denied}>
    <ShieldAlert />
    <p>DORMA / SESSION REQUIRED</p>
    <h1>需要先登录。</h1>
    <span>请从首页选择演示身份，再进入对应功能。</span>
    <Link href="/">返回登录镜头</Link>
  </main>;

  if (account.role !== role || !roleFeatures[account.role].some(item => item.id === feature.id)) return <main className={s.denied}>
    <ShieldAlert />
    <p>DORMA / ACCESS DENIED</p>
    <h1>当前身份无权访问。</h1>
    <span>{demoAccounts.find(item => item.role === account.role)?.roleName}只能进入自己的功能镜头。</span>
    <Link href="/">返回我的镜头</Link>
  </main>;

  return <div className={s.page}>
    <header className={s.topbar}>
      <button onClick={() => router.push('/')}><ArrowLeft size={15} />返回镜头</button>
      <div><span>{account.roleName}</span><strong>{feature.title} / {action?.label}</strong></div>
      <div className={s.topbarTools}><ThemeSelect /><button onClick={logout}><LogOut size={14} />退出登录</button></div>
    </header>
    <main className={s.content}>
      <div className={s.actionTitle}><p>{feature.eyebrow} / SELECTED ACTION</p><h1>{feature.title}</h1><span>{feature.description}</span></div>
      <nav className={s.actionTabs} aria-label={feature.title + '详细功能'}>
        {feature.actions.map(item => <button key={item.id} data-active={item.id === action?.id} onClick={() => window.history.pushState(null, '', '/workspace/' + role + '/' + feature.id + '/' + item.id)}>
          <span>{item.label}</span><ArrowRight size={14} />
        </button>)}
      </nav>
      <div className={portal.workspaceContent}>
        {role === 'maintenance' ? <MaintenanceWorkspace featureId={feature.id} actionId={action?.id ?? 'action-1'} /> : role === 'student' && feature.id === 'repair' ? <RepairWorkspace actionId={action?.id ?? 'action-1'} /> : <ActionWorkspace key={feature.id} feature={feature} actionId={action?.id ?? 'action-1'} role={account.role} />}
      </div>
    </main>
    {detail && <div className={s.drawerBackdrop} onClick={() => {
      setDetail('');
      window.history.replaceState(null, '', pathname);
    }}>
      <aside className={s.detailDrawer} onClick={event => event.stopPropagation()}>
        <header><div><p>BUSINESS DETAIL</p><h2>{detail}</h2></div><button onClick={() => {
          setDetail('');
          window.history.replaceState(null, '', pathname);
        }}><X size={18} /></button></header>
        <section>
          <label>当前功能<strong>{action?.label}</strong></label>
          <label>操作身份<strong>{account.displayName} / {account.roleName}</strong></label>
          <label>业务状态<strong>前端演示数据</strong></label>
        </section>
        <div className={s.drawerData}><span>01</span><p>本页面已接入独立地址和可见详情层。后端接口完成后，这里直接替换为真实表单与业务记录。</p></div>
        <button className={s.completeButton} onClick={completeDetail}><Check size={15} />确认演示操作</button>
      </aside>
    </div>}
    {toast && <p className={s.toast}>{toast}</p>}
  </div>;
}
