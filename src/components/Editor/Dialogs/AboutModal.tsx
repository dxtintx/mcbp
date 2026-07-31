'use client';

import React from 'react';
import { getTranslation } from '@/core/localization/i18n';
import { Language } from '@/core/types';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function AboutModal({ isOpen, onClose, lang }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-3">
          <h3 className="text-base font-semibold text-white">
            {getTranslation(lang, 'AboutTitle')}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-zinc-300">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="MCBlueprint Logo"
              className="w-20 h-20 rounded-2xl mx-auto mb-3 border border-zinc-700 shadow-xl object-cover"
            />
            <h4 className="text-sm font-bold text-white">MCBlueprint</h4>
            <p className="text-[11px] text-zinc-400">Minecraft Architect & Planner Tool</p>
          </div>

          <p className="whitespace-pre-line leading-relaxed border-t border-zinc-800/80 pt-3">
            {getTranslation(lang, 'AboutText')}
          </p>

          <div className="bg-black p-3 rounded-lg border border-zinc-800 space-y-1 font-mono text-[11px] text-zinc-400">
            <div className="text-white font-bold mb-1">Keyboard Shortcuts:</div>
            <div>0-8: Select Tool (Pointer, Brush, Line, Rect, Circle, Arc, Text, Ruler, Eraser)</div>
            <div>Ctrl + Z: Undo</div>
            <div>Ctrl + Y / Ctrl + X: Redo</div>
            <div>G: Toggle Grid lines</div>
            <div>RMB / MMB / Space + Drag: Pan Canvas</div>
            <div>RMB Click (without move): Quick Context Menu</div>
            <div>Mouse Wheel: Zoom in/out centered at cursor</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
