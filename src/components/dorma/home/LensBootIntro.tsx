'use client';

import type { RoleFeature } from '@/lib/role-experiences';
import s from './LensBootIntro.module.css';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const tickCount = 216;

export function LensBootIntro({ progress, features, theme }: { progress: number; features: RoleFeature[]; theme: 'light' | 'dark' }) {
  const light = theme === 'light';
  const tickSweep = clamp((progress - .035) / (light ? .14 : .15));
  const segmentLength = 100 / Math.max(1, features.length) - .45;
  const reveal = clamp((progress - (light ? .48 : .51)) / (light ? .22 : .19));
  const lampDim = light ? 1 : 1 - .16 * reveal;
  const ringOpacity = light ? 1 : 1 - reveal;
  const ignitionOrder = features.length === 4 ? [0, 2, 3, 1] : features.length === 6 ? [0, 3, 1, 5, 2, 4] : [0, 3, 1, 4, 2];

  return <div className={s.overlay} data-theme={theme} aria-hidden="true">
    <svg className={s.blackout} width="100%" height="100%" aria-hidden="true">
      <rect width="100%" height="100%" fill={light ? '#efede7' : '#030303'} opacity={light ? (progress < .48 ? 1 : 0) : 1 - reveal} />
    </svg>
    <svg className={s.ring} viewBox="0 0 640 640" opacity={ringOpacity}>
      {!light && <circle cx="320" cy="320" r="281" fill="none" stroke="#1d1818" strokeWidth="1" opacity={clamp((progress - .12) / .22) * .5} />}
      <g stroke={light ? '#242321' : features[0]?.color ?? '#f06169'} strokeWidth={light ? 1.05 : 1.2}>
        {Array.from({ length: tickCount }, (_, index) => {
          const position = index / tickCount;
          const visible = position <= tickSweep;
          const angle = position * Math.PI * 2 - Math.PI / 2;
          return <line key={index}
            x1={320 + Math.cos(angle) * 239} y1={320 + Math.sin(angle) * 239}
            x2={320 + Math.cos(angle) * 255} y2={320 + Math.sin(angle) * 255}
            opacity={visible ? .95 : 0} />;
        })}
      </g>
      {features.map((feature, index) => {
        const position = ignitionOrder.indexOf(index);
        const onset = (light ? .18 : .19) + position * (light ? .043 : .04);
        const ignition = clamp((progress - onset) / .027);
        const flicker = !light && index > 0 && progress - onset < .105 ? .7 + .3 * Math.sin(progress * 240 + index * 7.1) ** 2 : 1;
        const rotation = -90 + index * 360 / features.length;
        return <circle key={feature.id} cx="320" cy="320" r="265" pathLength="100" fill="none"
          stroke={light ? '#242321' : feature.color} strokeWidth={light ? 5.5 : 7}
          strokeDasharray={`${segmentLength} ${100 - segmentLength}`} transform={`rotate(${rotation} 320 320)`}
          opacity={ignition * flicker * lampDim} />;
      })}
    </svg>
  </div>;
}
