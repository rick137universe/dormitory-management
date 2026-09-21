'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowRight, LogOut } from 'lucide-react';
import { LensExperience } from './LensExperience';
import { RolePortal } from './RolePortal';
import { readDemoSession, saveDemoSession } from '@/lib/demo-session';
import { roleFeatures } from '@/lib/role-experiences';
import type { DemoAccount } from '@/lib/role-workspaces';
import h from './LensHome.module.css';

export function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<DemoAccount | null>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const features = useMemo(() => session ? roleFeatures[session.role] : roleFeatures.student, [session]);
  const stageFloat = Math.min(features.length - .0001, progress * features.length);
  const activeIndex = Math.max(0, Math.floor(stageFloat));
  const localProgress = session ? stageFloat - activeIndex : 0;
  const active = features[activeIndex];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSession(readDemoSession()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!session) return;
    const stored = window.sessionStorage.getItem('dorma-return-progress');
    if (!stored) return;
    window.sessionStorage.removeItem('dorma-return-progress');
    const target = Number(stored);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: Math.max(0, Math.min(1, target)) * range });
    }));
  }, [session]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(Math.max(0, Math.min(1, window.scrollY / Math.max(1, range))));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [session]);

  function onSessionChange(account: DemoAccount | null) {
    saveDemoSession(account);
    setSession(account);
    window.scrollTo({ top: 0 });
  }

  function seek(index: number) {
    if (!session) {
      setPortalOpen(true);
      return;
    }
    const range = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (index / features.length) * range, behavior: 'smooth' });
  }

  function openAction(actionId: string) {
    if (!session || transitioning) return;
    setTransitioning(true);
    window.sessionStorage.setItem('dorma-return-progress', String(progress));
    window.setTimeout(() => router.push('/workspace/' + session.role + '/' + active.id + '/' + actionId), 620);
  }

  function logout() {
    saveDemoSession(null);
    setSession(null);
    window.scrollTo({ top: 0 });
  }

  return <div className={h.page} data-authenticated={Boolean(session)}>
    <header className={h.header}>
      <button className={h.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>dorma<span>●</span><small>校园生活服务</small></button>
      <div className={h.identity}>
        {session ? <><span>{session.displayName} / {session.roleName}</span><button onClick={logout}><LogOut size={14} />退出</button></> : <button onClick={() => setPortalOpen(true)}>登录工作台 <ArrowRight size={14} /></button>}
      </div>
    </header>

    <main className={h.scrollTrack} aria-label="Dorma 角色功能镜头">
      {(session ? features : [features[0]]).map(feature => <section key={feature.id} aria-label={feature.title} />)}
    </main>

    <div className={h.stickyStage}>
      <section className={h.copy}>
        <p>{session ? active.index + ' / ' + active.eyebrow : 'DORMA / ACCESS LENS'}</p>
        <h1>{session ? active.title : <>先确认身份，<br />再看见功能。</>}</h1>
        <span>{session ? active.description : '同一枚镜头会根据学生、宿管、维修人员与系统管理员的权限，载入完全不同的功能动画。'}</span>
        {!session && <button onClick={() => setPortalOpen(true)}>选择身份并登录 <ArrowRight size={16} /></button>}
        {session && <button className={h.scrollHint} onClick={() => seek(Math.min(activeIndex + 1, features.length - 1))}>滚动控制动画 <ArrowDown size={14} /></button>}
      </section>

      <div className={h.lensWrap}>
        <LensExperience features={features} activeIndex={activeIndex} localProgress={localProgress} blurred={!session} transitioning={transitioning} onSeek={seek} />
      </div>

      {session && <aside className={h.actionPanel}>
        <header><span>{active.eyebrow}</span><small>{active.index} / {String(features.length).padStart(2, '0')}</small></header>
        {active.actions.map(action => <button key={action.id} onClick={() => openAction(action.id)}><ArrowRight size={13} />{action.label}</button>)}
        <div className={h.microProgress} aria-label={'当前动画进度 ' + Math.round(localProgress * 100) + '%'}>
          {Array.from({ length: 32 }, (_, index) => <i key={index} data-lit={index / 31 <= localProgress} />)}
        </div>
      </aside>}

      {session && <nav className={h.chapterNames} aria-label="功能章节">
        {features.map((feature, index) => <button key={feature.id} data-active={index === activeIndex} data-complete={index < activeIndex} onClick={() => seek(index)}><span>{feature.index}</span>{feature.title}</button>)}
      </nav>}
    </div>

    <footer className={h.footer}><span>DORMA © 2026</span><p>{session ? session.roleName + ' / ' + features.length + ' FUNCTIONS' : 'IDENTITY REQUIRED'}</p></footer>
    <RolePortal open={portalOpen} loginOnly requestedView="overview" onViewChange={() => undefined} onClose={() => setPortalOpen(false)} onSessionChange={onSessionChange} />
  </div>;
}
