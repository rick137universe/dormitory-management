'use client';

import { moduleCatalog, type ModuleId } from '@/lib/role-workspaces';
import s from './ModuleConstellation.module.css';

const modules: ModuleId[] = ['personal', 'base', 'accommodation', 'bed', 'payment', 'repair', 'analytics', 'system'];
const revealAt = [.08, .16, .27, .38, .5, .61, .73, .83];

interface Props { progress: number; onOpen: (moduleId: ModuleId) => void; }

export function ModuleConstellation({ progress, onOpen }: Props) {
  return <aside className={s.map} data-blueprint={progress > .82} aria-label="八大核心功能模块">
    <div className={s.orbit} aria-hidden="true"><i /><i /><i /></div>
    {modules.map((moduleId, index) => <button
      key={moduleId}
      className={s.node}
      data-visible={progress >= revealAt[index]}
      data-active={progress >= revealAt[index] && progress < (revealAt[index + 1] ?? 1.1)}
      onClick={() => onOpen(moduleId)}
    >
      <span>{moduleCatalog[moduleId].index}</span>
      <strong>{moduleCatalog[moduleId].name}</strong>
      <small>{moduleCatalog[moduleId].short}</small>
    </button>)}
  </aside>;
}
