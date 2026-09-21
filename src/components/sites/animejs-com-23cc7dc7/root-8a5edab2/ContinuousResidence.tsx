'use client';
import { useEffect, useRef, useState } from 'react';
import { createTimeline } from 'animejs';
import type { Category } from './residence-model';
import type { Service } from '@/lib/mock-campus';
import s from './Narrative.module.css';

interface Props { progress: number; paused: boolean; onSelect: (service: Service) => void; }
export function ContinuousResidence({ progress, paused, onSelect }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef({progress,paused,onSelect});
  const [failed,setFailed] = useState(false);
  useEffect(()=>{ latest.current={progress,paused,onSelect}; },[progress,paused,onSelect]);
  useEffect(()=>{
    const element=host.current;if(!element)return;
    let alive=true; let cleanup=()=>{};
    Promise.all([import('three'),import('./residence-model')]).then(([T,{createResidenceModel}])=>{
      if(!alive)return;
      const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.setSize(element.clientWidth,element.clientHeight);
      renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
      renderer.domElement.setAttribute('aria-label','同一栋公寓随滚动旋转、展开房间和设备，点击模型可进入相应服务');renderer.domElement.setAttribute('role','img');
      element.appendChild(renderer.domElement);
      cleanup=()=>{renderer.setAnimationLoop(null);renderer.dispose();renderer.domElement.remove();};
      const scene=new T.Scene();const background=new T.Color(0x252423);scene.background=background;
      const camera=new T.OrthographicCamera(-10,10,8,-8,.1,120);camera.position.set(0,0,25);camera.lookAt(0,0,0);
      const ambient=new T.HemisphereLight(0xf7eddb,0x4c5954,2.5);scene.add(ambient);
      const key=new T.DirectionalLight(0xffe6c7,3.6);key.position.set(-8,14,12);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-12;key.shadow.camera.right=12;key.shadow.camera.top=14;key.shadow.camera.bottom=-12;key.shadow.bias=-.001;scene.add(key);
      const rim=new T.DirectionalLight(0xb8d5df,2.0);rim.position.set(10,4,-8);scene.add(rim);
      const model=createResidenceModel();scene.add(model.root);
      const gridGeometry=new T.BufferGeometry();const gridPoints:number[]=[];
      for(let i=-8;i<=8;i++){gridPoints.push(-8,-4.55,i,8,-4.55,i,i,-4.55,-8,i,-4.55,8);}gridGeometry.setAttribute('position',new T.Float32BufferAttribute(gridPoints,3));
      const gridMaterial=new T.LineBasicMaterial({color:0x908b79,transparent:true,opacity:.1});const grid=new T.LineSegments(gridGeometry,gridMaterial);scene.add(grid);
      const dark=new T.Color(0x252423),cream=new T.Color(0xdedbd5),edgeDark=new T.Color(0x727165),edgeLight=new T.Color(0x585750);
      const state={yaw:0,tilt:0,spread:0,shell:0,light:0,wire:0,zoom:.90,lift:0};
      const keys=[
        {at:0,yaw:0,tilt:0,spread:0,shell:0,light:0,wire:0,zoom:1.0,lift:0},
        {at:.12,yaw:.14,tilt:0,spread:0,shell:0,light:0,wire:0,zoom:.91,lift:0},
        {at:.27,yaw:-.16,tilt:0,spread:.16,shell:.5,light:.85,wire:0,zoom:.78,lift:0},
        {at:.41,yaw:.12,tilt:0,spread:.27,shell:1,light:1,wire:.12,zoom:.74,lift:0},
        {at:.55,yaw:-.18,tilt:0,spread:.36,shell:.78,light:0,wire:0,zoom:.74,lift:0},
        {at:.72,yaw:.16,tilt:0,spread:.45,shell:.86,light:0,wire:.08,zoom:.72,lift:0},
        {at:.88,yaw:-.08,tilt:0,spread:.86,shell:1,light:1,wire:.95,zoom:.57,lift:0},
        {at:1,yaw:0,tilt:0,spread:1,shell:1,light:1,wire:1,zoom:.50,lift:0},
      ];
      const timeline=createTimeline({autoplay:false});
      keys.slice(1).forEach((k,i)=>{timeline.add(state,{yaw:k.yaw,tilt:k.tilt,spread:k.spread,shell:k.shell,light:k.light,wire:k.wire,zoom:k.zoom,duration:(k.at-keys[i].at)*10000,ease:'inOutSine'},keys[i].at*10000);});
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
      let displayed=latest.current.progress;let last=0;let mobile=false;let width=1;let height=1;
      function resize(){width=element!.clientWidth;height=element!.clientHeight;mobile=width<1100;const aspect=width/height;const vertical=mobile?18.8:13.2;camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,mobile?1.45:1.7));}
      const observer=new ResizeObserver(resize);observer.observe(element);resize();
      const raycaster=new T.Raycaster();const pointer=new T.Vector2();let downX=0,downY=0;
      const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY;};
      const up=(e:PointerEvent)=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>8)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(model.root,true).find(h=>h.object instanceof T.Mesh);if(!hit)return;const category=hit.object.userData.category as Category;latest.current.onSelect(category==='repair'?'repair':category==='bill'?'bill':'room');};
      renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
      const lost=(event:Event)=>{event.preventDefault();renderer.setAnimationLoop(null);setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
      renderer.setAnimationLoop((time)=>{
        if(document.hidden)return;
        const delta=Math.min(.05,(time-last)/1000||.016);last=time;
        displayed=reduced.matches?latest.current.progress:T.MathUtils.lerp(displayed,latest.current.progress,1-Math.exp(-delta*9));
        timeline.seek(displayed*10000);
        background.copy(dark).lerp(cream,state.light);ambient.intensity=2.3*(1-state.wire);key.intensity=3.2*(1-state.wire);rim.intensity=2*(1-state.wire);
        const aspect=width/height;model.root.position.set(mobile?0:aspect*1.85,mobile?4.3:0,0);model.root.rotation.set(0,0,0);
        camera.zoom=mobile?.75-state.spread*.22:state.zoom;camera.updateProjectionMatrix();grid.position.x=model.root.position.x;gridMaterial.opacity=.065*(1-state.spread);grid.visible=!mobile&&state.spread<.85;
        for(const part of model.parts){let amount=state.spread;
          if(part.category==='shell')amount=Math.max(state.spread,state.shell);
          if(part.category==='roof')amount=Math.max(state.spread,state.shell*.7);
          if(part.category==='repair')amount=Math.max(state.spread,state.shell*.36 + .65*T.MathUtils.smoothstep(displayed,.43,.5)*(1-T.MathUtils.smoothstep(displayed,.58,.67)));
          if(part.category==='bill')amount=Math.max(state.spread,state.shell*.3 + .75*T.MathUtils.smoothstep(displayed,.61,.68)*(1-T.MathUtils.smoothstep(displayed,.76,.84)));
          part.object.position.copy(part.home).addScaledVector(part.spread,amount);part.object.rotation.set(part.spin.x*amount,part.spin.y*amount,part.spin.z*amount);
        }
        for(const m of model.surfaceMaterials){const base=m.userData.baseColor as import('three').Color;const emissive=m.userData.baseEmissive as import('three').Color;m.color.copy(base).lerp(cream,state.wire);m.emissive.copy(emissive).lerp(cream,state.wire);m.emissiveIntensity=.24*(1-state.wire)+state.wire;m.metalness=.12*(1-state.wire);m.roughness=.7+state.wire*.3;}
        for(const m of model.edgeMaterials){m.color.copy(edgeDark).lerp(edgeLight,state.wire);m.opacity=.16+state.wire*.62;const c=m.userData.category;const focus=(displayed>.29&&displayed<.46&&c==='room')||(displayed>.46&&displayed<.63&&c==='repair')||(displayed>.63&&displayed<.79&&c==='bill');if(focus){m.color.set(c==='repair'?0xc7eb86:c==='bill'?0xb9a5e9:0x9e6752);m.opacity=.64;}}
        renderer.render(scene,camera);element!.dataset.ready='true';element!.dataset.progress=displayed.toFixed(3);element!.dataset.parts=String(model.parts.length);element!.dataset.drawCalls=String(renderer.info.render.calls);
      });
      cleanup=()=>{renderer.setAnimationLoop(null);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('webglcontextlost',lost);timeline.revert();model.dispose();gridGeometry.dispose();gridMaterial.dispose();renderer.dispose();renderer.domElement.remove();};
    }).catch(error=>{console.error('Residence scene unavailable',error);cleanup();if(alive)setFailed(true);});
    return()=>{alive=false;cleanup();};
  },[]);
  return <div className={s.scene} ref={host} data-scene="residence">{failed&&<p role="alert" className={s.fallback}>当前浏览器无法显示三维场景。你仍可通过页面按钮使用公寓服务。</p>}</div>;
}
