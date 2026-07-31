'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera } from '@/core/camera';
import { UndoRedoManager } from '@/core/undoRedo';
import { ProjectData, ToolType, Language, Point, Size } from '@/core/types';
import { serializeProject, deserializeProject } from '@/core/serializers';
import { detectInitialLanguage, saveUserLanguage } from '@/core/localization/i18n';
import { MenuBar } from '@/components/Editor/MenuBar';
import { ToolBar } from '@/components/Editor/ToolBar';
import { StatusBar } from '@/components/Editor/StatusBar';
import { MapCanvas } from '@/components/Editor/MapCanvas';
import { TextInputModal } from '@/components/Editor/Dialogs/TextInputModal';
import { ColorPickerModal } from '@/components/Editor/Dialogs/ColorPickerModal';
import { AboutModal } from '@/components/Editor/Dialogs/AboutModal';
import { ContextMenu } from '@/components/Editor/ContextMenu';

const INITIAL_DATA: ProjectData = {
  blocks: {},
  textLabels: [],
  rulers: [],
  arcs: [],
};

export default function EditorPage() {
  const cameraRef = useRef<Camera>(new Camera());
  const undoRedoRef = useRef<UndoRedoManager>(new UndoRedoManager());

  const [data, setData] = useState<ProjectData>(INITIAL_DATA);
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [activeColorHex, setActiveColorHex] = useState<string>('#000000');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showChunks, setShowChunks] = useState<boolean>(true);
  const [lang, setLang] = useState<Language>('English');

  const [cursorGridPos, setCursorGridPos] = useState<Point>({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isTextInputOpen, setIsTextInputOpen] = useState<boolean>(false);
  const [textInputGridPos, setTextInputGridPos] = useState<Point>({ x: 0, y: 0 });
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Quick Context Menu (RMB Click without camera movement)
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);
  const [contextMenuPos, setContextMenuPos] = useState<Point>({ x: 0, y: 0 });

  // Detect language from localStorage or browser navigator on mount
  useEffect(() => {
    const detected = detectInitialLanguage();
    setLang(detected);
    cameraRef.current.centerOn({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleSelectLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    saveUserLanguage(newLang);
  }, []);

  // Compute Project Bounding Box Size
  const getProjectBounds = useCallback((): Size => {
    const keys = Object.keys(data.blocks);
    if (keys.length === 0) return { width: 0, height: 0 };

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    for (const key of keys) {
      const comma = key.indexOf(',');
      if (comma === -1) continue;
      const x = parseInt(key.substring(0, comma), 10);
      const y = parseInt(key.substring(comma + 1), 10);

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    return {
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }, [data.blocks]);

  // Undo / Redo Handlers
  const handleSaveSnapshot = useCallback(() => {
    undoRedoRef.current.saveSnapshot(data);
  }, [data]);

  const handleUndo = useCallback(() => {
    const prev = undoRedoRef.current.undo(data);
    if (prev) {
      setData(prev);
    }
  }, [data]);

  const handleRedo = useCallback(() => {
    const next = undoRedoRef.current.redo(data);
    if (next) {
      setData(next);
    }
  }, [data]);

  const handleClearAll = useCallback(() => {
    handleSaveSnapshot();
    setData({ blocks: {}, textLabels: [], rulers: [], arcs: [] });
  }, [handleSaveSnapshot]);

  // File IO Handlers
  const handleNewProject = useCallback(() => {
    if (
      Object.keys(data.blocks).length > 0 &&
      !window.confirm('Create new project? Unsaved changes will be cleared.')
    ) {
      return;
    }
    undoRedoRef.current.clear();
    setData({ blocks: {}, textLabels: [], rulers: [], arcs: [] });
    cameraRef.current.centerOn({ width: window.innerWidth, height: window.innerHeight });
  }, [data.blocks]);

  const handleSaveProject = useCallback(() => {
    const jsonStr = serializeProject(data);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minecraft_blueprint.mcbp';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handleOpenProjectClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const loadedData = deserializeProject(content);
        undoRedoRef.current.clear();
        setData(loadedData);
      } catch (err) {
        alert(`Failed to load .mcbp project file:\n${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleExportPng = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'blueprint.png';
    a.click();
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when modal input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
        return;
      }

      const key = e.key.toLowerCase();

      if (e.ctrlKey || e.metaKey) {
        if (key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        } else if (key === 'n') {
          e.preventDefault();
          handleNewProject();
        } else if (key === 'o') {
          e.preventDefault();
          handleOpenProjectClick();
        } else if (key === 's') {
          e.preventDefault();
          handleSaveProject();
        }
      } else {
        if (key >= '0' && key <= '8') {
          const toolMap: ToolType[] = [
            'pointer',
            'brush',
            'line',
            'rectangle',
            'circle',
            'arc',
            'text',
            'ruler',
            'eraser',
          ];
          const toolIdx = parseInt(key, 10);
          if (toolMap[toolIdx]) {
            setActiveTool(toolMap[toolIdx]);
          }
        } else if (key === 'g') {
          setShowGrid((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleNewProject, handleOpenProjectClick, handleSaveProject]);

  return (
    <main className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {/* Hidden file input for opening .mcbp */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".mcbp,.json"
        className="hidden"
      />

      {/* Top MenuBar */}
      <MenuBar
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
        onNewProject={handleNewProject}
        onOpenProject={handleOpenProjectClick}
        onSaveProject={handleSaveProject}
        onExportPng={handleExportPng}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearAll={handleClearAll}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((p) => !p)}
        onCenterCamera={() =>
          cameraRef.current.centerOn({ width: window.innerWidth, height: window.innerHeight })
        }
        onShowAbout={() => setIsAboutOpen(true)}
        canUndo={undoRedoRef.current.canUndo}
        canRedo={undoRedoRef.current.canRedo}
      />

      {/* Action ToolBar */}
      <ToolBar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        activeColorHex={activeColorHex}
        onOpenColorPicker={() => setIsColorPickerOpen(true)}
        onOpenFontPicker={() => {
          setTextInputGridPos({ x: 0, y: 0 });
          setIsTextInputOpen(true);
        }}
        canUndo={undoRedoRef.current.canUndo}
        canRedo={undoRedoRef.current.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((p) => !p)}
        lang={lang}
      />

      {/* Interactive 2D Canvas Workspace */}
      <div className="flex-1 relative">
        <MapCanvas
          camera={cameraRef.current}
          data={data}
          onDataChange={setData}
          activeTool={activeTool}
          activeColorHex={activeColorHex}
          showGrid={showGrid}
          showChunks={showChunks}
          lang={lang}
          onCursorMove={setCursorGridPos}
          onSaveSnapshot={handleSaveSnapshot}
          onRequestTextInput={(gridPos) => {
            setTextInputGridPos(gridPos);
            setIsTextInputOpen(true);
          }}
          onOpenContextMenu={(screenPos) => {
            setContextMenuPos(screenPos);
            setIsContextMenuOpen(true);
          }}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        cursorGridPos={cursorGridPos}
        projectBounds={getProjectBounds()}
        blockCount={Object.keys(data.blocks).length}
        cellSize={cameraRef.current.cellSize}
        lang={lang}
      />

      {/* Modals & Popups */}
      <ContextMenu
        isOpen={isContextMenuOpen}
        position={contextMenuPos}
        onClose={() => setIsContextMenuOpen(false)}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        activeColorHex={activeColorHex}
        onOpenColorPicker={() => setIsColorPickerOpen(true)}
        lang={lang}
      />

      <TextInputModal
        isOpen={isTextInputOpen}
        onClose={() => setIsTextInputOpen(false)}
        initialColorHex={activeColorHex}
        lang={lang}
        onConfirm={(text, fontFamily, fontSize, fontStyle, colorArgb) => {
          handleSaveSnapshot();
          const newLabel = {
            gridX: textInputGridPos.x,
            gridY: textInputGridPos.y,
            text,
            fontFamily,
            fontSize,
            fontStyle,
            colorArgb,
          };
          setData((prev) => ({ ...prev, textLabels: [...prev.textLabels, newLabel] }));
        }}
      />

      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        currentHex={activeColorHex}
        lang={lang}
        onSelectColor={(_, hex) => setActiveColorHex(hex)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        lang={lang}
      />
    </main>
  );
}
