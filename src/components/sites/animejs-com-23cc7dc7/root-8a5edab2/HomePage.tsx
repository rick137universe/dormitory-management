'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CircleHelp, Menu, Pause, Play, X } from 'lucide-react';
import { ContinuousResidence } from './ContinuousResidence';
import { ModuleConstellation } from './ModuleConstellation';
import { RolePortal } from './RolePortal';
import { bill, initialRepairs, student, type RepairRecord, type Service } from '@/lib/mock-campus';
import s from './HomePage.module.css';
import n from './Narrative.module.css';

const chapters = [
 {name:'序章',eyebrow:'A PLACE TO BELONG',title:['一栋公寓，','四种工作视角。'],description:'同一栋楼，不同身份看到不同的业务。登录后，Dorma 只呈现与你有关的服务。',action:'登录 Dorma',at:0},
 {name:'基础',eyebrow:'01 / THE SHARED FOUNDATION',title:['每一条信息，','都有清楚归属。'],description:'学生、楼栋、房间与床位构成统一底座。外墙先退场，让数据结构从建筑内部显现。',action:'查看角色权限',at:.14},
 {name:'住宿',eyebrow:'02 / ACCOMMODATION FLOW',title:['从申请开始，','让入住落到床位。'],description:'入住、调宿与退宿环环相扣。楼层逐层分离，同时同步每一个床位状态。',action:'进入住宿业务',at:.28},
 {name:'床位',eyebrow:'03 / EVERY BED COUNTS',title:['空闲或入住，','状态始终一致。'],description:'容量、分配与有效入住一起校验，避免重复分床和学生重复入住。',action:'查看床位状态',at:.41},
 {name:'维修',eyebrow:'04 / REPAIR LIFECYCLE',title:['一张工单，','穿过整栋公寓。'],description:'学生报修、宿管初审、管理员派工、维修处理，再回到学生评价。管线随流程向外展开。',action:'进入报修流程',at:.55},
 {name:'缴费',eyebrow:'05 / EVERY BILL EXPLAINED',title:['每一笔费用，','都能回到明细。'],description:'住宿费、水费与电费自动成账，支持缴费登记、欠费查询和多维统计。',action:'进入缴费管理',at:.68},
 {name:'分析',eyebrow:'06 / OPERATIONS IN VIEW',title:['把运行状态，','变成可读的指标。'],description:'入住率、空余床位、欠费和维修完成率，从散开的部件汇成运营全貌。',action:'查看统计分析',at:.81},
 {name:'系统',eyebrow:'ONE RESIDENCE. EIGHT MODULES.',title:['彻底拆开，','才看见完整系统。'],description:'八大模块围绕同一栋公寓协同工作。最终以无色工程线稿呈现结构与权限边界。',action:'登录角色工作台',at:.96},
] as const;
export function HomePage() {
  const dialog=useRef<HTMLDialogElement>(null);const submitTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [progress,setProgress]=useState(0);const [paused,setPaused]=useState(false);const [menuOpen,setMenuOpen]=useState(false);const [portalOpen,setPortalOpen]=useState(false);
  const [active,setActive]=useState<Service>('room');const [records,setRecords]=useState<RepairRecord[]>(initialRepairs);
  const [submitted,setSubmitted]=useState(false);const [sending,setSending]=useState(false);
  const stage=Math.min(chapters.length-1,Math.floor(progress*chapters.length));
  const chapter=chapters[stage];const light=progress>.82;
  useEffect(()=>{let frame=0;const update=()=>{const range=document.documentElement.scrollHeight-window.innerHeight;setProgress(Math.min(1,Math.max(0,window.scrollY/Math.max(1,range))));};const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};onScroll();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);if(submitTimer.current)clearTimeout(submitTimer.current);};},[]);
  const open=useCallback((service:Service)=>{if(submitTimer.current)clearTimeout(submitTimer.current);setSending(false);setActive(service);setSubmitted(false);setMenuOpen(false);dialog.current?.showModal();},[]);
  function close(){if(submitTimer.current)clearTimeout(submitTimer.current);setSending(false);dialog.current?.close();}
  function seek(value:number,instant=false){const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;window.scrollTo({top:value*(document.documentElement.scrollHeight-window.innerHeight),behavior:instant||reduced?'instant':'smooth'});setMenuOpen(false);}
  function submitRepair(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);const description=String(data.get('description')||'').trim();if(!description){const field=event.currentTarget.elements.namedItem('description') as HTMLTextAreaElement;field.setCustomValidity('请填写故障描述');field.reportValidity();return;}setSending(true);submitTimer.current=setTimeout(()=>{setRecords(r=>[{id:'BX'+Date.now(),title:data.get('category')+' · '+description.slice(0,30),status:'待审核',date:'刚刚'},...r]);setSending(false);setSubmitted(true);},450);}
  const title:Record<Service,string>={room:'我的住宿',repair:'维修服务',bill:'本月账单',profile:'我的公寓','notice-water':'供水维护通知','notice-safety':'宿舍用电安全提醒'};
  return <div className={n.story} data-light={light} data-chapter={stage}>
    <ContinuousResidence progress={progress} paused={paused} onSelect={()=>setPortalOpen(true)}/>
    <header className={n.header}>
      <button className={n.logo} onClick={()=>seek(0)} aria-label="Dorma 首页">dorma<span>●</span><small>校园生活服务</small></button>
      <nav className={menuOpen?n.navigationOpen:n.navigation} aria-label="主导航">
        <button onClick={()=>seek(.28)}>住宿</button><button onClick={()=>seek(.55)}>维修</button><button onClick={()=>seek(.68)}>缴费</button><button onClick={()=>open('notice-water')}>公告</button><button className={n.account} onClick={()=>setPortalOpen(true)}>登录工作台 <ArrowUpRight size={14}/></button>
      </nav>
      <button className={n.menu} aria-label={menuOpen?'收起导航':'展开导航'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
    </header>
    <main className={n.scrollTrack} aria-label="公寓服务滚动故事">
      {chapters.map((c,i)=><section className={n.scrollMarker} id={'chapter-'+i} key={c.name} aria-label={c.name}/>)}
    </main>
    <div className={n.viewport}>
      <section className={n.copy} key={stage} aria-labelledby="chapter-heading">
        <p className={n.eyebrow}><span/> {chapter.eyebrow}</p>
        {stage===0?<h1 id="chapter-heading">{chapter.title[0]}<br/>{chapter.title[1]}</h1>:<h2 id="chapter-heading">{chapter.title[0]}<br/>{chapter.title[1]}</h2>}
        <p className={n.description}>{chapter.description}</p>
        <button className={n.cta} onClick={()=>setPortalOpen(true)}>{chapter.action}<ArrowUpRight size={17}/></button>
        {stage===0&&<button className={n.explore} onClick={()=>seek(.14)}>向下滚动，拆解系统 <ArrowDown size={14}/></button>}
        {stage===2&&<div className={n.detail}><span>住宿业务链</span><div className={n.repairSteps}><span>入住</span><ArrowRight size={12}/><span>调宿</span><ArrowRight size={12}/><span>退宿</span></div><p>业务完成后自动同步床位状态</p></div>}
        {stage===3&&<div className={n.detail}><span>南苑 3 栋</span><strong>400 <small>/ 总床位</small></strong><p><i/> 371 已入住 · 25 空闲 · 4 维修</p></div>}
        {stage===4&&<div className={n.detail}><span>报修全生命周期</span><div className={n.repairSteps}><span>初审</span><ArrowRight size={12}/><span>派工</span><ArrowRight size={12}/><span>评价</span></div><p>{records.length} 条学生演示记录 · 角色分步处理</p></div>}
        {stage===5&&<div className={n.detail}><span>2026 年 9 月 · 待缴金额</span><strong><small>¥ </small>128.60</strong><p>水费 ¥28.60 / 电费 ¥100.00</p></div>}
        {stage===6&&<div className={n.detail}><span>全校公寓入住率</span><strong>91.4<small>%</small></strong><p>6,582 / 7,200 床 · 实时演示数据</p></div>}
      </section>
      <div className={n.buildingTag} aria-hidden="true"><span>NANYUAN RESIDENCE</span><strong>03</strong><span>南苑生活区 / 2026</span></div>
      <ModuleConstellation progress={progress} onOpen={()=>setPortalOpen(true)}/>
      <div className={n.controls}>
        <button className={n.motion} onClick={()=>setPaused(!paused)} aria-label={paused?'播放自主动画':'暂停自主动画'} aria-pressed={paused}>{paused?<Play size={11}/>:<Pause size={11}/>}<span>{paused?'PLAY':'PAUSE'}</span></button>
        <span className={n.chapterNumber}>0{stage+1} <span>/ 08</span></span>
        <input type="range" min="0" max="1000" step="1" value={Math.round(progress*1000)} onChange={e=>seek(Number(e.target.value)/1000,true)} aria-label="探索公寓进度"/>
        <span className={n.progressLabel}>{Math.round(progress*100)}%</span>
      </div>
    </div>
    <footer className={n.footer}><span>DORMA © 2026 <b>学生公寓生活服务</b></span><nav aria-label="章节导航">{chapters.map((c,i)=><button key={c.name} aria-current={i===stage?'step':undefined} aria-label={'跳转到'+c.name} onClick={()=>seek(c.at)}><span>0{i+1}</span>{c.name}</button>)}</nav><small>交互演示 · 模拟数据</small></footer>
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
    <RolePortal open={portalOpen} onClose={()=>setPortalOpen(false)}/>
  </div>;
}
