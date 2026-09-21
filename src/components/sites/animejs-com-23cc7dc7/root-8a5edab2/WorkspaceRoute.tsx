'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';
import { ModulePage } from './ModulePage';
import { readDemoSession, saveDemoSession } from '@/lib/demo-session';
import { featureFor, roleFeatures } from '@/lib/role-experiences';
import { demoAccounts, type DemoAccount, type RoleId } from '@/lib/role-workspaces';
import portal from './RolePortal.module.css';
import s from './WorkspaceRoute.module.css';

const validRoles: RoleId[] = ['student', 'dormManager', 'maintenance', 'admin'];

export function WorkspaceRoute() {
  const params = useParams<{ role: string; feature: string; action?: string[] }>();
  const router = useRouter();
  const [account, setAccount] = useState<DemoAccount | null | undefined>(undefined);
  const [toast, setToast] = useState('');
  const role = validRoles.includes(params.role as RoleId) ? params.role as RoleId : null;
  const feature = role ? featureFor(role, params.feature) : undefined;
  const actionId = Array.isArray(params.action) ? params.action[0] : undefined;
  const action = feature?.actions.find(item => item.id === actionId) ?? feature?.actions[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAccount(readDemoSession()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function logout() {
    saveDemoSession(null);
    router.push('/');
  }

  function actionNotice(message: string) {
    setToast(message);
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
      <button onClick={() => router.back()}><ArrowLeft size={15} />返回镜头</button>
      <div><span>{account.roleName}</span><strong>{feature.title} / {action?.label}</strong></div>
      <button onClick={logout}><LogOut size={14} />退出登录</button>
    </header>
    <main className={s.content}>
      <div className={s.actionTitle}><p>{feature.eyebrow} / SELECTED ACTION</p><h1>{action?.label}</h1><span>{feature.description}</span></div>
      <div className={portal.workspaceContent}>
        <ModulePage moduleId={feature.module} role={account.role} onBack={() => router.back()} onAction={actionNotice} />
      </div>
    </main>
    {toast && <p className={s.toast}>{toast}</p>}
  </div>;
}
