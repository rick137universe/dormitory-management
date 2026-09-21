const fs=require('fs');const file='src/components/sites/animejs-com-23cc7dc7/root-8a5edab2/HomePage.tsx';const old=fs.readFileSync(file,'utf8');const dialogs=old.slice(old.indexOf('    <dialog ref='),old.lastIndexOf('  </div>;'));
const top=`'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CircleHelp, Menu, Pause, Play, Plus, X } from 'lucide-react';
import { ContinuousResidence } from './ContinuousResidence';
import { bill, initialRepairs, student, type RepairRecord, type Service } from '@/lib/mock-campus';
import s from './HomePage.module.css';
import n from './Narrative.module.css';

const chapters = [
 {name:'序章',eyebrow:'A PLACE TO BELONG',title:['一栋公寓，','你的整个日常。'],description:'从安心入住，到每一次及时回应。把生活的小事，交给 Dorma。',action:'进入我的公寓',service:'profile',at:0},
 {name:'展开',eyebrow:'EVERY DETAIL, CONNECTED',title:['生活的细节，','一层层展开。'],description:'顺着空间探索，让每一项服务，出现在你需要的地方。',action:'探索住宿服务',service:'room',at:.2},
 {name:'住宿',eyebrow:'01 / YOUR OWN SPACE',title:['每一间房，','都有归属。'],description:'房间、床位与入住信息，清楚地放在一起。安顿好自己，开始新的校园生活。',action:'查看我的住宿',service:'room',at:.36},
 {name:'维修',eyebrow:'02 / CARE IN EVERY CORNER',title:['看不见的照顾，','也能被看见。'],description:'从一滴漏水到一盏灯。提交问题、追踪进度，让每一次报修都有回应。',action:'提交报修',service:'repair',at:.55},
 {name:'账单',eyebrow:'03 / LIFE IN BALANCE',title:['每一度电，','每一笔都清晰。'],description:'水费、电费与住宿账单。一处查看，让日常开支心里有数。',action:'查看本月账单',service:'bill',at:.71},
 {name:'全貌',eyebrow:'ONE RESIDENCE. ALL CONNECTED.',title:['拆开复杂，','把简单留给生活。'],description:'住宿、维修、缴费，连接成完整的校园日常。每个部分，各司其职。',action:'回到我的公寓',service:'profile',at:.95},
] as const;
export function HomePage() {
  const dialog=useRef<HTMLDialogElement>(null);const submitTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [progress,setProgress]=useState(0);const [paused,setPaused]=useState(false);const [menuOpen,setMenuOpen]=useState(false);
  const [active,setActive]=useState<Service>('room');const [records,setRecords]=useState<RepairRecord[]>(initialRepairs);
  const [submitted,setSubmitted]=useState(false);const [sending,setSending]=useState(false);
  const stage=progress<.14?0:progress<.29?1:progress<.46?2:progress<.63?3:progress<.80?4:5;
  const chapter=chapters[stage];const light=(progress>.225&&progress<.46)||progress>.81;
  useEffect(()=>{let frame=0;const update=()=>{const range=document.documentElement.scrollHeight-window.innerHeight;setProgress(Math.min(1,Math.max(0,window.scrollY/Math.max(1,range))));};const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};onScroll();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);if(submitTimer.current)clearTimeout(submitTimer.current);};},[]);
  const open=useCallback((service:Service)=>{if(submitTimer.current)clearTimeout(submitTimer.current);setSending(false);setActive(service);setSubmitted(false);setMenuOpen(false);dialog.current?.showModal();},[]);
  function close(){if(submitTimer.current)clearTimeout(submitTimer.current);setSending(false);dialog.current?.close();}
  function seek(value:number,instant=false){const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;window.scrollTo({top:value*(document.documentElement.scrollHeight-window.innerHeight),behavior:instant||reduced?'instant':'smooth'});setMenuOpen(false);}
  function submitRepair(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);const description=String(data.get('description')||'').trim();if(!description){const field=event.currentTarget.elements.namedItem('description') as HTMLTextAreaElement;field.setCustomValidity('请填写故障描述');field.reportValidity();return;}setSending(true);submitTimer.current=setTimeout(()=>{setRecords(r=>[{id:'BX'+Date.now(),title:data.get('category')+' · '+description.slice(0,30),status:'待审核',date:'刚刚'},...r]);setSending(false);setSubmitted(true);},450);}
  const title:Record<Service,string>={room:'我的住宿',repair:'维修服务',bill:'本月账单',profile:'我的公寓','notice-water':'供水维护通知','notice-safety':'宿舍用电安全提醒'};
  return <div className={n.story} data-light={light} data-chapter={stage}>
    <ContinuousResidence progress={progress} paused={paused} onSelect={open}/>
    <header className={n.header}>
      <button className={n.logo} onClick={()=>seek(0)} aria-label="Dorma 首页">dorma<span>●</span><small>校园生活服务</small></button>
      <nav className={menuOpen?n.navigationOpen:n.navigation} aria-label="主导航">
        <button onClick={()=>seek(.36)}>住宿</button><button onClick={()=>seek(.55)}>维修</button><button onClick={()=>seek(.71)}>账单</button><button onClick={()=>open('notice-water')}>公告</button><button className={n.account} onClick={()=>open('profile')}>我的公寓 <ArrowUpRight size={14}/></button>
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
        <button className={n.cta} onClick={()=>open(chapter.service)}>{chapter.action}<ArrowUpRight size={17}/></button>
        {stage===0&&<button className={n.explore} onClick={()=>seek(.2)}>向下滚动，展开生活 <ArrowDown size={14}/></button>}
        {stage===2&&<div className={n.detail}><span>南苑 3 栋</span><strong>502 <small>/ 02 床</small></strong><p><i/> 已入住 · 四人间</p></div>}
        {stage===3&&<div className={n.detail}><span>从提交到解决</span><div className={n.repairSteps}><span>提交</span><ArrowRight size={12}/><span>处理中</span><ArrowRight size={12}/><span>完成</span></div><p>{records.length} 条报修记录 · 进度随时可查</p></div>}
        {stage===4&&<div className={n.detail}><span>2026 年 9 月 · 待缴金额</span><strong><small>¥ </small>128.60</strong><p>水费 ¥28.60 / 电费 ¥100.00</p></div>}
      </section>
      <div className={n.buildingTag} aria-hidden="true"><span>NANYUAN RESIDENCE</span><strong>03</strong><span>南苑生活区 / 2026</span></div>
      {stage===5&&<aside className={n.moduleLegend}><div><span>日常服务，一处连接</span><span>03 MODULES</span></div><div className={n.colorBar}><i/><i/><i/></div><div className={n.legendLinks}><button onClick={()=>open('room')}><i/>住宿管理</button><button onClick={()=>open('repair')}><i/>维修服务</button><button onClick={()=>open('bill')}><i/>账单缴费</button></div></aside>}
      <div className={n.controls}>
        <button className={n.motion} onClick={()=>setPaused(!paused)} aria-label={paused?'播放自主动画':'暂停自主动画'} aria-pressed={paused}>{paused?<Play size={11}/>:<Pause size={11}/>}<span>{paused?'PLAY':'PAUSE'}</span></button>
        <span className={n.chapterNumber}>0{stage+1} <span>/ 06</span></span>
        <input type="range" min="0" max="1000" step="1" value={Math.round(progress*1000)} onChange={e=>seek(Number(e.target.value)/1000,true)} aria-label="探索公寓进度"/>
        <span className={n.progressLabel}>{Math.round(progress*100)}%</span>
      </div>
    </div>
    <footer className={n.footer}><span>DORMA © 2026 <b>学生公寓生活服务</b></span><nav aria-label="章节导航">{chapters.map((c,i)=><button key={c.name} aria-current={i===stage?'step':undefined} aria-label={'跳转到'+c.name} onClick={()=>seek(c.at)}><span>0{i+1}</span>{c.name}</button>)}</nav><small>交互演示 · 模拟数据</small></footer>
`;
fs.writeFileSync(file,top+dialogs+'  </div>;\n}\n');
