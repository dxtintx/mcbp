'use client';

import React from 'react';
import { Point, Size, Language } from '@/core/types';
import { getTranslation } from '@/core/localization/i18n';

interface StatusBarProps {
  cursorGridPos: Point;
  projectBounds: Size;
  blockCount: number;
  cellSize: number;
  lang: Language;
}

export function StatusBar({
  cursorGridPos,
  projectBounds,
  blockCount,
  cellSize,
  lang,
}: StatusBarProps) {
  const zoomPercent = Math.round((cellSize / 16) * 100);

  return (
    <div className="bg-black border-t border-zinc-800 text-zinc-400 text-[11px] font-mono px-4 py-1 flex items-center justify-between select-none z-20">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">X:</span>
          <span className="text-zinc-200 w-8">{cursorGridPos.x}</span>
          <span className="text-zinc-500">Y:</span>
          <span className="text-zinc-200 w-8">{cursorGridPos.y}</span>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div>
          <span className="text-zinc-500">{getTranslation(lang, 'StatusSize')}: </span>
          <span className="text-zinc-200">
            {projectBounds.width > 0
              ? `${projectBounds.width} × ${projectBounds.height}`
              : '0 × 0'}
          </span>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div>
          <span className="text-zinc-500">{getTranslation(lang, 'StatusBlocks')}: </span>
          <span className="text-white font-bold">{blockCount}</span>{' '}
          <span>{getTranslation(lang, 'BlocksLabel')}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-zinc-500">{getTranslation(lang, 'StatusZoom')}: </span>
        <span className="text-zinc-200">{zoomPercent}% ({cellSize}px)</span>
      </div>
    </div>
  );
}
