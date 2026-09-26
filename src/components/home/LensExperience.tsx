'use client';

import { useEffect, useRef, useState } from 'react';
import type { RoleFeature } from '@/data/role-features';
import s from './LensExperience.module.css';
import { DotWave, HologramRoute, ClockTicks, FloatingShapes, CampusNetwork, ServiceAssembly, RepairScrollLines } from './LensMotionDetails';

function mixHex(from: string, to: string, amount: number) {
  const channel = (color: string, offset: number) => Number.parseInt(color.slice(offset, offset + 2), 16);
  const value = [1, 3, 5].map(offset => Math.round(channel(from, offset) * (1 - amount) + channel(to, offset) * amount));
  return '#' + value.map(part => part.toString(16).padStart(2, '0')).join('');
}

function lensColor(color: string) {
  return mixHex(color, '#77716d', .14);
}

function blueprintDrawPath(progress: number) {
  const sweep = Math.max(0, Math.min(1, progress));
  if (sweep <= 0) return 'M320 320';
  if (sweep >= 1) return 'M0 0H640V640H0Z';
  const angle = -Math.PI / 2 + sweep * Math.PI * 2;
  const x = 320 + Math.cos(angle) * 340;
  const y = 320 + Math.sin(angle) * 340;
  return `M320 320L320 -20A340 340 0 ${sweep > .5 ? 1 : 0} 1 ${x} ${y}Z`;
}

// Keep the highlight on the curved glass edge. Its angular span grows during
// the same camera push that rotates the other reflection lines.
function reflectionBandPath(progress: number) {
  const turn = Math.max(0, Math.min(1, progress));
  const start = -190 + 40 * turn;
  const end = -135 + 60 * turn;
  const point = (radius: number, degrees: number) => {
    const angle = degrees * Math.PI / 180;
    return `${(320 + radius * Math.cos(angle)).toFixed(2)} ${(320 + radius * Math.sin(angle)).toFixed(2)}`;
  };
  return `M${point(218, start)}A218 218 0 0 1 ${point(218, end)}Q${point(205, end + 3)} ${point(194, end)}A194 194 0 0 0 ${point(194, start)}Q${point(206, start - 3)} ${point(218, start)}Z`;
}

// Match the camera push's CSS cubic-bezier(.15,.45,.2,1) in the reflection.
function approachEase(progress: number) {
  const x = Math.max(0, Math.min(1, progress));
  let t = x;
  for (let iteration = 0; iteration < 6; iteration++) {
    const inverse = 1 - t;
    const position = 3 * inverse * inverse * t * .15 + 3 * inverse * t * t * .2 + t * t * t;
    const slope = 3 * inverse * inverse * .15 + 6 * inverse * t * (.2 - .15) + 3 * t * t * (1 - .2);
    t = Math.max(0, Math.min(1, t - (position - x) / slope));
  }
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * .45 + 3 * inverse * t * t + t * t * t;
}

interface Props {
  features: RoleFeature[];
  activeIndex: number;
  localProgress: number;
  blurred: boolean;
  transitioning: boolean;
  theme: 'light' | 'dark';
  hasScrolled: boolean;
  introProgress: number;
}

export function LensExperience({ features, activeIndex, localProgress, blurred, transitioning, theme, hasScrolled, introProgress }: Props) {
  const [finish, setFinish] = useState(0);
  const finishRef = useRef(0);
  const complete = !blurred && activeIndex === features.length - 1 && localProgress >= .995;

  useEffect(() => {
    const from = finishRef.current;
    const target = complete ? 1 : 0;
    if (from === target) return;
    const started = performance.now();
    let frame = 0;
    const update = (time: number) => {
      const t = Math.min(1, (time - started) / 650);
      const eased = t * t * (3 - 2 * t);
      const value = from + (target - from) * eased;
      finishRef.current = value;
      setFinish(value);
      if (t < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [complete]);


  const active = features[activeIndex];
  const blueprint = theme === 'light';
  const targetColor = blueprint ? '#242424' : lensColor(complete ? features[0]?.color ?? '#777777' : active?.color ?? '#777777');
  const [activeColor, setActiveColor] = useState(targetColor);
  const activeColorRef = useRef(targetColor);

  useEffect(() => {
    const from = activeColorRef.current;
    if (from === targetColor) return;
    const started = performance.now();
    let frame = 0;
    const update = (time: number) => {
      const portion = Math.min(1, (time - started) / 160);
      const next = mixHex(from, targetColor, portion * portion * (3 - 2 * portion));
      activeColorRef.current = next;
      setActiveColor(next);
      if (portion < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [targetColor]);
  const count = Math.max(1, features.length);
  const segmentLength = 100 / count - .45;
  const lightTurn = approachEase((introProgress - .7) / (1.15 / 4.8));
  const blueprintSweep = (introProgress - .48) / .22;
  const tickColor = blueprint ? '#5c5954' : active?.motion === 'identity' && !blurred ? active.color : activeColor;

  return <div className={s.shell} data-blurred={blurred} data-transitioning={transitioning} data-theme={theme}>
    <svg className={s.lens} viewBox="0 0 640 640" role="img" aria-label={blurred ? '等待登录的 Dorma 镜头' : active.title + '动画'}>
      <defs>
        <linearGradient id="housing-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={blueprint ? "#b8b4ad" : "#746c64"} /><stop offset=".22" stopColor={blueprint ? "#d1cdc5" : "#383533"} /><stop offset=".5" stopColor={blueprint ? "#898680" : "#171716"} /><stop offset=".78" stopColor={blueprint ? "#b8b4ad" : "#44403b"} /><stop offset="1" stopColor={blueprint ? "#5f5c58" : "#080808"} /></linearGradient>
        <filter id="lens-glow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill={activeColor} opacity={blueprint ? '.34' : '.18'} /></pattern>
        <mask id="tick-progress-mask">
          <circle cx="320" cy="320" r="242" pathLength="100" fill="none" stroke="white" strokeWidth="18" strokeDasharray={(localProgress * 100) + ' ' + (100 - localProgress * 100)} transform="rotate(-90 320 320)" />
        </mask>
        <clipPath id="lens-blueprint-reveal" clipPathUnits="userSpaceOnUse"><path d={blueprintDrawPath(blueprintSweep)} /></clipPath>
      </defs>
      <g clipPath={blueprint && introProgress < .7 ? 'url(#lens-blueprint-reveal)' : undefined}>
      {!blueprint && <circle cx="320" cy="327" r="299" fill="#080808" stroke="#191817" strokeWidth="3" />}
      <circle cx="320" cy="320" r="291" fill={blueprint ? '#efede7' : '#171717'} stroke={blueprint ? '#242424' : '#090909'} strokeWidth="8" />
      <g data-outer-housing="true" fill="none" pointerEvents="none">
        <circle cx="320" cy="320" r="297" stroke={blueprint ? '#5e5e5e' : '#5b5551'} strokeWidth="1.2" />
        <circle cx="320" cy="320" r="288" stroke="url(#housing-metal)" strokeWidth="7" />
        <circle cx="320" cy="320" r="289" pathLength="100" stroke={blueprint ? '#d2cec7' : '#b3a69a'} strokeWidth="1.4" strokeDasharray="22 78" transform="rotate(205 320 320)" opacity=".36" />
      </g>
      <circle cx="320" cy="320" r="274" fill={blueprint ? '#efede7' : 'none'} stroke={blueprint ? '#817e78' : '#30302f'} strokeWidth="2" />
      <circle cx="320" cy="320" r="258" fill="none" stroke={blueprint ? '#b9b5ae' : '#111'} strokeWidth="6" />
      {features.map((feature, index) => {
        const segmentProgress = blurred ? 0 : index < activeIndex ? 1 : index === activeIndex ? (complete ? localProgress + (1 - localProgress) * finish : localProgress) : 0;
        const rotation = -90 + index * 360 / count;
        return <g key={feature.id}>
          <circle
            className={s.segmentBase}
            cx="320" cy="320" r="265"
            pathLength="100"
            fill="none"
            stroke={blueprint ? '#242321' : blurred ? '#575450' : feature.color}
            strokeOpacity={blueprint || blurred ? 1 : 1 - .38 * Math.max(0, Math.min(1, (introProgress - .39) / .57))}
            strokeWidth="7"
            strokeLinecap="butt"
            strokeDasharray={segmentLength + ' ' + (100 - segmentLength)}
            transform={'rotate(' + rotation + ' 320 320)'}
          />
          {segmentProgress > 0 && <>
            <circle
              className={s.activeHalo}
              cx="320" cy="320" r="265"
              pathLength="100" fill="none"
              stroke={blueprint ? '#242424' : feature.color}
              strokeWidth="12"
              strokeDasharray={(segmentLength * segmentProgress) + ' ' + (100 - segmentLength * segmentProgress)}
              transform={'rotate(' + rotation + ' 320 320)'}
              opacity={index === activeIndex && !complete ? .45 : 0}
              filter="url(#lens-glow)"
            />
            <circle
              className={index === activeIndex && !complete ? s.activeSegment : s.segment}
              cx="320" cy="320" r="265"
              pathLength="100"
              fill="none"
              stroke={blueprint ? '#242424' : feature.color}
              strokeWidth={index === activeIndex && !complete ? 11 : 7}
              strokeLinecap="butt"
              strokeDasharray={(segmentLength * segmentProgress) + ' ' + (100 - segmentLength * segmentProgress)}
              transform={'rotate(' + rotation + ' 320 320)'}
            />
          </>}
        </g>;
      })}
      <g data-tick-rails="true" fill="none" stroke={activeColor} opacity={blurred ? .05 : .12} pointerEvents="none">
        {[236, 249].map(radius => <circle key={radius} cx="320" cy="320" r={radius} strokeWidth=".65" />)}
      </g>
      <circle cx="320" cy="320" r="225" fill={blueprint ? '#efede7' : '#151515'} stroke={blueprint ? '#242424' : '#090909'} strokeWidth="5" />
      <circle className={s.dotField} cx="320" cy="320" r="205" fill={blueprint || active?.motion === 'identity' ? "none" : "url(#dot-grid)"} fillOpacity={blurred ? 0 : .08 + localProgress * .92} stroke={blueprint ? '#aaaaaa' : '#2b2929'} strokeWidth="2" />
      <g data-lens-bevel="true" fill="none" pointerEvents="none">
        {[210, 214, 219, 228].map((radius, index) => <circle key={radius} cx="320" cy="320" r={radius} stroke={blueprint ? '#707070' : index % 2 ? '#474342' : '#090909'} strokeWidth={index === 2 ? 2 : .8} opacity={blueprint ? .35 : .8} />)}
      </g>
      <g data-lens-reflection="true" fill="none" transform={'rotate(' + (72 - 72 * lightTurn) + ' 320 320)'} opacity={.38 + .62 * lightTurn} pointerEvents="none">
        <path className={s.glare} d={reflectionBandPath(lightTurn)} fill={blueprint ? '#242424' : undefined} />
        {[211, 216, 222].map((radius, index) => <circle key={radius} cx="320" cy="320" r={radius} stroke={blueprint ? '#242424' : '#ffd0b7'} strokeWidth={index === 1 ? 2.4 : 1.3} pathLength="100" strokeDasharray={(13 - index * 2) + ' 100'} transform={'rotate(' + (5 + index * 5) + ' 320 320)'} opacity={blueprint ? .38 : .78} />)}
      </g>
      {/* Keep extended clock marks above the glass and bevel so their full length stays visible. */}
      <ClockTicks progress={localProgress} color={tickColor} highlightColor={mixHex(tickColor, blueprint ? '#000000' : '#ffffff', blueprint ? .42 : .55)} clock={active?.motion === 'broadcast' && !complete} blurred={blurred} baseOpacity={.65 + .2 * (1 - lightTurn)} />
      {!blurred && <g opacity={1 - finish}><MotionGraphic key={active.id} feature={{ ...active, color: activeColor }} progress={localProgress} blueprint={blueprint} started={hasScrolled} /></g>}
      </g>
    </svg>
  </div>;
}

function MotionGraphic({ feature, progress, started }: { feature: RoleFeature; progress: number; blueprint: boolean; started: boolean }) {
  const p = Math.max(0, Math.min(1, progress));
  const color = feature.color;

  if (feature.motion === 'identity') return <DotWave color={color} started={started} />;

  if (feature.motion === 'battery') {
    const charge = Math.min(1, p / .78);
    const light = charge * charge * (3 - 2 * charge);
    const height = 240 * light;
    const exit = Math.max(0, Math.min(1, (p - .96) / .04));
    return <g className={s.motion} data-battery-charge={charge} opacity={1 - exit * exit * (3 - 2 * exit)}>
      <rect className={s.batteryShell} x="248" y="184" width="144" height="266" rx="37" fill="none" stroke={color} strokeWidth="13" opacity={light * .48} filter="url(#lens-glow)" />
      <rect className={s.batteryShell} x="248" y="184" width="144" height="266" rx="37" fill="none" stroke={color} strokeWidth="6" opacity={.25 + light * .75} />
      <rect className={s.batteryCap} x="298" y="165" width="44" height="15" rx="7" fill={color} opacity={.25 + light * .75} />
      <clipPath id="battery-clip"><rect x="260" y="197" width="120" height="240" rx="27" /></clipPath>
      <rect className={s.batteryFill} x="260" y={437 - height} width="120" height={height} fill={color} clipPath="url(#battery-clip)" opacity={.35 + light * .6} />
    </g>;
  }

  if (feature.motion === 'beds') {
    return <g className={s.motion}>{Array.from({ length: 20 }, (_, index) => {
      const lit = index / 20 <= p;
      const x = 213 + (index % 4) * 58;
      const y = 203 + Math.floor(index / 4) * 52;
      return <rect key={index} x={x} y={y} width="42" height="31" rx="2" fill={lit ? color : 'none'} fillOpacity={index === 13 ? .18 : .78} stroke={index === 13 ? '#ff5367' : color} strokeWidth={lit ? 2.5 : 1} opacity={lit ? 1 : .25}><animate attributeName="fill-opacity" values={lit ? ".38;.86;.38" : ".03;.2;.03"} dur="3.2s" begin={(-index * .15) + 's'} repeatCount="indefinite" /></rect>;
    })}</g>;
  }

  if (feature.motion === 'workflow') return <g className={s.motion}><RepairScrollLines color={color} progress={p} /></g>;

  if (feature.motion === 'orderRoute') return <HologramRoute color={color} started={started} />;

  if (feature.motion === 'service') return <ServiceAssembly color={color} />;

  if (feature.motion === 'dispatch') {
    const branches = ['M190 320H310L448 220', 'M190 320H448', 'M190 320H310L448 420'];
    return <g className={s.motion} data-motion="dispatch">
      {branches.map((path, index) => <g key={path}>
        <GuidePath d={path} color={color} delay={index * .45} />
        <path d={path} pathLength="100" fill="none" stroke={color} strokeWidth="3" strokeDasharray={(Math.max(0, Math.min(1, p * 1.35 - index * .16)) * 100) + ' 100'} />
        <circle r="4" fill={color} opacity=".45"><animateMotion path={path} dur="3s" begin={(-index * .6) + 's'} repeatCount="indefinite" /></circle>
      </g>)}
      {[220, 320, 420].map((y, index) => <g key={y}><circle cx="448" cy={y} r="15" fill={color} fillOpacity={p > .55 + index * .1 ? 1 : .12} stroke={color} strokeWidth="2" /><circle cx="448" cy={y} r="29" fill="none" stroke={color} opacity=".22" /></g>)}
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

  if (feature.motion === 'rooms') return <FloatingShapes color={color} />;

  if (feature.motion === 'campus') return <CampusNetwork color={color} />;

  if (feature.motion === 'data') {
    const width = 180 + p * 100;
    const height = 280 - p * 100;
    return <g className={s.motion} data-motion="data">
      <rect x={320 - width / 2} y={320 - height / 2} width={width} height={height} rx="34" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" opacity=".5" />
      <HarmonicBalls progress={p} color={color} />
    </g>;
  }

  if (feature.motion === 'record') {
    return <g className={s.motion} data-motion="record">
      <rect x="218" y="190" width="204" height="260" rx="9" fill="none" stroke={color} strokeWidth="3" />
      {Array.from({ length: 5 }, (_, index) => <g key={index}>
        <path d={'M247 ' + (235 + index * 29) + 'h' + (index === 0 ? 140 : 118 - index * 10)} fill="none" stroke={color} strokeWidth={index === 0 ? 6 : 3} opacity=".16" />
        <path data-record-row={index} d={'M247 ' + (235 + index * 29) + 'h' + (index === 0 ? 140 : 118 - index * 10)} fill="none" stroke={color} strokeWidth={index === 0 ? 6 : 3} pathLength="100" opacity=".65">
          <animate attributeName="stroke-dasharray" values="0 100;100 100;100 100;0 100" keyTimes="0;.4;.75;1" dur="3.6s" begin={(-index * .25) + 's'} repeatCount="indefinite" />
        </path>
      </g>)}
      <circle cx="386" cy="410" r="27" fill="none" stroke={color} strokeWidth="2" opacity=".25" />
      <path data-record-check="true" d="M370 410l11 11 23-27" fill="none" stroke={color} strokeWidth="5" pathLength="100" strokeDasharray={(p * 100) + ' 100'} />
    </g>;
  }

  if (feature.motion === 'ledger') {
    return <g className={s.motion}>
      {[78, 128, 96, 176, 142].map((height, index) => {
        const animatedHeight = height * p;
        return <rect key={index} x={215 + index * 46} y={410 - animatedHeight} width="26" height={animatedHeight} rx="3" fill={color} opacity={.35 + index * .13}><animate attributeName="height" values={[animatedHeight * .8, animatedHeight, animatedHeight * .8].join(';')} dur="3s" begin={(-index * .3) + 's'} repeatCount="indefinite" /><animate attributeName="y" values={[410 - animatedHeight * .8, 410 - animatedHeight, 410 - animatedHeight * .8].join(';')} dur="3s" begin={(-index * .3) + 's'} repeatCount="indefinite" /></rect>;
      })}
      {[245, 300, 355].map((y, index) => <line key={y} x1="205" y1={y} x2={435 - index * 25} y2={y} stroke={color} strokeWidth="3" strokeDasharray={(p * 240) + ' 260'} opacity={.85 - index * .18} />)}
      <line x1="198" y1="414" x2="442" y2="414" stroke={color} strokeWidth="5" />
    </g>;
  }

  if (feature.motion === 'analytics') {
    return <g className={s.motion}>
      {[72, 108, 145].map((radius, index) => <g key={radius} transform={'rotate(' + (-90 + index * 56) + ' 320 320)'}>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 320 320" to={(index % 2 ? -360 : 360) + ' 320 320'} dur={(10 + index * 5) + 's'} repeatCount="indefinite" />
          <circle cx="320" cy="320" r={radius} fill="none" stroke={color} strokeWidth={index === 0 ? 7 : 2.5}
            pathLength="100" strokeDasharray={(28 + p * 30 + index * 8) + ' 100'} opacity={1 - index * .22}>
            <animate attributeName="stroke-dasharray" values={`${32 + index * 10} 100;${65 + index * 8} 100;${32 + index * 10} 100`} dur={(4 + index) + 's'} repeatCount="indefinite" />
          </circle>
          <circle cx={320 + radius} cy="320" r="2.5" fill={color} opacity={.8 - index * .15} />
        </g>
      </g>)}
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
          <GuidePath d={'M320 320L' + x + ' ' + y} color={color} delay={index * .5} />
          <circle r="4" fill={color} stroke="none" opacity=".6"><animateMotion path={'M320 320L' + x + ' ' + y} dur="2.8s" begin={(-index * .5) + 's'} repeatCount="indefinite" /></circle>
          <line x1="320" y1="320" x2={x} y2={y} stroke={color} strokeWidth="4" pathLength="100" strokeDasharray={(Math.max(0, p * 1.5 - index * .16) * 100) + ' 100'} />
          <rect x={x - 23} y={y - 18} width="46" height="36" rx="5" fill={p > index * .2 ? color : '#1c1c1b'} fillOpacity={p > index * .2 ? .68 : 1} stroke={color} strokeWidth="3" />
        </g>;
      })}
    </g>;
  }

  if (feature.motion === 'backup') {
    return <g className={s.motion} data-motion="backup">
      {[205, 435].map((x, index) => <g key={x}>
        <circle cx={x} cy="320" r="55" fill="none" stroke={color} strokeWidth="3" opacity={index ? .35 + p * .65 : 1} />
        <circle cx={x} cy="320" r="32" fill={color} opacity={index ? .12 + p * .23 : .35} />
      </g>)}
      {[302, 320, 338].map((y, index) => <g key={y}>
        <GuidePath d={'M264 ' + y + 'H376'} color={color} delay={index * .4} />
        <path d={'M264 ' + y + 'H376'} fill="none" stroke={color} strokeWidth="2" pathLength="100" strokeDasharray={(p * 100) + ' 100'} />
        <rect x="-4" y={y - 3} width="8" height="6" rx="1" fill={color} opacity=".65">
          <animate attributeName="x" values="264;368" dur="2.2s" begin={(-index * .65) + 's'} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;.75;.75;0" keyTimes="0;.15;.85;1" dur="2.2s" begin={(-index * .65) + 's'} repeatCount="indefinite" />
        </rect>
      </g>)}
    </g>;
  }

  if (feature.motion === 'broadcast') {
    const angle = p * Math.PI * 2 - Math.PI / 2;
    return <g className={s.motion}>
      {Array.from({ length: 12 }, (_, index) => {
        const segmentProgress = Math.max(0, Math.min(1, p * 12 - index));
        if (segmentProgress === 0) return null;
        // Each fixed arc draws behind the needle, then settles into the thin ring.
        const settled = segmentProgress * segmentProgress * (3 - 2 * segmentProgress);
        const width = 18 - 13 * settled;
        return <circle key={index} data-clock-trail-segment={index}
          cx="320" cy="320" r={168.5 - width / 2}
          fill="none" stroke={color} strokeWidth={width} strokeLinecap="butt"
          opacity={.8 - .58 * settled} pathLength="100"
          strokeDasharray={(segmentProgress * 100 / 12) + ' 100'}
          transform={'rotate(' + (-90 + index * 30) + ' 320 320)'} />;
      })}
      <line data-lens-needle="true" x1="320" y1="320" x2={320 + Math.cos(angle) * 230} y2={320 + Math.sin(angle) * 230} stroke={color} strokeWidth="2.7" />
    </g>;
  }

  return <g className={s.motion}>
    <rect x="238" y="185" width="164" height="270" rx="50" fill="none" stroke={color} strokeWidth="4" strokeDasharray={(p * 650) + ' 700'} />
    <circle cx="320" cy="270" r={34 + p * 6} fill={color} fillOpacity=".35" stroke={color} strokeWidth="4" />
    {[0, 1, 2].map(index => <line key={index} x1="270" y1={350 + index * 28} x2={270 + (100 - index * 14) * p} y2={350 + index * 28} stroke={color} strokeWidth={index === 0 ? 7 : 4} />)}
    <circle cx="390" cy="420" r={8 + p * 7} fill={color} filter="url(#lens-glow)" />
  </g>;
}

function GuidePath({ d, color, delay = 0 }: { d: string; color: string; delay?: number }) {
  return <g fill="none" stroke={color} strokeWidth="2">
    <path d={d} opacity=".1" />
    <path d={d} pathLength="100" opacity=".3" data-path-guide="true">
      <animate attributeName="stroke-dasharray" values="0 100;100 100;0 100" keyTimes="0;.65;1" dur="3.2s" begin={(-delay) + 's'} repeatCount="indefinite" />
      <animate attributeName="stroke-dashoffset" values="0;0;-100" keyTimes="0;.65;1" dur="3.2s" begin={(-delay) + 's'} repeatCount="indefinite" />
    </path>
  </g>;
}

function HarmonicBalls({ progress, color }: { progress: number; color: string }) {
  const group = useRef<SVGGElement>(null);
  useEffect(() => {
    const balls = group.current?.querySelectorAll('circle');
    if (!balls) return;
    let frame = 0;
    const tick = (time: number) => {
      balls.forEach((ball, index) => {
        const wave = Math.sin(time / 2400 * Math.PI * 2 - index * .34) * 42;
        ball.setAttribute('cx', String(wave * (1 - progress)));
        ball.setAttribute('cy', String(wave * progress));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progress]);
  return <g ref={group}>{Array.from({ length: 5 }, (_, index) => {
    const offset = (index - 2) * 46;
    return <g key={index} transform={'translate(' + (320 + offset * progress) + ' ' + (320 + offset * (1 - progress)) + ')'}><circle r="17" fill={color} /></g>;
  })}</g>;
}
