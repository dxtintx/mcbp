'use client';

import React from 'react';
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
  RotateCcw,
  RotateCw,
  Grid,
  Palette,
} from 'lucide-react';

interface ToolBarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  activeColorHex: string;
  onOpenColorPicker: () => void;
  onOpenFontPicker: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  lang: Language;
}

export function ToolBar({
  activeTool,
  onSelectTool,
  activeColorHex,
  onOpenColorPicker,
  onOpenFontPicker,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
  lang,
}: ToolBarProps) {
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

  return (
    <div className="bg-black border-b border-zinc-800 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto select-none z-20 shadow-xs">
      {/* 9 Tool Selector Buttons */}
      <div className="flex items-center gap-1">
        {tools.map((t) => {
          const isActive = activeTool === t.type;
          return (
            <button
              key={t.type}
              onClick={() => onSelectTool(t.type)}
              title={getTranslation(lang, t.labelKey)}
              className={`p-2 rounded-lg relative group transition-all ${
                isActive
                  ? 'bg-white text-black font-bold border border-white shadow-md shadow-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
              }`}
            >
              {t.icon}
              <span className={`absolute -bottom-1 -right-0.5 text-[9px] font-mono ${isActive ? 'text-black font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                {t.keyHint}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-5 w-px bg-zinc-800 mx-1" />

      {/* Color Swatch Picker */}
      <button
        onClick={onOpenColorPicker}
        title={getTranslation(lang, 'ToolColor')}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 text-xs transition-colors"
      >
        <Palette className="w-3.5 h-3.5 text-zinc-300" />
        <div
          className="w-4 h-4 rounded border border-zinc-600 shadow-xs"
          style={{ backgroundColor: activeColorHex }}
        />
      </button>

      {/* Font Picker */}
      <button
        onClick={onOpenFontPicker}
        title={getTranslation(lang, 'ToolFont')}
        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent transition-colors"
      >
        <Type className="w-4 h-4 text-zinc-200" />
      </button>

      <div className="h-5 w-px bg-zinc-800 mx-1" />

      {/* Undo & Redo Buttons */}
      <button
        disabled={!canUndo}
        onClick={onUndo}
        title={getTranslation(lang, 'ToolUndo')}
        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-30 disabled:pointer-events-none border border-transparent transition-colors"
      >
        <RotateCcw className="w-4 h-4 text-zinc-200" />
      </button>

      <button
        disabled={!canRedo}
        onClick={onRedo}
        title={getTranslation(lang, 'ToolRedo')}
        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-30 disabled:pointer-events-none border border-transparent transition-colors"
      >
        <RotateCw className="w-4 h-4 text-zinc-200" />
      </button>

      <div className="h-5 w-px bg-zinc-800 mx-1" />

      {/* Toggle Grid */}
      <button
        onClick={onToggleGrid}
        title={getTranslation(lang, 'ToolGrid')}
        className={`p-2 rounded-lg transition-colors border ${
          showGrid
            ? 'bg-zinc-800 text-white border-zinc-700 font-semibold'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border-transparent'
        }`}
      >
        <Grid className="w-4 h-4" />
      </button>
    </div>
  );
}
