'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getTranslation, languageNativeNames } from '@/core/localization/i18n';
import { Language } from '@/core/types';
import {
  File,
  FolderOpen,
  Save,
  Download,
  RotateCcw,
  RotateCw,
  Trash2,
  Grid,
  Crosshair,
  Globe,
  HelpCircle,
} from 'lucide-react';

interface MenuBarProps {
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onExportPng: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onCenterCamera: () => void;
  onShowAbout: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function MenuBar({
  lang,
  onSelectLanguage,
  onNewProject,
  onOpenProject,
  onSaveProject,
  onExportPng,
  onUndo,
  onRedo,
  onClearAll,
  showGrid,
  onToggleGrid,
  onCenterCamera,
  onShowAbout,
  canUndo,
  canRedo,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const languagesList: Language[] = [
    'English',
    'Russian',
    'Spanish',
    'German',
    'French',
    'Chinese',
    'Japanese',
    'Portuguese',
    'Italian',
    'Korean',
  ];

  return (
    <div
      ref={menuRef}
      className="bg-black border-b border-zinc-800 text-zinc-300 text-xs px-2 py-1 flex items-center gap-1 select-none z-30 font-sans"
    >
      {/* Brand Icon & Name */}
      <div className="flex items-center gap-2 pr-3 border-r border-zinc-800 font-bold text-white">
        <img
          src="/logo.png"
          alt="MCBlueprint Logo"
          className="w-5 h-5 rounded object-cover shadow-xs border border-zinc-700"
        />
        <span>MCBlueprint</span>
      </div>

      {/* 1. File Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('file')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeMenu === 'file' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'
          }`}
        >
          {getTranslation(lang, 'MenuFile')}
        </button>

        {activeMenu === 'file' && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-1 z-40">
            <button
              onClick={() => {
                onNewProject();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <File className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuNew')}</span>
              <span className="ml-auto text-[10px] text-zinc-500 font-mono">Ctrl+N</span>
            </button>
            <button
              onClick={() => {
                onOpenProject();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuOpen')}</span>
              <span className="ml-auto text-[10px] text-zinc-500 font-mono">Ctrl+O</span>
            </button>
            <button
              onClick={() => {
                onSaveProject();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <Save className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuSave')}</span>
              <span className="ml-auto text-[10px] text-zinc-500 font-mono">Ctrl+S</span>
            </button>
            <button
              onClick={() => {
                onExportPng();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white border-t border-zinc-800/80 mt-1 pt-1.5"
            >
              <Download className="w-3.5 h-3.5 text-zinc-300" />
              <span>{getTranslation(lang, 'MenuExportPng')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Edit Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('edit')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeMenu === 'edit' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'
          }`}
        >
          {getTranslation(lang, 'MenuEdit')}
        </button>

        {activeMenu === 'edit' && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-1 z-40">
            <button
              disabled={!canUndo}
              onClick={() => {
                onUndo();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuUndo')}</span>
              <span className="ml-auto text-[10px] text-zinc-500 font-mono">Ctrl+Z</span>
            </button>
            <button
              disabled={!canRedo}
              onClick={() => {
                onRedo();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuRedo')}</span>
              <span className="ml-auto text-[10px] text-zinc-500 font-mono">Ctrl+Y</span>
            </button>
            <button
              onClick={() => {
                onClearAll();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white border-t border-zinc-800/80 mt-1 pt-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuClearAll')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. View Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('view')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeMenu === 'view' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'
          }`}
        >
          {getTranslation(lang, 'MenuView')}
        </button>

        {activeMenu === 'view' && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-1 z-40">
            <button
              onClick={() => {
                onToggleGrid();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <Grid className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuGrid')}</span>
              <span className="ml-auto text-xs">{showGrid ? '✓' : ''}</span>
            </button>
            <button
              onClick={() => {
                onCenterCamera();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuCenterCamera')}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Language Menu */}
      <div className="relative ml-auto">
        <button
          onClick={() => toggleMenu('language')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            activeMenu === 'language' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span>{languageNativeNames[lang]}</span>
        </button>

        {activeMenu === 'language' && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-1 z-40 max-h-64 overflow-y-auto">
            {languagesList.map((l) => (
              <button
                key={l}
                onClick={() => {
                  onSelectLanguage(l);
                  setActiveMenu(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-zinc-800 ${
                  lang === l ? 'text-white font-bold bg-zinc-900' : 'text-zinc-300'
                }`}
              >
                <span>{languageNativeNames[l]}</span>
                {lang === l && <span>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Help Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('help')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeMenu === 'help' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'
          }`}
        >
          {getTranslation(lang, 'MenuHelp')}
        </button>

        {activeMenu === 'help' && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl py-1 z-40">
            <button
              onClick={() => {
                onShowAbout();
                setActiveMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>{getTranslation(lang, 'MenuAbout')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
