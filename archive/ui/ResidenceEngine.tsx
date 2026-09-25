"use client";

import { useId } from "react";
import styles from "./ResidenceEngine.module.css";

type ResidenceEngineProps = {
  progress?: number;
  mode?: number;
  compact?: boolean;
  onSelect?: (floor: number) => void;
};

const tiers = [
  { color: "#ff7167", label: "01 / LIVE", y: 206 },
  { color: "#d1ed83", label: "02 / CARE", y: 286 },
  { color: "#b5a1ff", label: "03 / FLOW", y: 366 },
];

export function ResidenceEngine({ progress = 0, mode, compact = false, onSelect }: ResidenceEngineProps) {
  const id = useId().replace(/:/g, "");
  const p = Math.max(0, Math.min(1, progress));
  const labelOpacity = Math.max(0, Math.min(1, (p - 0.3) / 0.35));
  const ringOpacity = 0.8 - p * 0.55;

  return (
    <svg className={`${styles.engine} ${compact ? styles.compact : ""}`} viewBox="0 0 640 640" role={onSelect ? "group" : "img"} aria-label="可随滚动展开的三层公寓：住宿、维修与缴费服务">
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#d1ed83" stopOpacity=".08" />
          <stop offset="1" stopColor="#252423" stopOpacity="0" />
        </radialGradient>
        {tiers.map(({ color }, index) => (
          <linearGradient key={color} id={`${id}-face-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={color} stopOpacity=".18" />
            <stop offset="1" stopColor={color} stopOpacity=".04" />
          </linearGradient>
        ))}
      </defs>
      <circle cx="320" cy="320" r="290" fill={`url(#${id}-halo)`} />
      <g opacity={ringOpacity}>
        <circle cx="320" cy="320" r="270" fill="none" stroke="#55514a" strokeWidth=".6" />
        <circle cx="320" cy="320" r="245" fill="none" stroke="#45433f" strokeDasharray="2 9" />
        <g className={`engine-ticks ${styles.rotationGroup}`}>
          {Array.from({ length: 72 }, (_, index) => (
            <line key={index} x1="320" y1="44" x2="320" y2={index % 6 === 0 ? "56" : "49"} stroke={index % 6 === 0 ? "#a9a399" : "#625d56"} strokeWidth="1" transform={`rotate(${index * 5} 320 320)`} />
          ))}
        </g>
        <g className={`engine-orbit ${styles.rotationGroup}`} fill="none" strokeWidth="2">
          <path d="M 110 171 A 258 258 0 0 1 434 88" stroke="#ff7167" />
          <path d="M 471 110 A 258 258 0 0 1 553 430" stroke="#d1ed83" />
          <path d="M 518 485 A 258 258 0 0 1 86 429" stroke="#b5a1ff" />
        </g>
        <g className={`engine-satellite ${styles.rotationGroup}`}>
          <circle cx="320" cy="62" r="9" fill="#252423" stroke="#d1ed83" />
          <circle cx="320" cy="62" r="3" fill="#d1ed83" />
        </g>
      </g>
      <g opacity={p * 0.65} fill="none" stroke="#a9a399" strokeWidth="1" strokeDasharray="3 7">
        <path d={`M ${184 - 20 * p} ${256 - 100 * p} L ${184 + 20 * p} ${416 + 100 * p}`} />
        <path d={`M ${320 - 20 * p} ${310 - 100 * p} L ${320 + 20 * p} ${470 + 100 * p}`} />
        <path d={`M ${456 - 20 * p} ${256 - 100 * p} L ${456 + 20 * p} ${416 + 100 * p}`} />
      </g>
      {[2, 1, 0].map((index) => {
        const { color, y, label } = tiers[index];
        const dx = (index - 1) * 20 * p;
        const dy = (index - 1) * 100 * p;
        return (
          <g key={label} className={onSelect ? styles.selectableFloor : undefined} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={onSelect ? ['查看住宿信息', '打开维修服务', '查看费用账单'][index] : undefined} onClick={onSelect ? () => onSelect(index) : undefined} onKeyDown={onSelect ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(index); } } : undefined} transform={`translate(${dx} ${dy})`} opacity={mode === undefined || mode === index || p < 0.3 ? 1 : 0.64}>
            <path d={`M184 ${y + 50} L320 ${y + 104} L456 ${y + 50} L456 ${y - 20} L320 ${y - 74} L184 ${y - 20} Z`} fill="#252423" />
            <path d={`M184 ${y - 20} L320 ${y + 34} L320 ${y + 104} L184 ${y + 50} Z`} fill={`url(#${id}-face-${index})`} stroke={color} strokeWidth="1.15" />
            <path d={`M320 ${y + 34} L456 ${y - 20} L456 ${y + 50} L320 ${y + 104} Z`} fill={`url(#${id}-face-${index})`} stroke={color} strokeWidth="1.15" />
            <path d={`M184 ${y - 20} L320 ${y - 74} L456 ${y - 20} L320 ${y + 34} Z`} fill="#2c2b29" stroke={color} strokeWidth="1.3" />
            <path d={`M199 ${y - 20} L320 ${y - 68} L441 ${y - 20} L320 ${y + 28} Z`} fill={color} fillOpacity=".08" stroke={color} strokeOpacity=".32" strokeWidth=".7" />
            <path d={`M222 ${y - 19} L320 ${y - 58} L418 ${y - 19} M320 ${y - 58} L320 ${y + 12}`} fill="none" stroke={color} strokeOpacity=".3" strokeWidth=".7" />
            {[0, 1].map((row) => Array.from({ length: 6 }, (_, column) => {
              const leftX = 195 + column * 20;
              const leftY = y - 8 + column * (54 / 136) * 20 + row * 25;
              const rightX = 331 + column * 20;
              const rightY = y + 38 - column * (54 / 136) * 20 + row * 25;
              return (
                <g key={`${row}-${column}`} fill={color} fillOpacity={(column + row) % 3 === 0 ? 0.85 : 0.35} className="engine-window">
                  <path d={`M${leftX} ${leftY} l10 4 v13 l-10 -4 Z`} />
                  <path d={`M${rightX} ${rightY} l10 -4 v13 l-10 4 Z`} />
                </g>
              );
            }))}
            <path d={`M184 ${y + 44} L320 ${y + 98} L456 ${y + 44}`} fill="none" stroke={color} strokeOpacity=".45" strokeWidth=".6" />
            <g opacity={labelOpacity}>
              <path d={`M469 ${y + 16} h15`} stroke={color} strokeWidth="1" />
              <text x="492" y={y + 20} fill={color} className={styles.floorLabel}>{label}</text>
            </g>
          </g>
        );
      })}
      {!compact && (
        <g className={styles.annotation} fill="#918b83" opacity={1 - p}>
          <text x="320" y="609" textAnchor="middle">RESIDENCE / CONNECTED LIVING</text>
          <text x="35" y="325" transform="rotate(-90 35 325)" textAnchor="middle">EST. 2026</text>
        </g>
      )}
    </svg>
  );
}
