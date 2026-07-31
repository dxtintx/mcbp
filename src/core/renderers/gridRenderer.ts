import { Camera } from '../camera';
import { Size } from '../types';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  clientSize: Size,
  showChunks: boolean
): void {
  const visRect = camera.getVisibleGridRect(clientSize);
  const cs = camera.cellSize;

  if (cs >= 4) {
    ctx.lineWidth = 1;

    for (let gx = visRect.left; gx <= visRect.right; gx++) {
      const sx = gx * cs + camera.offsetX;
      const isChunk = showChunks && gx % 16 === 0;

      ctx.strokeStyle = isChunk
        ? 'rgba(160, 160, 160, 0.45)'
        : 'rgba(210, 210, 210, 0.25)';
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, clientSize.height);
      ctx.stroke();
    }

    for (let gy = visRect.top; gy <= visRect.bottom; gy++) {
      const sy = gy * cs + camera.offsetY;
      const isChunk = showChunks && gy % 16 === 0;

      ctx.strokeStyle = isChunk
        ? 'rgba(160, 160, 160, 0.45)'
        : 'rgba(210, 210, 210, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(clientSize.width, sy);
      ctx.stroke();
    }
  }

  const y0 = camera.offsetY;
  if (y0 >= 0 && y0 <= clientSize.height) {
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(clientSize.width, y0);
    ctx.stroke();
  }

  const x0 = camera.offsetX;
  if (x0 >= 0 && x0 <= clientSize.width) {
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, clientSize.height);
    ctx.stroke();
  }

  const yMin = Camera.MinY * cs + camera.offsetY;
  const yMax = (Camera.MaxY + 1) * cs + camera.offsetY;

  ctx.strokeStyle = 'rgba(120, 120, 120, 0.6)';
  ctx.lineWidth = 2;

  if (yMin >= -2 && yMin <= clientSize.height + 2) {
    ctx.beginPath();
    ctx.moveTo(0, yMin);
    ctx.lineTo(clientSize.width, yMin);
    ctx.stroke();
  }

  if (yMax >= -2 && yMax <= clientSize.height + 2) {
    ctx.beginPath();
    ctx.moveTo(0, yMax);
    ctx.lineTo(clientSize.width, yMax);
    ctx.stroke();
  }
}
