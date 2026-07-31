'use client';

import React, { useState } from 'react';
import { getTranslation } from '@/core/localization/i18n';
import { Language } from '@/core/types';
import { hexToArgb } from '@/core/utils/color';

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string, fontFamily: string, fontSize: number, fontStyle: number, colorArgb: number) => void;
  initialText?: string;
  initialFontFamily?: string;
  initialFontSize?: number;
  initialColorHex?: string;
  lang: Language;
}

export function TextInputModal({
  isOpen,
  onClose,
  onConfirm,
  initialText = '',
  initialFontFamily = 'Segoe UI',
  initialFontSize = 12,
  initialColorHex = '#000000',
  lang,
}: TextInputModalProps) {
  const [text, setText] = useState(initialText);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [colorHex, setColorHex] = useState(initialColorHex);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let fontStyle = 0;
    if (isBold && isItalic) fontStyle = 3;
    else if (isBold) fontStyle = 1;
    else if (isItalic) fontStyle = 2;

    const colorArgb = hexToArgb(colorHex);
    onConfirm(text, fontFamily, fontSize, fontStyle, colorArgb);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-semibold text-white mb-4">
          {getTranslation(lang, 'ToolText')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Text
            </label>
            <input
              type="text"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter label text..."
              className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-white"
              >
                <option value="Segoe UI">Segoe UI</option>
                <option value="Arial">Arial</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Courier New">Monospace</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Size ({fontSize}px)
              </label>
              <input
                type="range"
                min="8"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white mt-3"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                  className="rounded border-zinc-700 text-white focus:ring-white"
                />
                Bold
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isItalic}
                  onChange={(e) => setIsItalic(e.target.checked)}
                  className="rounded border-zinc-700 text-white focus:ring-white"
                />
                Italic
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Color:</span>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-lg shadow-sm transition-colors"
            >
              Add Label
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
