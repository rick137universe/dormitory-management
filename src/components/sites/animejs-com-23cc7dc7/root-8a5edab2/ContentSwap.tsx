'use client';
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
export function ContentSwap({ identity, children, svg = false }: { identity: string; children: ReactNode; svg?: boolean }) {
  const [shown, setShown] = useState({ identity, children });
  const host = useRef<HTMLDivElement & SVGGElement>(null);
  const commit = useEffectEvent(() => setShown({ identity, children }));
  useEffect(() => {
    if (shown.identity === identity || !host.current) return;
    const node = host.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const exit = node.animate([{ transform: 'scale(1)' }, { transform: 'scale(0)' }], { duration: reduced ? 0 : 180, fill: 'forwards', easing: 'ease-in' });
    let cancelled = false;
    exit.finished.then(() => {
      if (cancelled) return;
      commit();
      exit.cancel();
      node.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: reduced ? 0 : 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }).catch(() => {});
    return () => { cancelled = true; exit.cancel(); };
  }, [identity, shown.identity, svg]);
  const content = shown.identity === identity ? children : shown.children;
  return svg ? <g ref={host} className="content-swap content-swap-svg">{content}</g> : <div ref={host} className="content-swap">{content}</div>;
}
