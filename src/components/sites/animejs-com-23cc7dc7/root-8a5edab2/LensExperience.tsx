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
  theme: 'light' | 'dark';
  onSeek: (index: number) => void;
}

export function LensExperience({ features, activeIndex, localProgress, blurred, transitioning, theme, onSeek }: Props) {
  const shell = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blurred || !shell.current) return;
    animate(shell.current, { scale: [0.96, 1], filter: ['blur(14px)', 'blur(0px)'], opacity: [0.55, 1], duration: 760, ease: 'outExpo' });
  }, [blurred, features]);

  const active = features[activeIndex];
  const blueprint = theme === 'light';
  const activeColor = blueprint ? '#242321' : active?.color ?? '#777';
  const count = Math.max(1, features.length);
  const segmentLength = 100 / count - 1.25;

  return <div ref={shell} className={s.shell} data-blurred={blurred} data-transitioning={transitioning} data-theme={theme}>
    <svg className={s.lens} viewBox="0 0 640 640" role="img" aria-label={blurred ? '等待登录的 Dorma 镜头' : active.title + '动画'}>
      <defs>
        <radialGradient id="lens-glass" cx="38%" cy="30%">
          <stop offset="0" stopColor="#3d3b3c" stopOpacity=".54" />
          <stop offset=".56" stopColor="#202020" stopOpacity=".18" />
          <stop offset="1" stopColor="#090909" stopOpacity=".85" />
        </radialGradient>
        <filter id="lens-glow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill={activeColor} opacity={blueprint ? '.34' : '.18'} /></pattern>
        <mask id="tick-progress-mask">
          <circle cx="320" cy="320" r="242" pathLength="100" fill="none" stroke="white" strokeWidth="18" strokeDasharray={(localProgress * 100) + ' ' + (100 - localProgress * 100)} transform="rotate(-90 320 320)" />
        </mask>
        <mask id="tick-sweep-mask">
          <circle cx="320" cy="320" r="242" pathLength="100" fill="none" stroke="white" strokeWidth="26" strokeDasharray="9 91" transform={'rotate(' + (-90 + localProgress * 360) + ' 320 320)'} />
        </mask>
      </defs>
      <circle cx="320" cy="320" r="291" fill={blueprint ? '#f2f0ea' : '#171717'} stroke={blueprint ? '#242321' : '#090909'} strokeWidth="14" />
      <circle cx="320" cy="320" r="274" fill="none" stroke={blueprint ? '#8f8b84' : '#30302f'} strokeWidth="5" />
      <circle cx="320" cy="320" r="258" fill="none" stroke={blueprint ? '#d4d0c8' : '#111'} strokeWidth="13" />
      {features.map((feature, index) => {
        const segmentProgress = blurred ? 0 : index < activeIndex ? 1 : index === activeIndex ? localProgress : 0;
        const rotation = -90 + index * 360 / count;
        return <g key={feature.id}>
          <circle
            className={s.segmentBase}
            cx="320" cy="320" r="265"
            pathLength="100"
            fill="none"
            stroke={blueprint ? '#aaa69f' : blurred ? '#575450' : '#30302d'}
            strokeWidth="7"
            strokeLinecap="butt"
            strokeDasharray={segmentLength + ' ' + (100 - segmentLength)}
            transform={'rotate(' + rotation + ' 320 320)'}
            onClick={() => onSeek(index)}
          />
          {segmentProgress > 0 && <circle
            className={index === activeIndex ? s.activeSegment : s.segment}
            cx="320" cy="320" r="265"
            pathLength="100"
            fill="none"
            stroke={blueprint ? '#242321' : feature.color}
            strokeWidth={index === activeIndex ? 9 : 7}
            strokeLinecap="butt"
            strokeDasharray={(segmentLength * segmentProgress) + ' ' + (100 - segmentLength * segmentProgress)}
            transform={'rotate(' + rotation + ' 320 320)'}
          />}
        </g>;
      })}
      <circle className={s.ticksBase} cx="320" cy="320" r="242" pathLength="120" fill="none" stroke={blueprint ? '#918d86' : '#56534c'} strokeWidth="15" strokeDasharray=".28 .72" opacity=".52" />
      {!blurred && <circle className={s.ticks} cx="320" cy="320" r="242" pathLength="120" fill="none" stroke={activeColor} strokeWidth="15" strokeDasharray=".28 .72" mask="url(#tick-progress-mask)" />}
      {!blurred && <circle className={s.tickSweep} cx="320" cy="320" r="242" pathLength="120" fill="none" stroke={activeColor} strokeWidth="24" strokeDasharray=".28 .72" mask="url(#tick-sweep-mask)" />}
      <circle cx="320" cy="320" r="225" fill={blueprint ? '#f7f5ef' : 'url(#lens-glass)'} stroke={blueprint ? '#242321' : '#090909'} strokeWidth="8" />
      <circle className={s.dotField} cx="320" cy="320" r="205" fill="url(#dot-grid)" fillOpacity={blurred ? 0 : .08 + localProgress * .92} stroke={blueprint ? '#aaa69f' : '#2b2929'} strokeWidth="2" />
      <path className={s.glare} d="M177 180c54-62 128-88 208-70-75 13-126 50-170 111-22 31-35 64-42 101-18-44-16-99 4-142Z" fill={blueprint ? '#242321' : undefined} />
      {!blurred && <MotionGraphic feature={{ ...active, color: activeColor }} progress={localProgress} blueprint={blueprint} />}
      <line x1="320" y1="64" x2="320" y2="84" stroke={activeColor} strokeWidth="3" />
    </svg>
  </div>;
}

function MotionGraphic({ feature, progress }: { feature: RoleFeature; progress: number; blueprint: boolean }) {
  const p = Math.max(0, Math.min(1, progress));
  const color = feature.color;

  if (feature.motion === 'identity') {
    return <g className={s.motion}>
      {Array.from({ length: 28 }, (_, index) => {
        const angle = index * (Math.PI * 2 / 28);
        const innerX = 320 + Math.cos(angle) * 42;
        const innerY = 320 + Math.sin(angle) * 42;
        const outerX = 320 + Math.cos(angle) * 172;
        const outerY = 320 + Math.sin(angle) * 172;
        const delay = (index % 7) * .12;
        return <circle key={index} cx={innerX} cy={innerY} r="3" fill={color}>
          <animate attributeName="cx" values={innerX + ';' + outerX} dur="2.8s" begin={delay + 's'} repeatCount="indefinite" />
          <animate attributeName="cy" values={innerY + ';' + outerY} dur="2.8s" begin={delay + 's'} repeatCount="indefinite" />
          <animate attributeName="r" values="3;11;0" keyTimes="0;.54;1" dur="2.8s" begin={delay + 's'} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;.92;0" keyTimes="0;.28;1" dur="2.8s" begin={delay + 's'} repeatCount="indefinite" />
        </circle>;
      })}
      <circle cx="320" cy="270" r="42" fill="none" stroke={color} strokeWidth="6" />
      <path d="M238 421C241 365 272 337 320 337C368 337 399 365 402 421" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <path d="M248 424C263 397 286 383 320 383C354 383 377 397 392 424" fill="none" stroke={color} strokeWidth="2" opacity=".5" />
    </g>;
  }

  if (feature.motion === 'battery') {
    const height = 190 * p;
    return <g className={s.motion} filter="url(#lens-glow)">
      <rect className={s.batteryShell} x="248" y="184" width="144" height="266" rx="37" fill="none" stroke={color} strokeWidth="6" />
      <rect className={s.batteryCap} x="298" y="165" width="44" height="15" rx="7" fill={color} />
      <clipPath id="battery-clip"><rect x="260" y="197" width="120" height="240" rx="27" /></clipPath>
      <rect className={s.batteryFill} x="260" y={427 - height} width="120" height={height} fill={color} clipPath="url(#battery-clip)" opacity=".88" />
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

  if (feature.motion === 'workflow') {
    const guideProgress = Math.min(1, p * 1.65);
    return <g className={s.motion}>
      <path id="repair-guide" d="M174 380C220 192 345 205 352 319C359 433 425 440 466 260" pathLength="100" fill="none" stroke={color} strokeWidth="2" strokeDasharray={(guideProgress * 100) + ' 100'} opacity=".46" />
      {Array.from({ length: 8 }, (_, index) => {
        const reveal = Math.max(0, Math.min(1, p * 1.55 - index * .075));
        const offset = (index - 3.5) * 8;
        return <path
          key={index}
          d="M174 380C220 192 345 205 352 319C359 433 425 440 466 260"
          pathLength="100"
          fill="none"
          stroke={color}
          strokeWidth={index === 3 || index === 4 ? 5 : 2.4}
          strokeDasharray={(reveal * 100) + ' 100'}
          strokeLinecap="round"
          transform={'translate(' + offset + ' ' + (-offset * .55) + ')'}
          opacity={.2 + (1 - Math.abs(index - 3.5) / 4) * .66}
        />;
      })}
      <circle r="7" fill={color} filter="url(#lens-glow)">
        <animateMotion dur="3.8s" repeatCount="indefinite" rotate="auto"><mpath href="#repair-guide" /></animateMotion>
      </circle>
      {[0, 1, 2].map(index => <circle key={index} cx={214 + index * 112} cy={index === 1 ? 249 : index === 2 ? 391 : 302} r={6 + p * 7} fill="#171717" stroke={color} strokeWidth="3" opacity={Math.max(.18, p - index * .16)} />)}
    </g>;
  }

  if (feature.motion === 'orderRoute') {
    return <g className={s.motion}>
      <g className={s.routeMap}>
        <path id="order-intake-route" d="M203 247C255 177 362 187 405 244C458 313 429 410 349 431C270 453 185 397 191 322C194 286 225 275 263 292C301 309 332 367 382 350C423 336 427 284 394 257C360 230 307 239 282 273C253 312 276 365 319 374" fill="none" stroke={color} strokeWidth="12" opacity=".18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M203 247C255 177 362 187 405 244C458 313 429 410 349 431C270 453 185 397 191 322C194 286 225 275 263 292C301 309 332 367 382 350C423 336 427 284 394 257C360 230 307 239 282 273C253 312 276 365 319 374" pathLength="100" fill="none" stroke={color} strokeWidth="4" strokeDasharray={(p * 100) + ' 100'} strokeLinecap="round" strokeLinejoin="round" />
        {[['203', '247'], ['405', '244'], ['349', '431'], ['191', '322'], ['382', '350']].map(([x, y], index) => <circle key={x + y} cx={x} cy={y} r={p > index * .18 ? 10 : 5} fill={p > index * .18 ? color : '#20201f'} stroke={color} strokeWidth="2" />)}
        <polygon className={s.routeArrow} points="-13,-8 14,0 -13,8 -7,0" fill={color} filter="url(#lens-glow)">
          <animateMotion dur="5.4s" repeatCount="indefinite" rotate="auto"><mpath href="#order-intake-route" /></animateMotion>
        </polygon>
      </g>
      <circle className={s.routeHub} cx="320" cy="320" r={25 + p * 11} fill="#171717" stroke={color} strokeWidth="4" />
      <path d="M307 320l9 9 19-21" fill="none" stroke={color} strokeWidth="4" pathLength="100" strokeDasharray={(p * 100) + ' 100'} />
    </g>;
  }

  if (feature.motion === 'service') {
    const turn = -32 + p * 88;
    return <g className={s.motion}>
      <circle cx="320" cy="320" r="132" fill="none" stroke={color} strokeWidth="3" strokeDasharray="5 12" opacity=".38" />
      <circle className={s.serviceOrbit} cx="320" cy="320" r="108" fill="none" stroke={color} strokeWidth="9" pathLength="100" strokeDasharray={(18 + p * 72) + ' 100'} strokeLinecap="round" />
      <g className={s.serviceTool} transform={'rotate(' + turn + ' 320 320)'}>
        <path d="M258 212C279 224 288 247 281 268L371 358C385 372 385 394 371 408C357 422 335 422 321 408L231 318C210 325 187 316 175 295L215 283L226 250L214 210C229 206 244 207 258 212Z" fill="none" stroke={color} strokeWidth="9" strokeLinejoin="round" />
        <circle cx="346" cy="383" r="11" fill="none" stroke={color} strokeWidth="5" />
      </g>
      {[0, 1, 2].map(index => <g key={index} transform={'rotate(' + (-90 + index * 120) + ' 320 320)'}><circle cx="320" cy="188" r={p > index / 3 ? 13 : 7} fill={p > index / 3 ? color : '#1d1d1c'} stroke={color} strokeWidth="3" /><line x1="320" y1="205" x2="320" y2="226" stroke={color} strokeWidth="3" /></g>)}
    </g>;
  }

  if (feature.motion === 'dispatch') {
    const branches = ['M190 320H310L448 220', 'M190 320H465', 'M190 320H310L448 420'];
    return <g className={s.motion}>
      {branches.map((path, index) => <path key={path} d={path} pathLength="100" fill="none" stroke={color} strokeWidth="4" strokeDasharray={(Math.max(0, p * 1.35 - index * .16) * 100) + ' 100'} opacity={1 - index * .18} />)}
      {[220, 320, 420].map((y, index) => <g key={y}><circle cx="448" cy={y} r={p > .55 + index * .1 ? 16 : 7} fill={p > .55 + index * .1 ? color : '#20201f'} stroke={color} strokeWidth="3" /><circle cx="448" cy={y} r={26 + p * 8} fill="none" stroke={color} opacity={p * .35} /></g>)}
      <rect x="165" y="299" width="50" height="42" rx="5" fill={color} opacity={.3 + p * .7} />
    </g>;
  }

  if (feature.motion === 'rules') {
    return <g className={s.motion}>
      {[244, 320, 396].map((x, index) => <g key={x} transform={'rotate(' + ((p > index / 3 ? 1 : 0) * (index % 2 ? -28 : 28)) + ' ' + x + ' 320)'}>
        <line x1={x} y1="238" x2={x} y2="402" stroke={color} strokeWidth="8" />
        <circle cx={x} cy="320" r="12" fill="#181818" stroke={color} strokeWidth="3" />
      </g>)}
      {[270, 320, 370].map((y, index) => <circle key={y} cx={180 + p * 280} cy={y} r={8 + index * 2} fill={color} opacity={.5 + index * .2} />)}
      <path d="M170 438H470" stroke={color} strokeWidth="2" strokeDasharray="8 10" opacity={p} />
    </g>;
  }

  if (feature.motion === 'rooms') {
    return <g className={s.motion}>
      {[0, 1, 2].map(index => {
        const x = 205 + index * 82 + (index - 1) * p * 25;
        const y = 242 + Math.abs(index - 1) * p * 30;
        return <g key={index} transform={'translate(' + (index === 0 ? -p * 12 : index === 2 ? p * 12 : 0) + ' 0)'}>
          <rect x={x} y={y} width="66" height="150" rx="4" fill={index === Math.round(p * 2) ? color : 'none'} fillOpacity=".22" stroke={color} strokeWidth={index === Math.round(p * 2) ? 5 : 2} />
          <line x1={x + 14} y1={y + 105} x2={x + 52} y2={y + 105} stroke={color} strokeWidth="3" />
          <circle cx={x + 52} cy={y + 76} r="4" fill={color} />
        </g>;
      })}
      <path d="M220 430H420" stroke={color} strokeWidth="3" strokeDasharray={(p * 200) + ' 220'} />
    </g>;
  }

  if (feature.motion === 'data') {
    const morphWidth = 48 + p * 190;
    const morphHeight = 218 - p * 158;
    return <g className={s.motion}>
      {[0, 1, 2].map(index => <rect key={index} x={320 - morphWidth / 2 - index * 13} y={320 - morphHeight / 2 + index * 13} width={morphWidth + index * 26} height={morphHeight - index * 26} rx={8 + p * 18} fill={index === 0 ? color : 'none'} fillOpacity={index === 0 ? .16 + p * .38 : 0} stroke={color} strokeWidth={index === 0 ? 5 : 2} opacity={1 - index * .22} />)}
      {Array.from({ length: 5 }, (_, index) => <line key={index} x1={235 + p * 28} y1={270 + index * 25} x2={235 + p * (145 + index * 4)} y2={270 + index * 25} stroke={color} strokeWidth={index === 0 ? 7 : 3} opacity={Math.max(.12, p - index * .1)} />)}
    </g>;
  }

  if (feature.motion === 'record') {
    return <g className={s.motion}>
      <rect x="218" y="190" width="204" height="260" rx="9" fill="none" stroke={color} strokeWidth="3" />
      {Array.from({ length: 6 }, (_, index) => {
        const lineProgress = Math.max(0, Math.min(1, p * 2.1 - index * .18));
        return <line key={index} x1="247" y1={235 + index * 31} x2={247 + 145 * lineProgress} y2={235 + index * 31} stroke={color} strokeWidth={index === 0 ? 7 : 4} opacity={.35 + lineProgress * .65} />;
      })}
      <circle cx="386" cy="410" r={18 + p * 12} fill="none" stroke={color} strokeWidth="4" opacity={p} />
      <path d="M370 410l11 11 23-27" fill="none" stroke={color} strokeWidth="5" pathLength="100" strokeDasharray={(p * 100) + ' 100'} />
    </g>;
  }

  if (feature.motion === 'ledger') {
    return <g className={s.motion}>
      {[78, 128, 96, 176, 142].map((height, index) => {
        const animatedHeight = height * p;
        return <rect key={index} x={215 + index * 46} y={410 - animatedHeight} width="26" height={animatedHeight} rx="3" fill={color} opacity={.35 + index * .13} />;
      })}
      {[245, 300, 355].map((y, index) => <line key={y} x1="205" y1={y} x2={435 - index * 25} y2={y} stroke={color} strokeWidth="3" strokeDasharray={(p * 240) + ' 260'} opacity={.85 - index * .18} />)}
      <line x1="198" y1="414" x2="442" y2="414" stroke={color} strokeWidth="5" />
    </g>;
  }

  if (feature.motion === 'analytics') {
    return <g className={s.motion}>
      {[72, 108, 145].map((radius, index) => <circle key={radius} cx="320" cy="320" r={radius} fill="none" stroke={color} strokeWidth={index === 0 ? 11 : 4} pathLength="100" strokeDasharray={(p * (58 + index * 12)) + ' 100'} transform={'rotate(' + (-90 + index * 56) + ' 320 320)'} opacity={1 - index * .22} />)}
      {[0, 1, 2, 3].map(index => <rect key={index} x={252 + index * 46} y={355 - index * 23 * p} width="22" height={45 + index * 23 * p} fill={color} opacity={.32 + index * .18} />)}
    </g>;
  }

  if (feature.motion === 'permissions') {
    const angles = [-90, 0, 90, 180];
    return <g className={s.motion}>
      <circle cx="320" cy="320" r="42" fill={color} opacity={.18 + p * .55} stroke={color} strokeWidth="4" />
      {angles.map((angle, index) => {
        const radians = angle * Math.PI / 180;
        const x = 320 + Math.cos(radians) * 135;
        const y = 320 + Math.sin(radians) * 135;
        return <g key={angle}>
          <line x1="320" y1="320" x2={x} y2={y} stroke={color} strokeWidth="4" pathLength="100" strokeDasharray={(Math.max(0, p * 1.5 - index * .16) * 100) + ' 100'} />
          <rect x={x - 23} y={y - 18} width="46" height="36" rx="5" fill={p > index * .2 ? color : '#1c1c1b'} fillOpacity={p > index * .2 ? .68 : 1} stroke={color} strokeWidth="3" />
        </g>;
      })}
    </g>;
  }

  if (feature.motion === 'backup') {
    return <g className={s.motion}>
      {[250, 390].map((x, index) => <g key={x}>
        <circle cx={x} cy="320" r={64 + index * 8} fill="none" stroke={color} strokeWidth="5" strokeDasharray={index ? '8 10' : undefined} opacity={index ? p : 1} />
        <circle cx={x} cy="320" r="38" fill={color} opacity={index ? p * .35 : .35} />
      </g>)}
      <path d="M300 320H350" stroke={color} strokeWidth="5" strokeDasharray={(p * 50) + ' 60'} />
      {Array.from({ length: 4 }, (_, index) => <circle key={index} cx={292 + ((p + index * .22) % 1) * 106} cy={302 + index * 12} r="6" fill={color} filter="url(#lens-glow)" />)}
      <path d="M230 400C285 448 385 448 430 398" fill="none" stroke={color} strokeWidth="3" pathLength="100" strokeDasharray={(p * 100) + ' 100'} />
    </g>;
  }

  if (feature.motion === 'broadcast') {
    const angle = p * Math.PI * 2 - Math.PI / 2;
    const needleStartX = 320 + Math.cos(angle) * 28;
    const needleStartY = 320 + Math.sin(angle) * 28;
    const needleEndX = 320 + Math.cos(angle) * 148;
    const needleEndY = 320 + Math.sin(angle) * 148;
    return <g className={s.motion}>
      {[55, 92, 132].map((radius, index) => <circle className={s.echoRing} key={radius} cx="320" cy="320" r={radius * p} fill="none" stroke={color} strokeWidth="4" opacity={1 - index * .24} />)}
      <line x1={needleStartX} y1={needleStartY} x2={needleEndX} y2={needleEndY} stroke={color} strokeWidth="6" strokeLinecap="round" />
      <circle className={s.pulseDot} cx="320" cy="320" r="12" fill={color} />
    </g>;
  }

  return <g className={s.motion}>
    <rect x="238" y="185" width="164" height="270" rx="50" fill="none" stroke={color} strokeWidth="4" strokeDasharray={(p * 650) + ' 700'} />
    <circle cx="320" cy="270" r={34 + p * 6} fill={color} fillOpacity=".35" stroke={color} strokeWidth="4" />
    {[0, 1, 2].map(index => <line key={index} x1="270" y1={350 + index * 28} x2={270 + (100 - index * 14) * p} y2={350 + index * 28} stroke={color} strokeWidth={index === 0 ? 7 : 4} />)}
    <circle cx="390" cy="420" r={8 + p * 7} fill={color} filter="url(#lens-glow)" />
  </g>;
}
