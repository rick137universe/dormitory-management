'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { animate, stagger, type JSAnimation } from 'animejs';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CircleHelp, Menu, Pause, Play, Plus, X } from 'lucide-react';
import { ServiceSection } from './ServiceSection';
import { ResidenceEngine } from './ResidenceEngine';
import { bill, initialRepairs, student, type RepairRecord, type Service } from '@/lib/mock-campus';
import s from './HomePage.module.css';

export function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const journey = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const animations = useRef<JSAnimation[]>([]);
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<Service>('room');
  const [records, setRecords] = useState<RepairRecord[]>(initialRepairs);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = () => {
      animations.current.forEach(a => a.revert());
      animations.current = [];
      if (reduced.matches) return;
      const q = (selector: string) => container.querySelectorAll(selector);
      animations.current = [
        animate(q('.engine-orbit'), { rotate: 360, duration: 65000, ease: 'linear', loop: true }),
        animate(q('.engine-ticks'), { rotate: -360, duration: 160000, ease: 'linear', loop: true }),
        animate(q('.engine-satellite'), { rotate: -360, duration: 32000, ease: 'linear', loop: true }),
        animate(q('.engine-window'), { opacity: [.35, 1], duration: 1600, delay: stagger(45, { from: 'center' }), alternate: true, loop: true, ease: 'inOutSine' }),
      ];
      if (container.dataset.paused === 'true') animations.current.forEach(a => a.pause());
    };
    start(); reduced.addEventListener('change', start);
    return () => { animations.current.forEach(a => a.revert()); reduced.removeEventListener('change', start); if (submitTimer.current) clearTimeout(submitTimer.current); };
  }, []);

  useEffect(() => {
    let frame = 0;
    const measure = () => { const el = journey.current; if (!el) return; const rect = el.getBoundingClientRect(); const range = el.offsetHeight - window.innerHeight; const next = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Math.min(1, Math.max(0, -rect.top / Math.max(1, range))); setProgress(next); };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  function toggleMotion() { animations.current.forEach(a => paused ? a.resume() : a.pause()); setPaused(!paused); }
  function open(service: Service) { if (submitTimer.current) clearTimeout(submitTimer.current); setSending(false); setActive(service); setSubmitted(false); setMenuOpen(false); dialog.current?.showModal(); }
  function close() { if (submitTimer.current) clearTimeout(submitTimer.current); setSending(false); dialog.current?.close(); }
  function submitRepair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const description = String(data.get('description') || '').trim();
    if (!description) { const field = event.currentTarget.elements.namedItem('description') as HTMLTextAreaElement; field.setCustomValidity('请填写故障描述'); field.reportValidity(); return; }
    setSending(true);
    submitTimer.current = setTimeout(() => { setRecords(r => [{id:`BX${Date.now()}`,title:`${data.get('category')} · ${description.slice(0, 30)}`,status:'待审核',date:'刚刚'}, ...r]); setSending(false); setSubmitted(true); }, 450);
  }
  const title: Record<Service, string> = { room: '我的住宿', repair: '维修服务', bill: '本月账单', profile: '我的公寓', 'notice-water': '供水维护通知', 'notice-safety': '宿舍用电安全提醒' };

  return <div ref={root} className={s.page} data-paused={paused}>
    <header className={s.header}>
      <a className={s.logo} href="#home" aria-label="Dorma 首页">dorma<span>●</span><small>校园生活服务</small></a>
      <nav className={`${s.nav} ${menuOpen ? s.navOpen : ''}`} aria-label="主导航">
        <a href="#home" className={s.activeNav} onClick={() => setMenuOpen(false)}>首页</a>
        <a href="#services" onClick={() => setMenuOpen(false)}>公寓服务</a>
        <a href="#notices" onClick={() => setMenuOpen(false)}>通知公告</a>
        <button className={s.account} onClick={() => open('profile')}>我的公寓 <ArrowUpRight size={14}/></button>
      </nav>
      <button className={s.mobileMenu} aria-label={menuOpen ? '收起导航' : '展开导航'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>

    <main>
      <section id="home" className={s.hero}>
        <div className={s.heroCopy}>
          <p className={s.eyebrow}><span/> STUDENT LIVING, REIMAGINED</p>
          <h1>让校园生活，<br/><span>轻盈运转。</span></h1>
          <p className={s.intro}>从安心入住，到每一次及时回应。<br/>把生活的小事，交给 Dorma。</p>
          <div className={s.heroActions}><button className={s.primary} onClick={() => open('profile')}>进入我的公寓 <ArrowUpRight size={19}/></button><button className={s.secondary} onClick={() => open('repair')}>立即报修 <Plus size={17}/></button></div>
          <div className={s.studentNote}><div className={s.avatars}><span>林</span><span>陈</span><span>周</span></div><p>让每一间宿舍，都有温度。<small>YOUR CAMPUS. YOUR LITTLE WORLD.</small></p></div>
        </div>
        <div className={s.art} data-mode={mode}>
          <div className={s.artTop}><span><i/> CAMPUS / CONNECTED</span><span>南苑生活区</span></div>
          <ResidenceEngine mode={mode}/>
          <div className={s.artLabel}><span>03</span><div>南苑公寓<small>NANYUAN RESIDENCE</small></div><ArrowUpRight size={16}/></div>
          <div className={s.artFooter}><span>生活的每一面，都在这里。</span><button className={s.motionControl} onClick={toggleMotion} aria-label={paused ? '播放动画' : '暂停动画'} aria-pressed={paused}>{paused ? <Play size={12}/> : <Pause size={12}/>}<span>{paused ? 'PLAY' : 'PAUSE'}</span></button></div>
        </div>
        <div className={s.heroBottom}><a href="#services">探索公寓服务 <ArrowDown size={14}/></a><div className={s.modes} aria-label="图形主题">{['安心入住', '及时回应', '自在生活'].map((label, i) => <button key={label} className={mode === i ? s.selectedMode : ''} onClick={() => setMode(i)} aria-pressed={mode === i}><span>0{i + 1}</span>{label}</button>)}</div><span className={s.demo}>INTERACTIVE DEMO <i/></span></div>
      </section>
      <div className={s.serviceBand}><span>住得安心。</span><span>修得及时。</span><span>每一笔，都清晰。</span><span className={s.bandEnd}>LESS FRICTION. MORE LIVING. <ArrowDown size={15}/></span></div>
      <section ref={journey} className={s.journey} aria-label="滚动拆解公寓，探索对应服务">
        <div className={s.journeySticky}>
          <div className={s.journeyArt}><ResidenceEngine onSelect={floor => open((['room', 'repair', 'bill'] as const)[floor])} progress={progress} mode={Math.min(2, Math.floor(progress * 3))}/><p>ONE BUILDING. EVERY PART OF YOUR DAY.</p></div>
          <div className={s.journeyCopy}>
            <p className={s.eyebrow}>SCROLL TO EXPLORE / 向下探索</p>
            <h2>拆开日常，<br/>看见每一份照顾。</h2>
            <p>一栋公寓，连接生活的不同切面。<br/>向下滚动，探索每一层里的服务。</p>
            {([{key:'room',title:'安心入住',desc:'你的房间、床位与入住信息。'},{key:'repair',title:'及时回应',desc:'从提交报修，到问题解决。'},{key:'bill',title:'每一笔，都清晰',desc:'水费、电费，让生活心里有数。'}] as const).map((item,i)=><button key={item.key} className={s.journeyItem} data-active={Math.min(2,Math.floor(progress*3))===i} onClick={()=>open(item.key)}><span>0{i+1}</span><div><strong>{item.title}</strong><small>{item.desc}</small></div><ArrowUpRight size={20}/></button>)}
            <p className={s.journeyHint}><ArrowDown size={12}/> 随滚动拆解 · 点击进入服务</p>
          </div>
        </div>
      </section>
      <ServiceSection onOpen={open} repairCount={records.length}/>
    </main>
    <footer className={s.footer}><a href="#home" className={s.logo}>dorma<span>●</span></a><p>让校园生活，轻盈运转。</p><span>前端演示 · 数据为模拟数据</span><a href="https://animejs.com/" target="_blank" rel="noreferrer">Motion powered by Anime.js <ArrowUpRight size={12}/></a></footer>

    <dialog ref={dialog} className={s.dialog} aria-labelledby="service-dialog-title" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={s.dialogInner}>
        <div className={s.dialogHeader}><div><p className={s.eyebrow}>DORMA / STUDENT SERVICES</p><h2 id="service-dialog-title">{title[active]}</h2></div><button className={s.close} onClick={close} aria-label="关闭弹窗"><X size={22}/></button></div>
        <p className={s.demoNote}><CircleHelp size={14}/> 交互演示 · 使用模拟数据，不会产生真实业务</p>
        {(active === 'room' || active === 'profile') && <>
          <div className={s.roomSummary}><span>YOUR LITTLE WORLD</span><strong>502<span>室</span></strong><p>{student.building} / {student.bed} 号床位</p><em><i/> 已入住</em></div>
          <dl className={s.details}><div><dt>入住人</dt><dd>{student.name}</dd></div><div><dt>住宿学年</dt><dd>{student.term}</dd></div><div><dt>所在园区</dt><dd>{student.campus}</dd></div><div><dt>房间类型</dt><dd>四人间 · 独立卫浴</dd></div></dl>
          <div className={s.dialogActions}><button className={s.primary} onClick={() => open('repair')}>报修宿舍设施 <ArrowRight size={16}/></button><button className={s.secondary} onClick={() => open('bill')}>查看账单 <ArrowUpRight size={16}/></button></div>
        </>}
        {active === 'repair' && <>
          {submitted ? <div className={s.success} role="status"><span><Check size={32}/></span><h3>报修已提交</h3><p>演示工单已加入下方记录，当前状态为「待审核」。<br/>刷新页面后，模拟数据会重置。</p><button className={s.secondary} onClick={() => setSubmitted(false)}>继续提交</button></div> : <form onSubmit={submitRepair} className={s.form}>
            <div className={s.formRow}><label>报修位置<input value="南苑 3 栋 · 502 室" readOnly/></label><label>故障类型<select name="category"><option>水电设施</option><option>门窗家具</option><option>空调设备</option><option>其他问题</option></select></label></div>
            <label>故障描述<textarea name="description" placeholder="例如：卫生间水龙头关闭后仍持续滴水……" required maxLength={300} rows={3} onInput={e => e.currentTarget.setCustomValidity('')}/></label>
            <button className={s.primary} type="submit" disabled={sending}>{sending ? '正在提交…' : '提交报修'}<ArrowUpRight size={17}/></button>
          </form>}
          <div className={s.records}><h3>我的报修记录 <span>{records.length}</span></h3>{records.map(record => <div className={s.record} key={record.id}><div><strong>{record.title}</strong><small>{record.date} · {record.id}</small></div><span data-status={record.status}>{record.status}</span></div>)}</div>
        </>}
        {active === 'bill' && <><div className={s.billTotal}><span>{bill.month} · 待缴金额</span><strong><small>¥</small>{bill.total.toFixed(2)}</strong><p>账单数据为演示数据</p></div><dl className={s.details}><div><dt>住宿费用</dt><dd>本学年已缴</dd></div><div><dt>水费</dt><dd>¥{bill.water.toFixed(2)}</dd></div><div><dt>电费</dt><dd>¥{bill.electricity.toFixed(2)}</dd></div><div><dt>合计</dt><dd>¥{bill.total.toFixed(2)}</dd></div></dl><p className={s.noticeText}>当前版本仅展示账单信息，支付功能待后续接入。</p></>}
        {active.startsWith('notice-') && <article className={s.noticeText}><p className={s.noticeDate}>公寓服务中心 / {active === 'notice-water' ? '2026.09.21' : '2026.09.18'} · 示例公告</p>{active === 'notice-water' ? <><h3>南苑 3 栋供水维护通知</h3><p>为保障日常用水，南苑 3 栋计划于 9 月 23 日 14:00—16:00 进行供水设施维护。期间可能出现短时停水，请同学们提前安排用水。</p><p>维护完成后将恢复供水。如遇持续异常，可通过「维修服务」提交报修。</p></> : <><h3>秋季宿舍用电安全提醒</h3><p>离开宿舍时，请及时关闭不使用的电器。请勿在宿舍内使用大功率违规电器，也不要将插线板放置在床铺等易燃物上。</p><p>发现插座松动、电线破损或异常发热时，请停止使用并联系宿管人员。</p></>}<button className={s.secondary} onClick={close}>我知道了 <Check size={16}/></button></article>}
      </div>
    </dialog>
  </div>;
}
