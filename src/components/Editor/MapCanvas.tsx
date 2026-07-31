'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera } from '@/core/camera';
import {
  ProjectData,
  Point,
  Size,
  ToolType,
  TextLabel,
  RulerLine,
  ArcCurve,
  Language,
} from '@/core/types';
import { renderCanvas } from '@/core/renderers/canvasRenderer';
import { getBresenhamLine } from '@/core/algorithms/bresenham';
import { getRectanglePoints } from '@/core/algorithms/geometry';
import { getMidpointCircle } from '@/core/algorithms/circle';
import { getDistance } from '@/core/algorithms/bezier';
import { isPointInTextLabel, isPointNearArcCurve } from '@/core/algorithms/geometry';
import { hexToArgb } from '@/core/utils/color';

interface MapCanvasProps {
  camera: Camera;
  data: ProjectData;
  onDataChange: (newData: ProjectData) => void;
  activeTool: ToolType;
  activeColorHex: string;
  showGrid: boolean;
  showChunks: boolean;
  lang: Language;
  onCursorMove: (gridPos: Point) => void;
  onSaveSnapshot: () => void;
  onRequestTextInput: (gridPos: Point) => void;
  onOpenContextMenu: (screenPos: Point) => void;
}

export function MapCanvas({
  camera,
  data,
  onDataChange,
  activeTool,
  activeColorHex,
  showGrid,
  showChunks,
  lang,
  onCursorMove,
  onSaveSnapshot,
  onRequestTextInput,
  onOpenContextMenu,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [clientSize, setClientSize] = useState<Size>({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panLastPos, setPanLastPos] = useState<Point>({ x: 0, y: 0 });

  // Right Click Movement Detection for Context Menu vs Pan
  const [rmbStartPos, setRmbStartPos] = useState<Point | null>(null);
  const [rmbHasMoved, setRmbHasMoved] = useState(false);

  // Tool State
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [currentDragPoint, setCurrentDragPoint] = useState<Point | null>(null);

  // Arc Tool 2-Phase State (Phase 1: Draw base line, Phase 2: Live curvature adjustment)
  const [isAdjustingArc, setIsAdjustingArc] = useState(false);
  const [arcBaseStart, setArcBaseStart] = useState<Point | null>(null);
  const [arcBaseEnd, setArcBaseEnd] = useState<Point | null>(null);
  const [arcControlPoint, setArcControlPoint] = useState<Point | null>(null);

  // Reset Arc adjustment if active tool changes
  useEffect(() => {
    if (activeTool !== 'arc') {
      setIsAdjustingArc(false);
      setArcBaseStart(null);
      setArcBaseEnd(null);
      setArcControlPoint(null);
    }
  }, [activeTool]);

  // Pointer Tool Drag state
  const [draggedTextIndex, setDraggedTextIndex] = useState<number | null>(null);
  const [draggedArcIndex, setDraggedArcIndex] = useState<number | null>(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setClientSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute constrained ruler end point (Strictly Horizontal or Vertical)
  const getConstrainedRulerEndpoint = (start: Point, current: Point): Point => {
    const dx = Math.abs(current.x - start.x);
    const dy = Math.abs(current.y - start.y);
    if (dx >= dy) {
      return { x: current.x, y: start.y }; // Strictly horizontal
    } else {
      return { x: start.x, y: current.y }; // Strictly vertical
    }
  };

  // Compute active tool preview points
  const getToolPreview = useCallback(() => {
    if (!hoverPoint) return undefined;

    let points: Point[] | undefined = undefined;
    let rulerPreview: RulerLine | undefined = undefined;
    let arcPreview: ArcCurve | undefined = undefined;

    if (isAdjustingArc && arcBaseStart && arcBaseEnd && arcControlPoint) {
      arcPreview = {
        startX: arcBaseStart.x,
        startY: arcBaseStart.y,
        endX: arcBaseEnd.x,
        endY: arcBaseEnd.y,
        controlX: arcControlPoint.x,
        controlY: arcControlPoint.y,
        colorArgb: hexToArgb(activeColorHex),
      };
    } else if (isDrawing && dragStartPoint && currentDragPoint) {
      if (activeTool === 'line') {
        points = getBresenhamLine(dragStartPoint, currentDragPoint);
      } else if (activeTool === 'rectangle') {
        points = getRectanglePoints(dragStartPoint, currentDragPoint);
      } else if (activeTool === 'circle') {
        const radius = Math.round(getDistance(dragStartPoint, currentDragPoint));
        points = getMidpointCircle(dragStartPoint, radius);
      } else if (activeTool === 'ruler') {
        const endPt = getConstrainedRulerEndpoint(dragStartPoint, currentDragPoint);
        rulerPreview = {
          startX: dragStartPoint.x,
          startY: dragStartPoint.y,
          endX: endPt.x,
          endY: endPt.y,
        };
      } else if (activeTool === 'arc') {
        arcPreview = {
          startX: dragStartPoint.x,
          startY: dragStartPoint.y,
          endX: currentDragPoint.x,
          endY: currentDragPoint.y,
          controlX: Math.round((dragStartPoint.x + currentDragPoint.x) / 2),
          controlY: Math.round((dragStartPoint.y + currentDragPoint.y) / 2),
          colorArgb: hexToArgb(activeColorHex),
        };
      }
    }

    return {
      tool: activeTool,
      points,
      hoverPoint,
      rulerPreview,
      arcPreview,
    };
  }, [activeTool, activeColorHex, arcBaseEnd, arcBaseStart, arcControlPoint, currentDragPoint, dragStartPoint, hoverPoint, isAdjustingArc, isDrawing]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderCanvas(ctx, camera, clientSize, data, {
      showGrid,
      showChunks,
      lang,
      activeToolPreview: getToolPreview(),
    });
  }, [camera, clientSize, data, showGrid, showChunks, lang, getToolPreview]);

  // Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.setPointerCapture(e.pointerId);

    // RMB (2) or MMB (1) or Shift key => Panning
    if (e.button === 2 || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanLastPos({ x: e.clientX, y: e.clientY });

      if (e.button === 2) {
        setRmbStartPos({ x: e.clientX, y: e.clientY });
        setRmbHasMoved(false);
      }
      return;
    }

    if (e.button === 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const gridPos = camera.screenToGrid(screenPos);

      // Handle Arc Phase 2 Completion Click
      if (activeTool === 'arc' && isAdjustingArc && arcBaseStart && arcBaseEnd) {
        onSaveSnapshot();
        const newArc: ArcCurve = {
          startX: arcBaseStart.x,
          startY: arcBaseStart.y,
          endX: arcBaseEnd.x,
          endY: arcBaseEnd.y,
          controlX: gridPos.x,
          controlY: gridPos.y,
          colorArgb: hexToArgb(activeColorHex),
        };
        onDataChange({ ...data, arcs: [...data.arcs, newArc] });

        setIsAdjustingArc(false);
        setArcBaseStart(null);
        setArcBaseEnd(null);
        setArcControlPoint(null);
        return;
      }

      setIsDrawing(true);
      setDragStartPoint(gridPos);
      setCurrentDragPoint(gridPos);

      // Tool specific actions on press
      if (activeTool === 'pointer') {
        // Check if clicked text label or arc handle
        const textIdx = data.textLabels.findIndex((t) =>
          isPointInTextLabel(t, gridPos, camera.cellSize)
        );
        if (textIdx !== -1) {
          onSaveSnapshot();
          setDraggedTextIndex(textIdx);
          return;
        }

        const arcIdx = data.arcs.findIndex((a) => isPointNearArcCurve(a, gridPos));
        if (arcIdx !== -1) {
          onSaveSnapshot();
          setDraggedArcIndex(arcIdx);
          return;
        }
      } else if (activeTool === 'brush') {
        onSaveSnapshot();
        const argb = hexToArgb(activeColorHex);
        const newBlocks = { ...data.blocks, [`${gridPos.x},${gridPos.y}`]: argb };
        onDataChange({ ...data, blocks: newBlocks });
      } else if (activeTool === 'eraser') {
        onSaveSnapshot();
        eraseAtPoint(gridPos);
      } else if (activeTool === 'text') {
        onRequestTextInput(gridPos);
        setIsDrawing(false);
      } else {
        onSaveSnapshot();
      }
    }
  };

  const eraseAtPoint = (gridPos: Point) => {
    const key = `${gridPos.x},${gridPos.y}`;
    let modified = false;
    const newBlocks = { ...data.blocks };

    if (newBlocks[key] !== undefined) {
      delete newBlocks[key];
      modified = true;
    }

    const newRulers = data.rulers.filter((r) => {
      const minX = Math.min(r.startX, r.endX);
      const maxX = Math.max(r.startX, r.endX);
      const minY = Math.min(r.startY, r.endY);
      const maxY = Math.max(r.startY, r.endY);
      return !(
        gridPos.x >= minX &&
        gridPos.x <= maxX &&
        gridPos.y >= minY &&
        gridPos.y <= maxY
      );
    });
    if (newRulers.length !== data.rulers.length) modified = true;

    const newTexts = data.textLabels.filter(
      (t) => !isPointInTextLabel(t, gridPos, camera.cellSize)
    );
    if (newTexts.length !== data.textLabels.length) modified = true;

    const newArcs = data.arcs.filter((a) => !isPointNearArcCurve(a, gridPos));
    if (newArcs.length !== data.arcs.length) modified = true;

    if (modified) {
      onDataChange({
        ...data,
        blocks: newBlocks,
        rulers: newRulers,
        textLabels: newTexts,
        arcs: newArcs,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const gridPos = camera.screenToGrid(screenPos);

    setHoverPoint(gridPos);
    onCursorMove(gridPos);

    if (isPanning) {
      if (rmbStartPos) {
        const dist = Math.hypot(e.clientX - rmbStartPos.x, e.clientY - rmbStartPos.y);
        if (dist > 4) {
          setRmbHasMoved(true);
        }
      }

      camera.offsetX += e.clientX - panLastPos.x;
      camera.offsetY += e.clientY - panLastPos.y;
      setPanLastPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isAdjustingArc) {
      setArcControlPoint(gridPos);
      return;
    }

    if (isDrawing) {
      setCurrentDragPoint(gridPos);

      if (activeTool === 'pointer') {
        if (draggedTextIndex !== null) {
          const newTexts = [...data.textLabels];
          newTexts[draggedTextIndex] = {
            ...newTexts[draggedTextIndex],
            gridX: gridPos.x,
            gridY: gridPos.y,
          };
          onDataChange({ ...data, textLabels: newTexts });
        } else if (draggedArcIndex !== null) {
          const newArcs = [...data.arcs];
          newArcs[draggedArcIndex] = {
            ...newArcs[draggedArcIndex],
            controlX: gridPos.x,
            controlY: gridPos.y,
          };
          onDataChange({ ...data, arcs: newArcs });
        }
      } else if (activeTool === 'brush') {
        const argb = hexToArgb(activeColorHex);
        const key = `${gridPos.x},${gridPos.y}`;
        if (data.blocks[key] !== argb) {
          onDataChange({
            ...data,
            blocks: { ...data.blocks, [key]: argb },
          });
        }
      } else if (activeTool === 'eraser') {
        eraseAtPoint(gridPos);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);

    if (e.button === 2) {
      setIsPanning(false);
      if (!rmbHasMoved && rmbStartPos) {
        onOpenContextMenu({ x: e.clientX, y: e.clientY });
      }
      setRmbStartPos(null);
      setRmbHasMoved(false);
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && dragStartPoint && currentDragPoint) {
      setIsDrawing(false);
      const argb = hexToArgb(activeColorHex);

      if (activeTool === 'line') {
        const linePoints = getBresenhamLine(dragStartPoint, currentDragPoint);
        const newBlocks = { ...data.blocks };
        for (const pt of linePoints) {
          newBlocks[`${pt.x},${pt.y}`] = argb;
        }
        onDataChange({ ...data, blocks: newBlocks });
      } else if (activeTool === 'rectangle') {
        const rectPoints = getRectanglePoints(dragStartPoint, currentDragPoint);
        const newBlocks = { ...data.blocks };
        for (const pt of rectPoints) {
          newBlocks[`${pt.x},${pt.y}`] = argb;
        }
        onDataChange({ ...data, blocks: newBlocks });
      } else if (activeTool === 'circle') {
        const radius = Math.round(getDistance(dragStartPoint, currentDragPoint));
        const circlePoints = getMidpointCircle(dragStartPoint, radius);
        const newBlocks = { ...data.blocks };
        for (const pt of circlePoints) {
          newBlocks[`${pt.x},${pt.y}`] = argb;
        }
        onDataChange({ ...data, blocks: newBlocks });
      } else if (activeTool === 'ruler') {
        const endPt = getConstrainedRulerEndpoint(dragStartPoint, currentDragPoint);
        const newRuler: RulerLine = {
          startX: dragStartPoint.x,
          startY: dragStartPoint.y,
          endX: endPt.x,
          endY: endPt.y,
        };
        onDataChange({ ...data, rulers: [...data.rulers, newRuler] });
      } else if (activeTool === 'arc') {
        // Transition directly into Phase 2: Live Curvature Adjustment!
        setArcBaseStart(dragStartPoint);
        setArcBaseEnd(currentDragPoint);
        setArcControlPoint(currentDragPoint);
        setIsAdjustingArc(true);
      }

      setDraggedTextIndex(null);
      setDraggedArcIndex(null);
      setDragStartPoint(null);
      setCurrentDragPoint(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const delta = -e.deltaY;
    camera.zoomAt(cursor, delta);

    const gridPos = camera.screenToGrid(cursor);
    onCursorMove(gridPos);
  };

  // Cursor style logic
  let cursorClass = 'cursor-crosshair';
  if (isPanning) {
    cursorClass = 'cursor-grabbing';
  } else if (activeTool === 'pointer' || isAdjustingArc) {
    cursorClass = 'cursor-default';
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-slate-950 ${cursorClass}`}
    >
      <canvas
        ref={canvasRef}
        width={clientSize.width}
        height={clientSize.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        className="block touch-none"
      />
    </div>
  );
}
