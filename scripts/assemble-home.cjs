const fs=require('fs');const p='src/components/sites/animejs-com-23cc7dc7/root-8a5edab2/HomePage.tsx';let t=fs.readFileSync(p,'utf8');t=t.replace('CircleHelp, Menu, Pause, Play, Plus, X','CircleHelp, Menu, Pause, Play, Plus, X').replace('Check, ChevronRight,','Check,');t=t.replace("import { ServiceSection } from './ServiceSection';","import { ServiceSection } from './ServiceSection';\nimport { ResidenceEngine } from './ResidenceEngine';");const start=t.indexOf('const windows =');const end=t.indexOf('export function HomePage()');t=t.slice(0,start)+t.slice(end);t=t.replace('const dialog = useRef<HTMLDialogElement>(null);','const dialog = useRef<HTMLDialogElement>(null);\n  const journey = useRef<HTMLElement>(null);\n  const [progress, setProgress] = useState(0);');t=t.replace('  function toggleMotion()',`  useEffect(() => {
    let frame = 0;
    const measure = () => { const el = journey.current; if (!el) return; const rect = el.getBoundingClientRect(); const range = el.offsetHeight - window.innerHeight; const next = Math.min(1, Math.max(0, -rect.top / Math.max(1, range))); setProgress(next); };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  function toggleMotion()`);
t=t.replace('<ServiceSection onOpen={open} repairCount={records.length}/> ', '<ServiceSection onOpen={open} repairCount={records.length}/>');
const journeyMarkup=`<section ref={journey} className={s.journey} aria-label="滚动拆解公寓，探索对应服务">
        <div className={s.journeySticky}>
          <div className={s.journeyArt}><ResidenceEngine progress={progress} mode={Math.min(2, Math.floor(progress * 3))}/><p>ONE BUILDING. EVERY PART OF YOUR DAY.</p></div>
          <div className={s.journeyCopy}>
            <p className={s.eyebrow}>SCROLL TO EXPLORE / 向下探索</p>
            <h2>拆开日常，<br/>看见每一份照顾。</h2>
            <p>一栋公寓，连接生活的不同切面。<br/>向下滚动，探索每一层里的服务。</p>
            {([{key:'room',title:'安心入住',desc:'你的房间、床位与入住信息。'},{key:'repair',title:'及时回应',desc:'从提交报修，到问题解决。'},{key:'bill',title:'每一笔，都清晰',desc:'水费、电费，让生活心里有数。'}] as const).map((item,i)=><button key={item.key} className={s.journeyItem} data-active={Math.min(2,Math.floor(progress*3))===i} onClick={()=>open(item.key)}><span>0{i+1}</span><div><strong>{item.title}</strong><small>{item.desc}</small></div><ArrowUpRight size={20}/></button>)}
            <p className={s.journeyHint}><ArrowDown size={12}/> 随滚动拆解 · 点击进入服务</p>
          </div>
        </div>
      </section>
      `;
t=t.replace('<ServiceSection onOpen={open} repairCount={records.length}/>',journeyMarkup+'<ServiceSection onOpen={open} repairCount={records.length}/>');fs.writeFileSync(p,t);let pkg=JSON.parse(fs.readFileSync('package.json'));pkg.name='dorma-campus';pkg.description='Anime.js inspired student residence frontend';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
