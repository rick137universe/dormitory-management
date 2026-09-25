'use client';
import { useEffect, useRef, useState } from 'react';
import { referenceRoute } from './referenceRoute';
import { spherePaths } from './referenceSphere';

const waveDots = Array.from({ length: 225 }, (_, i) => ({ x: i % 15 - 7, y: Math.floor(i / 15) - 7 })).filter(dot => Math.hypot(dot.x, dot.y) <= 7.3);
const smoothStep = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
const dotWaveInterval = 2130;
const dotWaveTravel = 2300;
const dotWaveCrest = 1300;
const dotSinkScale = .88;
const dotSinkStart = dotWaveCrest / 2;
const dotSinkDuration = dotWaveInterval - dotSinkStart;
export function DotWave({ color, started }: { color: string; started: boolean }) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (!started) return;
    const dots = ref.current?.querySelectorAll('circle');
    if (!dots) return;
    const startedAt = performance.now();
    let frame = 0;
    const update = (time: number) => {
      const elapsed = time - startedAt;
      dots.forEach((dot, index) => {
        const point = waveDots[index];
        const distance = Math.hypot(point.x, point.y);
        const arrival = distance * .061 * dotWaveTravel;
        // The ripple spreads radially. As the dots sink away from the viewer,
        // their spacing contracts toward the optical center instead of sliding down.
        const passed = elapsed >= arrival;
        const localTime = passed ? (elapsed - arrival) % dotWaveInterval : 0;
        const cycleIndex = passed ? Math.floor((elapsed - arrival) / dotWaveInterval) : 0;
        const crestPhase = localTime / dotWaveCrest;
        const crest = passed && crestPhase <= 1 ? Math.sin(crestPhase * Math.PI) : 0;
        const sinkTime = Math.max(0, Math.min(1, (localTime - dotSinkStart) / dotSinkDuration));
        const sink = passed ? (1 - Math.cos(Math.PI * sinkTime)) / 2 : 0;
        const edge = .48 + .52 * Math.max(0, Math.min(1, (7.5 - distance) / 2.25));
        // The outer dots follow the crest: a small outward bulge, then an inward dip.
        const outerWeight = smoothStep((distance - 6.45) / .6);
        const outerRecoil = passed && localTime > dotWaveCrest
          ? Math.sin(Math.PI * (localTime - dotWaveCrest) / (dotWaveInterval - dotWaveCrest)) : 0;
        const outerFollow = outerWeight * (crest - outerRecoil);
        const radius = 1.8 + crest * 9.2 * edge - sink * .45;
        const opacity = .3 + crest * .7 - sink * .04;
        // Settled dots remain visible and expand smoothly into the next ripple.
        const rise = cycleIndex > 0 ? smoothStep(localTime / 190) : 1;
        const scale = (dotSinkScale * (1 - rise)) + (1 - (1 - dotSinkScale) * sink) * rise;
        const outward = outerFollow * (outerFollow > 0 ? 5 : 4) * rise / (distance || 1);
        dot.setAttribute('cx', String(320 + point.x * (21 * scale + outward)));
        dot.setAttribute('cy', String(320 + point.y * (21 * scale + outward)));
        dot.setAttribute('r', String(1.35 * (1 - rise) + (radius + outerFollow * 1.25) * rise));
        dot.setAttribute('opacity', String(.26 * (1 - rise) + opacity * rise));
      });
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [started]);
  return <g ref={ref} data-dot-wave="true" fill={color}>{waveDots.map((dot, index) =>
    <circle key={index} cx={320 + dot.x * 21} cy={320 + dot.y * 21} r="1.8" opacity=".3" />)}</g>;
}

export function ClockTicks({ progress, color, highlightColor, clock, blurred, baseOpacity = .65 }: { progress: number; color: string; highlightColor: string; clock: boolean; blurred: boolean; baseOpacity?: number }) {
  const [clockGrowth, setClockGrowth] = useState(0);
  const growthRef = useRef(0);

  useEffect(() => {
    const from = growthRef.current;
    const target = clock && !blurred ? 1 : 0;
    if (from === target) return;
    const started = performance.now();
    const duration = 210 * Math.abs(target - from);
    let frame = 0;
    const transition = (time: number) => {
      const raw = Math.min(1, (time - started) / duration);
      const eased = raw * raw * (3 - 2 * raw);
      const growth = from + (target - from) * eased;
      growthRef.current = growth;
      setClockGrowth(growth);
      if (raw < 1) frame = requestAnimationFrame(transition);
    };
    frame = requestAnimationFrame(transition);
    return () => cancelAnimationFrame(frame);
  }, [clock, blurred]);

  const tickCount = 216;
  return <g stroke={color}>{Array.from({ length: tickCount }, (_, i) => {
    const rawDistance = Math.abs(i / tickCount - progress);
    const distance = Math.min(rawDistance, 1 - rawDistance);
    const waveWidth = .024;
    const wave = clock && !blurred && progress > .001 && progress < .995 && distance < waveWidth
      ? (1 + Math.cos(Math.PI * distance / waveWidth)) / 2 : 0;
    const lift = wave * 10;
    const angle = i / tickCount * Math.PI * 2 - Math.PI / 2;
    const outer = 255 + lift;
    const major = i % 18 === 0;
    const targetLength = major ? 27 : 18;
    const length = 16 + clockGrowth * (targetLength - 16);
    const inner = outer - length;
    const pointed = clock && !blurred && i === Math.round(progress * tickCount) % tickCount;
    return <line key={i} data-clock-tick={i}
      x1={(320 + Math.cos(angle) * outer).toFixed(3)} y1={(320 + Math.sin(angle) * outer).toFixed(3)}
      x2={(320 + Math.cos(angle) * inner).toFixed(3)} y2={(320 + Math.sin(angle) * inner).toFixed(3)}
      strokeWidth="1.2"
      stroke={pointed ? highlightColor : color}
      opacity={blurred ? .2 : pointed ? 1 : baseOpacity}
      filter={pointed ? "url(#lens-glow)" : undefined} />;
  })}</g>;
}

export function HologramRoute({ color, started }: { color: string; started: boolean }) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    const root = ref.current;
    const source = root?.querySelector<SVGPathElement>('[data-route-source]');
    const base = root?.querySelector<SVGPathElement>('[data-route-base]');
    const lit = root?.querySelector<SVGPathElement>('[data-route-lit]');
    const arrow = root?.querySelector<SVGPolygonElement>('polygon');
    if (!source || !base || !lit || !arrow || !started) return;
    const length = source.getTotalLength();
    const points = Array.from({ length: 501 }, (_, i) => source.getPointAtLength(length * i / 500));
    const beganAt = performance.now();
    let frame = 0;
    const update = (time: number) => {
      const elapsed = Math.max(0, time - beganAt);
      const angle = time / 20500 * Math.PI * 2;
      const buildDuration = 1800;
      const arrowStart = buildDuration + 420;
      const arrowDuration = 9400;
      const drawProgress = Math.min(1, elapsed / buildDuration);
      const running = elapsed > arrowStart;
      const progress = running ? ((elapsed - arrowStart) % arrowDuration) / arrowDuration : 0;
      const project = (x: number, y: number, z = 0) => {
        const rx = (x - 151) * Math.cos(angle) - (y - 56) * Math.sin(angle);
        const ry = (x - 151) * Math.sin(angle) + (y - 56) * Math.cos(angle);
        const depth = ry * .28 + z * .78;
        const perspective = 700 / (700 - depth);
        return [320 + rx * 1.62 * perspective, 320 + (ry * .38 - z * .5) * 1.62 * perspective];
      };
      const path = (z: number, count = 501) => points.slice(0, count).map((p, i) => (i ? 'L' : 'M') + project(p.x, p.y, z).join(',')).join(' ');
      const drawCount = Math.max(2, Math.floor(drawProgress * 500) + 1);
      base.setAttribute('d', path(0, drawCount));
      const count = Math.max(2, Math.floor(progress * 500) + 1);
      const current = source.getPointAtLength(length * progress);
      const next = source.getPointAtLength(Math.min(length, length * progress + 1));
      const a = project(current.x, current.y), b = project(next.x, next.y);
      lit.setAttribute('d', running ? path(0, count) + ' L' + a.join(',') : '');
      arrow.setAttribute('opacity', running ? '1' : '0');
      arrow.setAttribute('transform', 'translate(' + a.join(' ') + ') rotate(' + Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI + ')');
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [started]);
  return <g ref={ref} data-hologram-route="true" fill="none" stroke={color} strokeLinejoin="round" strokeLinecap="round">
    <defs><path data-route-source="true" d={referenceRoute} /></defs>
    <path data-route-base="true" strokeWidth="6" opacity=".3" />
    <path data-route-lit="true" strokeWidth="2.5" />
    <polygon points="-7,-5 7,0 -7,5 -4,0" fill={color} stroke="none" opacity="0" />
  </g>;
}


type SpherePoint = [number, number];

// Reposition each closed ellipse's drawing seam along its first cubic. The
// geometry stays identical, but the staggered endpoints form a curved back
// surface instead of a straight diagonal cut.
function curveSphereSeam(path: string, index: number, count: number) {
  const values = path.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number);
  if (!values || values.length < 26) return path;
  const point = (offset: number): SpherePoint => [values[offset], values[offset + 1]];
  const mix = (a: SpherePoint, b: SpherePoint, t: number): SpherePoint =>
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const format = (p: SpherePoint) => p.map(value => value.toFixed(3)).join(' ');

  const t = .78 * Math.sin(Math.PI * index / Math.max(1, count - 1));
  const start = point(0), controlA = point(2), controlB = point(4), end = point(6);
  const q0 = mix(start, controlA, t);
  const q1 = mix(controlA, controlB, t);
  const q2 = mix(controlB, end, t);
  const r0 = mix(q0, q1, t);
  const r1 = mix(q1, q2, t);
  const seam = mix(r0, r1, t);
  const remaining = [1, 2, 3].map(segment => {
    const offset = 2 + segment * 6;
    return `C${format(point(offset))} ${format(point(offset + 2))} ${format(point(offset + 4))}`;
  });
  return `M${format(seam)} C${format(r1)} ${format(q2)} ${format(end)} ${remaining.join(' ')} C${format(q0)} ${format(r0)} ${format(seam)}Z`;
}

const curvedSpherePaths = spherePaths.map((path, index) => curveSphereSeam(path, index, spherePaths.length));

// The same scroll progress draws, then retracts, every path in both directions.
export function RepairScrollLines({ color, progress }: { color: string; progress: number }) {
  const linesRef = useRef<SVGGElement>(null);
  const p = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    const lines = linesRef.current?.querySelectorAll<SVGPathElement>('[data-repair-line]');
    if (!lines || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const sway = (time: number) => {
      // The paths oscillate across their own slanted axis (upper-left to
      // lower-right). Remove their mean offset so the sphere stays centred.
      const phases = Array.from(lines, (_, index) => Math.sin(time / 650 + index * .24));
      const mean = phases.reduce((sum, phase) => sum + phase, 0) / phases.length;
      lines.forEach((line, index) => {
        const edge = Math.sin(Math.PI * index / Math.max(1, lines.length - 1));
        const travel = (phases[index] - mean) * (9 - edge * 3);
        const diagonal = travel / Math.SQRT2;
        line.setAttribute('transform', `translate(${diagonal.toFixed(2)} ${diagonal.toFixed(2)})`);
      });
      frame = requestAnimationFrame(sway);
    };
    frame = requestAnimationFrame(sway);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <g data-repair-scroll-lines="true">
    <g ref={linesRef} transform="translate(169 169) scale(.75)" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      {curvedSpherePaths.map((path, index) => {
        const stagger = index / Math.max(1, spherePaths.length - 1);
        const offset = stagger * .27 + Math.sin(index * 2.3) * .007;
        const duration = .66 + Math.sin(index * .9) * .025;
        const phase = Math.max(0, Math.min(1, (p - offset) / duration));
        const draw = .53;
        const end = Math.min(1, phase / draw);
        const retreat = Math.max(0, (phase - draw) / (1 - draw));
        const start = retreat * retreat * (3 - 2 * retreat);
        const visible = Math.max(0, end - start);
        return <path key={index} data-repair-line={index} d={path} pathLength="100"
          strokeWidth={index % 4 === 1 ? 2.35 : index % 3 === 0 ? 2.05 : 1.55}
          strokeDasharray={`${(visible * 100).toFixed(2)} 100`}
          strokeDashoffset={(-start * 100).toFixed(2)}
          opacity={visible > 0 ? .62 + (1 - stagger) * .32 : 0}
          filter={index % 4 === 1 ? 'url(#lens-glow)' : undefined} />;
      })}
    </g>
  </g>;
}


export function FloatingShapes({ color }: { color: string }) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const elements = ref.current?.querySelectorAll<SVGGElement>('[data-floating-shape]');
    if (!elements) return;
    const randomPose = () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 112;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
        scale: .4 + Math.random() * 1.05, rotation: Math.random() * 180 - 90 };
    };
    const started = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motions = Array.from(elements, (element, index) => ({
      element, enterAt: started + index * 45, from: randomPose(), to: randomPose(),
      started, duration: 500 + Math.random() * 500,
    }));
    let frame = 0;
    const update = (time: number) => {
      for (const motion of motions) {
        const fraction = Math.min(1, (time - motion.started) / motion.duration);
        const eased = fraction * fraction * (3 - 2 * fraction);
        const interpolate = (from: number, to: number) => from + (to - from) * eased;
        const x = interpolate(motion.from.x, motion.to.x);
        const y = interpolate(motion.from.y, motion.to.y);
        const entry = reduced ? 1 : Math.max(0, Math.min(1, (time - motion.enterAt) / 440));
        // Each shape springs out at its own location, independently of its drifting pose.
        const back = entry - 1;
        const pop = entry === 0 ? 0 : 1 + 2.4 * back * back * back + 1.4 * back * back;
        const scale = interpolate(motion.from.scale, motion.to.scale) * pop;
        const rotation = interpolate(motion.from.rotation, motion.to.rotation);
        motion.element.setAttribute('transform', `translate(${320 + x} ${320 + y}) rotate(${rotation}) scale(${scale})`);
        if (fraction === 1) {
          motion.from = motion.to;
          motion.to = randomPose();
          motion.started = time;
          motion.duration = 500 + Math.random() * 500;
        }
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <g ref={ref} data-floating-shapes="true" stroke={color} strokeWidth="1.5">
    {Array.from({ length: 12 }, (_, index) => <g key={index} data-floating-shape={index}
      transform={`translate(${260 + index % 4 * 40} ${280 + Math.floor(index / 4) * 40}) scale(0)`}
      fill={index % 4 < 2 ? color : 'none'}>
      {index % 2 === 0
        ? <circle r="16" />
        : <rect x="-18" y="-18" width="36" height="36" rx="2" />}
    </g>)}
  </g>;
}


export function CampusNetwork({ color }: { color: string }) {
  return <g data-motion="campus-network" stroke={color} strokeLinejoin="round" fill="none">
    <g transform="translate(320 333)">
      <path d="M0 -112L176 -10L0 92L-176 -10Z" strokeWidth="1" opacity=".18" />
      {[-1, 0, 1].map(row => <g key={row}>
        <path d={`M${-112 + row * 39} ${-65 - row * 23}l224 130`} opacity=".18" strokeDasharray="3 7" />
        <path d={`M${112 + row * 39} ${-65 + row * 23}l-224 130`} opacity=".18" strokeDasharray="3 7" />
      </g>)}
      {Array.from({ length: 9 }, (_, index) => {
        const row = Math.floor(index / 3) - 1;
        const column = index % 3 - 1;
        const x = (column - row) * 49;
        const y = (column + row) * 28;
        const lift = index === 4 ? 43 : 20;
        return <g key={index} transform={`translate(${x} ${y})`}>
          <path d="M0 -22L37 0L0 22L-37 0Z" opacity=".22" strokeWidth="1" />
          <g>
            <animateTransform attributeName="transform" type="translate" values={`0 ${-lift};0 ${-lift - 12};0 ${-lift}`} dur="4.8s" begin={(-index * .27) + 's'} repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".42 0 .58 1;.42 0 .58 1" />
            <path d="M-30 0V15L0 33L30 15V0L0 18Z" fill={color} fillOpacity=".045" strokeOpacity=".5" strokeWidth="1" />
            <path d="M0 -18L30 0L0 18L-30 0Z" fill={color} fillOpacity={index === 4 ? '.23' : '.08'} strokeWidth="1.6" />
            <path d="M0 18V33M-20 12L-7 20M7 20L20 12" opacity=".4" strokeWidth=".8" />
            <circle cy="-1" r={index === 4 ? 5 : 2.5} fill={color} stroke="none">
              <animate attributeName="opacity" values=".3;1;.3" dur="2.8s" begin={(-index * .3) + 's'} repeatCount="indefinite" />
            </circle>
          </g>
          <path d={`M0 ${-lift + 33}V22`} opacity=".22" strokeDasharray="2 4" />
        </g>;
      })}
      <path d="M-147 22L0 107L147 22" opacity=".35" strokeWidth="1.5" pathLength="100" strokeDasharray="12 88">
        <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="3s" repeatCount="indefinite" />
      </path>
    </g>
  </g>;
}

export function ServiceAssembly({ color }: { color: string }) {
  const gears = [
    { x: 266, radius: 72, teeth: 16, phase: 0 },
    { x: 394, radius: 54, teeth: 12, phase: 15 },
  ];
  const outline = (radius: number, teeth: number) => Array.from({ length: teeth }, (_, tooth) =>
    [-.5, -.3, -.17, .17, .3, .5].map((offset, i) => {
      const angle = (tooth + offset) / teeth * Math.PI * 2;
      const r = i === 2 || i === 3 ? radius + 3 : radius - 5;
      return `${tooth === 0 && i === 0 ? 'M' : 'L'}${(Math.cos(angle) * r).toFixed(4)} ${(Math.sin(angle) * r).toFixed(4)}`;
    }).join(' ')
  ).join(' ') + 'Z';
  return <g data-motion="meshing-gears" stroke={color} fill="none" strokeLinejoin="round">
    {gears.map((gear, index) => <g key={index} transform={`translate(${gear.x} 326)`}>
      <g className="gear-arrival"><g className={index === 0 ? 'gear-spin-large' : 'gear-spin-small'}>
        <path transform={`rotate(${gear.phase})`} d={outline(gear.radius, gear.teeth)} strokeWidth="1.8" />
      </g><circle r={index === 0 ? 19 : 14} strokeWidth="1.8" /></g>
    </g>)}
  </g>;
}
