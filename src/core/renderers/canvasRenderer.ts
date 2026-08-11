import { Camera } from '../camera';
import { ProjectData, Size, RulerLine, ArcCurve, TextLabel, Point, Language } from '../types';
import { argbToHex } from '../utils/color';
import { getBezierCurve } from '../algorithms/bezier';
import { drawGrid } from './gridRenderer';
import { getTranslation } from '../localization/i18n';

export interface RenderOptions {
  showGrid: boolean;
  showChunks: boolean;
  lang?: Language;
  activeToolPreview?: {
    tool: string;
    points?: Point[];
    hoverPoint?: Point;
    rulerPreview?: RulerLine;
    arcPreview?: ArcCurve;
  };
}

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  clientSize: Size,
  data: ProjectData,
  options: RenderOptions
): void {
  const cs = camera.cellSize;
  const visRect = camera.getVisibleGridRect(clientSize);
  const lang = options.lang || 'Russian';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, clientSize.width, clientSize.height);

  if (options.showGrid) {
    drawGrid(ctx, camera, clientSize, options.showChunks);
  }

  for (const [key, argb] of Object.entries(data.blocks)) {
    const comma = key.indexOf(',');
    if (comma === -1) continue;
    const x = parseInt(key.substring(0, comma), 10);
    const y = parseInt(key.substring(comma + 1), 10);

    if (
      x < visRect.left ||
      x > visRect.right ||
      y < visRect.top ||
      y > visRect.bottom
    ) {
      continue;
    }

    const sp = camera.gridToScreen(x, y);
    ctx.fillStyle = argbToHex(argb);
    ctx.fillRect(sp.x, sp.y, cs, cs);
  }

  for (const ruler of data.rulers) {
    drawRuler(ctx, camera, ruler, lang);
  }

  for (const arc of data.arcs) {
    drawArcCurve(ctx, camera, arc);
  }

  for (const lbl of data.textLabels) {
    drawTextLabel(ctx, camera, lbl);
  }

  if (options.activeToolPreview) {
    const { tool, points, hoverPoint, rulerPreview, arcPreview } =
      options.activeToolPreview;

    if (points && points.length > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      for (const pt of points) {
        const sp = camera.gridToScreen(pt.x, pt.y);
        ctx.fillRect(sp.x, sp.y, cs, cs);
      }
    }

    if (rulerPreview) {
      drawRuler(ctx, camera, rulerPreview, lang, true);
    }

    if (arcPreview) {
      drawArcCurve(ctx, camera, arcPreview, true);
    }

    if (hoverPoint && (tool === 'brush' || tool === 'eraser')) {
      const sp = camera.gridToScreen(hoverPoint.x, hoverPoint.y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.6)';
      ctx.strokeRect(sp.x, sp.y, cs, cs);
    }
  }
}

function drawRuler(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  ruler: RulerLine,
  lang: Language,
  isPreview: boolean = false
): void {
  const cs = camera.cellSize;
  const sp1 = camera.gridToScreen(ruler.startX, ruler.startY);
  const sp2 = camera.gridToScreen(ruler.endX, ruler.endY);

  const cx1 = sp1.x + cs / 2;
  const cy1 = sp1.y + cs / 2;
  const cx2 = sp2.x + cs / 2;
  const cy2 = sp2.y + cs / 2;

  ctx.save();
  ctx.strokeStyle = isPreview ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.9)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cx1, cy1);
  ctx.lineTo(cx2, cy2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.beginPath();
  ctx.arc(cx1, cy1, 3.5, 0, Math.PI * 2);
  ctx.arc(cx2, cy2, 3.5, 0, Math.PI * 2);
  ctx.fill();

  const distance =
    ruler.startX === ruler.endX
      ? Math.abs(ruler.endY - ruler.startY) + 1
      : Math.abs(ruler.endX - ruler.startX) + 1;

  const rulerUnit = getTranslation(lang, 'RulerUnit');
  const label = `${distance} ${rulerUnit}`;

  ctx.font = 'bold 12px sans-serif';
  const textMetrics = ctx.measureText(label);
  const textWidth = textMetrics.width;
  const textHeight = 14;

  const midX = (cx1 + cx2) / 2;
  const midY = (cy1 + cy2) / 2;

  const tx = midX - textWidth / 2;
  const ty = midY - textHeight / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(tx - 5, ty - 2, textWidth + 10, textHeight + 4);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.lineWidth = 1;
  ctx.strokeRect(tx - 5, ty - 2, textWidth + 10, textHeight + 4);

  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, midX, midY + 1);
  ctx.restore();
}

function drawArcCurve(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  arc: ArcCurve,
  isPreview: boolean = false
): void {
  const cs = camera.cellSize;
  const p0 = { x: arc.startX, y: arc.startY };
  const p1 = { x: arc.controlX, y: arc.controlY };
  const p2 = { x: arc.endX, y: arc.endY };

  const colorStr = isPreview ? 'rgba(100, 100, 100, 0.6)' : argbToHex(arc.colorArgb);
  ctx.fillStyle = colorStr;

  for (const pt of getBezierCurve(p0, p1, p2)) {
    const sp = camera.gridToScreen(pt.x, pt.y);
    ctx.fillRect(sp.x, sp.y, cs, cs);
  }

  const sp0 = camera.gridToScreen(arc.startX, arc.startY);
  const sp1 = camera.gridToScreen(arc.endX, arc.endY);
  const sp2 = camera.gridToScreen(arc.controlX, arc.controlY);

  const cx0 = sp0.x + cs / 2;
  const cy0 = sp0.y + cs / 2;
  const cx1 = sp1.x + cs / 2;
  const cy1 = sp1.y + cs / 2;
  const cx2 = sp2.x + cs / 2;
  const cy2 = sp2.y + cs / 2;

  ctx.save();
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.65)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cx0, cy0);
  ctx.lineTo(cx2, cy2);
  ctx.lineTo(cx1, cy1);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'rgba(120, 120, 120, 0.8)';
  ctx.beginPath();
  ctx.arc(cx0, cy0, 3, 0, Math.PI * 2);
  ctx.arc(cx1, cy1, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(130, 130, 130, 0.85)';
  ctx.strokeStyle = 'rgba(70, 70, 70, 0.95)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx2, cy2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawTextLabel(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  lbl: TextLabel
): void {
  const sp = camera.gridToScreen(lbl.gridX, lbl.gridY);

  let stylePrefix = '';
  if (lbl.fontStyle === 1) stylePrefix = 'bold ';
  else if (lbl.fontStyle === 2) stylePrefix = 'italic ';
  else if (lbl.fontStyle === 3) stylePrefix = 'bold italic ';

  const fontPx = Math.max(10, lbl.fontSize);
  ctx.font = `${stylePrefix}${fontPx}px ${lbl.fontFamily || 'Segoe UI'}, sans-serif`;

  const textMetrics = ctx.measureText(lbl.text);
  const textWidth = textMetrics.width;
  const textHeight = fontPx * 1.2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(sp.x, sp.y, textWidth + 4, textHeight);

  ctx.fillStyle = argbToHex(lbl.colorArgb);
  ctx.textBaseline = 'top';
  ctx.fillText(lbl.text, sp.x + 2, sp.y + 2);
}
