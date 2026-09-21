'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import type { RoleFeature } from '@/lib/role-experiences';
import s from './LensExperience.module.css';

interface Props {
  features: RoleFeature[];
  activeIndex: number;
  localProgress: number;
  blurred: boolean;
  transitioning: boolean;
  onSeek: (index: number) => void;
}

export function LensExperience({ features, activeIndex, localProgress, blurred, transitioning, onSeek }: Props) {
  const shell = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blurred || !shell.current) return;
    animate(shell.current, { scale: [0.96, 1], filter: ['blur(14px)', 'blur(0px)'], opacity: [0.55, 1], duration: 760, ease: 'outExpo' });
  }, [blurred, features]);

  const active = features[activeIndex];
  const count = Math.max(1, features.length);
  const segmentLength = 100 / count - 1.25;

  return <div ref={shell} className={s.shell} data-blurred={blurred} data-transitioning={transitioning}>
    <svg className={s.lens} viewBox="0 0 640 640" role="img" aria-label={blurred ? '等待登录的 Dorma 镜头' : active.title + '动画'}>
      <defs>
        <radialGradient id="lens-glass" cx="38%" cy="30%">
          <stop offset="0" stopColor="#3d3b3c" stopOpacity=".54" />
          <stop offset=".56" stopColor="#202020" stopOpacity=".18" />
          <stop offset="1" stopColor="#090909" stopOpacity=".85" />
        </radialGradient>
        <filter id="lens-glow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill={active?.color ?? '#777'} opacity=".18" /></pattern>
      </defs>
      <circle cx="320" cy="320" r="291" fill="#171717" stroke="#090909" strokeWidth="14" />
      <circle cx="320" cy="320" r="274" fill="none" stroke="#30302f" strokeWidth="5" />
      <circle cx="320" cy="320" r="258" fill="none" stroke="#111" strokeWidth="13" />
      {features.map((feature, index) => <circle
        key={feature.id}
        className={index === activeIndex ? s.activeSegment : s.segment}
        cx="320" cy="320" r="265"
        pathLength="100"
        fill="none"
        stroke={index <= activeIndex ? feature.color : '#30302d'}
        strokeWidth={index === activeIndex ? 9 : 7}
        strokeLinecap="butt"
        strokeDasharray={segmentLength + ' ' + (100 - segmentLength)}
        transform={'rotate(' + (-90 + index * 360 / count) + ' 320 320)'}
        onClick={() => onSeek(index)}
      />)}
      <circle className={s.ticks} cx="320" cy="320" r="242" pathLength="120" fill="none" stroke={blurred ? '#56534c' : active.color} strokeWidth="10" strokeDasharray=".28 .72" opacity=".52" />
      <circle cx="320" cy="320" r="225" fill="url(#lens-glass)" stroke="#090909" strokeWidth="8" />
      <circle cx="320" cy="320" r="205" fill="url(#dot-grid)" stroke="#2b2929" strokeWidth="2" />
      <path className={s.glare} d="M177 180c54-62 128-88 208-70-75 13-126 50-170 111-22 31-35 64-42 101-18-44-16-99 4-142Z" />
      {!blurred && <MotionGraphic feature={active} progress={localProgress} />}
      {blurred && <g className={s.locked}><circle cx="320" cy="300" r="35" /><path d="M270 356v-20c0-26 21-47 47-47h6c26 0 47 21 47 47v20" /><line x1="320" y1="322" x2="320" y2="370" /></g>}
      <line x1="320" y1="64" x2="320" y2="84" stroke={active?.color ?? '#777'} strokeWidth="3" />
    </svg>
  </div>;
}

function MotionGraphic({ feature, progress }: { feature: RoleFeature; progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  const color = feature.color;

  if (feature.motion === 'battery') {
    const height = 190 * p;
    return <g className={s.motion} filter="url(#lens-glow)">
      <rect x="248" y="184" width="144" height="266" rx="37" fill="none" stroke={color} strokeWidth="6" />
      <rect x="298" y="165" width="44" height="15" rx="7" fill={color} />
      <clipPath id="battery-clip"><rect x="260" y="197" width="120" height="240" rx="27" /></clipPath>
      <rect x="260" y={427 - height} width="120" height={height} fill={color} clipPath="url(#battery-clip)" opacity=".88" />
      <text x="320" y="333" textAnchor="middle" fill="#f4f1ea">{Math.round(p * 100)}%</text>
    </g>;
  }

  if (feature.motion === 'beds') {
    return <g className={s.motion}>{Array.from({ length: 20 }, (_, index) => {
      const lit = index / 20 <= p;
      const x = 213 + (index % 4) * 58;
      const y = 203 + Math.floor(index / 4) * 52;
      return <rect key={index} x={x} y={y} width="42" height="31" rx="2" fill={lit ? color : 'none'} fillOpacity={index === 13 ? .18 : .78} stroke={index === 13 ? '#ff5367' : color} strokeWidth={lit ? 2.5 : 1} opacity={lit ? 1 : .25} />;
    })}</g>;
  }

  if (feature.motion === 'workflow' || feature.motion === 'dispatch' || feature.motion === 'rules') {
    const end = 458;
    const dotX = 184 + (end - 184) * p;
    return <g className={s.motion}>
      <path d={feature.motion === 'dispatch' ? 'M184 320H310M310 320L430 230M310 320L458 320M310 320L430 410' : 'M184 320C235 214 311 425 458 282'} fill="none" stroke={color} strokeWidth="4" strokeDasharray={Math.max(1, p * 500) + ' 500'} />
      {[184, 252, 320, 390, 458].map((x, index) => <circle key={x} cx={x} cy={feature.motion === 'dispatch' && index > 2 ? 320 + (index - 3) * 90 : 320} r={index / 4 <= p ? 10 : 6} fill={index / 4 <= p ? color : '#20201f'} stroke={color} strokeWidth="2" />)}
      {feature.motion !== 'dispatch' && <circle cx={dotX} cy={320 + Math.sin(p * Math.PI * 2) * 55} r="8" fill={color} filter="url(#lens-glow)" />}
    </g>;
  }

  if (feature.motion === 'rooms' || feature.motion === 'data' || feature.motion === 'record' || feature.motion === 'ledger') {
    return <g className={s.motion}>{Array.from({ length: 5 }, (_, index) => {
      const offset = (index - 2) * (32 + p * 18);
      const width = feature.motion === 'ledger' ? 220 - index * 18 : 170;
      return <g key={index} transform={'translate(0 ' + offset + ')'} opacity={.22 + Math.min(1, p * 2 - index * .12) * .78}>
        <rect x={(640 - width) / 2} y="295" width={width} height={feature.motion === 'record' ? 4 : 24} rx="3" fill={index <= p * 5 ? color : '#3a3937'} />
        {feature.motion === 'data' && <circle cx={(640 + width) / 2 + 18} cy="307" r="5" fill={color} />}
      </g>;
    })}</g>;
  }

  if (feature.motion === 'analytics' || feature.motion === 'permissions' || feature.motion === 'backup') {
    return <g className={s.motion}>
      {[72, 108, 145].map((radius, index) => <circle key={radius} cx="320" cy="320" r={radius} fill="none" stroke={color} strokeWidth={index === 0 ? 11 : 4} pathLength="100" strokeDasharray={(p * (65 + index * 10)) + ' 100'} transform={'rotate(' + (-90 + index * 56) + ' 320 320)'} opacity={1 - index * .22} />)}
      {feature.motion === 'permissions' && [0, 90, 180, 270].map(angle => <line key={angle} x1="320" y1="320" x2={320 + Math.cos(angle * Math.PI / 180) * 145} y2={320 + Math.sin(angle * Math.PI / 180) * 145} stroke={color} opacity={p} />)}
    </g>;
  }

  if (feature.motion === 'broadcast') {
    return <g className={s.motion}>{[55, 92, 132].map((radius, index) => <circle key={radius} cx="320" cy="320" r={radius * p} fill="none" stroke={color} strokeWidth="4" opacity={1 - index * .24} />)}<circle cx="320" cy="320" r="12" fill={color} /></g>;
  }

  return <g className={s.motion}>{Array.from({ length: 5 }, (_, index) => <circle key={index} cx={242 + index * 39} cy={255 + index * 31 * p} r={13 + index * 3} fill={index / 5 <= p ? color : 'none'} stroke={color} strokeWidth="3" />)}</g>;
}
