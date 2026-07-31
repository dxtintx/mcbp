import { Point, TextLabel, ArcCurve } from '../types';
import { getBezierCurve } from './bezier';

export function getRectanglePoints(a: Point, b: Point): Point[] {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);

  const pointSet = new Set<string>();
  const points: Point[] = [];

  const add = (x: number, y: number) => {
    const key = `${x},${y}`;
    if (!pointSet.has(key)) {
      pointSet.add(key);
      points.push({ x, y });
    }
  };

  for (let x = minX; x <= maxX; x++) {
    add(x, minY);
    add(x, maxY);
  }
  for (let y = minY; y <= maxY; y++) {
    add(minX, y);
    add(maxX, y);
  }

  return points;
}

export function getTextGridBounds(
  label: TextLabel,
  cellSize: number = 16
): { x: number; y: number; width: number; height: number } {
  if (!label.text) {
    return { x: label.gridX, y: label.gridY, width: 1, height: 1 };
  }

  const approxWidthPx = label.text.length * (label.fontSize * 0.7);
  const approxHeightPx = label.fontSize * 1.3;

  const widthInGrid = Math.max(1, Math.ceil(approxWidthPx / Math.max(1, cellSize)));
  const heightInGrid = Math.max(1, Math.ceil(approxHeightPx / Math.max(1, cellSize)));

  return {
    x: label.gridX,
    y: label.gridY,
    width: widthInGrid,
    height: heightInGrid,
  };
}

export function isPointInTextLabel(
  label: TextLabel,
  gridPos: Point,
  cellSize: number = 16
): boolean {
  const bounds = getTextGridBounds(label, cellSize);
  return (
    gridPos.x >= bounds.x &&
    gridPos.x < bounds.x + bounds.width &&
    gridPos.y >= bounds.y &&
    gridPos.y < bounds.y + bounds.height
  );
}

export function isPointNearArcCurve(arc: ArcCurve, gridPos: Point): boolean {
  if (
    Math.abs(arc.controlX - gridPos.x) <= 1 &&
    Math.abs(arc.controlY - gridPos.y) <= 1
  ) {
    return true;
  }

  const p0 = { x: arc.startX, y: arc.startY };
  const p1 = { x: arc.controlX, y: arc.controlY };
  const p2 = { x: arc.endX, y: arc.endY };

  for (const pt of getBezierCurve(p0, p1, p2)) {
    if (Math.abs(pt.x - gridPos.x) <= 1 && Math.abs(pt.y - gridPos.y) <= 1) {
      return true;
    }
  }

  return false;
}
