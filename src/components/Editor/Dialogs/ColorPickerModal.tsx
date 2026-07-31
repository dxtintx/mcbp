'use client';

import React from 'react';
import { getTranslation } from '@/core/localization/i18n';
import { Language } from '@/core/types';
import { hexToArgb } from '@/core/utils/color';

const MONOCHROME_PRESETS = [
  '#000000', '#0f0f0f', '#1a1a1a', '#262626',
  '#333333', '#404040', '#4d4d4d', '#595959',
  '#666666', '#737373', '#808080', '#8c8c8c',
  '#999999', '#a6a6a6', '#b3b3b3', '#bfbfbf',
  '#cccccc', '#d9d9d9', '#e6e6e6', '#ffffff',
];

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (colorArgb: number, colorHex: string) => void;
  currentHex: string;
  lang: Language;
}

export function ColorPickerModal({
  isOpen,
  onClose,
  onSelectColor,
  currentHex,
  lang,
}: ColorPickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100">
            {getTranslation(lang, 'ToolColor')}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Черно-белая палитра</label>
            <div className="grid grid-cols-5 gap-2">
              {MONOCHROME_PRESETS.map((hex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectColor(hexToArgb(hex), hex);
                    onClose();
                  }}
                  style={{ backgroundColor: hex }}
                  className={`w-10 h-10 rounded-lg border shadow-xs transition-transform hover:scale-110 focus:outline-hidden ${
                    currentHex.toLowerCase() === hex.toLowerCase()
                      ? 'border-indigo-400 ring-2 ring-indigo-500/50'
                      : 'border-slate-700/60'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Произвольный цвет:</span>
            <input
              type="color"
              value={currentHex}
              onChange={(e) => {
                const hex = e.target.value;
                onSelectColor(hexToArgb(hex), hex);
              }}
              className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
