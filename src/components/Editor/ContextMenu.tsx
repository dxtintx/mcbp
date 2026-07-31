'use client';

import React, { useEffect, useRef } from 'react';
import { ToolType, Language } from '@/core/types';
import { getTranslation } from '@/core/localization/i18n';
import {
  MousePointer,
  Paintbrush,
  Slash,
  Square,
  Circle,
  Spline,
  Type,
  Ruler,
  Eraser,
  Palette,
} from 'lucide-react';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  activeColorHex: string;
  onOpenColorPicker: () => void;
  lang: Language;
}

export function ContextMenu({
  isOpen,
  position,
  onClose,
  activeTool,
  onSelectTool,
  activeColorHex,
  onOpenColorPicker,
  lang,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('contextmenu', handleClickOutside);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tools: { type: ToolType; icon: React.ReactNode; labelKey: string; keyHint: string }[] = [
    { type: 'pointer', icon: <MousePointer className="w-4 h-4" />, labelKey: 'ToolPointer', keyHint: '0' },
    { type: 'brush', icon: <Paintbrush className="w-4 h-4" />, labelKey: 'ToolBrush', keyHint: '1' },
    { type: 'line', icon: <Slash className="w-4 h-4" />, labelKey: 'ToolLine', keyHint: '2' },
    { type: 'rectangle', icon: <Square className="w-4 h-4" />, labelKey: 'ToolRectangle', keyHint: '3' },
    { type: 'circle', icon: <Circle className="w-4 h-4" />, labelKey: 'ToolCircle', keyHint: '4' },
    { type: 'arc', icon: <Spline className="w-4 h-4" />, labelKey: 'ToolArc', keyHint: '5' },
    { type: 'text', icon: <Type className="w-4 h-4" />, labelKey: 'ToolText', keyHint: '6' },
    { type: 'ruler', icon: <Ruler className="w-4 h-4" />, labelKey: 'ToolRuler', keyHint: '7' },
    { type: 'eraser', icon: <Eraser className="w-4 h-4" />, labelKey: 'ToolEraser', keyHint: '8' },
  ];

  const x = Math.min(position.x, window.innerWidth - 220);
  const y = Math.min(position.y, window.innerHeight - 320);

  return (
    <div
      ref={menuRef}
      style={{ left: x, top: y }}
      className="fixed z-50 w-52 bg-black/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md p-2 text-zinc-100 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <div className="text-[10px] font-mono font-bold text-zinc-400 px-2 py-1 uppercase tracking-wider border-b border-zinc-800 mb-1">
        Быстрые инструменты
      </div>

      <div className="grid grid-cols-3 gap-1 mb-1">
        {tools.map((t) => {
          const isActive = activeTool === t.type;
          return (
            <button
              key={t.type}
              onClick={() => {
                onSelectTool(t.type);
                onClose();
              }}
              title={getTranslation(lang, t.labelKey)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border ${
                isActive
                  ? 'bg-white text-black font-bold border-white shadow-md shadow-white/10'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border-transparent'
              }`}
            >
              {t.icon}
              <span className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-black font-bold' : 'opacity-70'}`}>
                [{t.keyHint}]
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between px-1">
        <button
          onClick={() => {
            onOpenColorPicker();
            onClose();
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 text-xs text-zinc-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-zinc-300" />
            <span>Цвет</span>
          </div>
          <div
            className="w-4 h-4 rounded border border-zinc-600 shadow-xs"
            style={{ backgroundColor: activeColorHex }}
          />
        </button>
      </div>
    </div>
  );
}
