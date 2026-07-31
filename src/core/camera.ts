import { Point, Size } from './types';

export class Camera {
  public offsetX: number = 0;
  public offsetY: number = 0;
  public cellSize: number = 16;

  public static readonly MinCellSize: number = 2;
  public static readonly MaxCellSize: number = 64;

  public static readonly MinY: number = -159;
  public static readonly MaxY: number = 159;

  public screenToGrid(screen: Point): Point {
    return {
      x: Math.floor((screen.x - this.offsetX) / this.cellSize),
      y: Math.floor((screen.y - this.offsetY) / this.cellSize),
    };
  }

  public gridToScreen(gx: number, gy: number): Point {
    return {
      x: gx * this.cellSize + this.offsetX,
      y: gy * this.cellSize + this.offsetY,
    };
  }

  public getVisibleGridRect(clientSize: Size): {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } {
    const left = Math.floor(-this.offsetX / this.cellSize) - 1;
    const top = Math.floor(-this.offsetY / this.cellSize) - 1;
    const right = Math.ceil((clientSize.width - this.offsetX) / this.cellSize) + 1;
    const bottom = Math.ceil((clientSize.height - this.offsetY) / this.cellSize) + 1;

    return { left, top, right, bottom };
  }

  public zoomAt(cursor: Point, delta: number): void {
    const gridXBefore = (cursor.x - this.offsetX) / this.cellSize;
    const gridYBefore = (cursor.y - this.offsetY) / this.cellSize;

    const step = delta > 0 ? 1 : -1;
    if (this.cellSize < 8) {
      this.cellSize += step;
    } else if (this.cellSize < 16) {
      this.cellSize += step * 2;
    } else {
      this.cellSize += step * 4;
    }

    this.cellSize = Math.min(
      Math.max(this.cellSize, Camera.MinCellSize),
      Camera.MaxCellSize
    );

    this.offsetX = cursor.x - gridXBefore * this.cellSize;
    this.offsetY = cursor.y - gridYBefore * this.cellSize;
  }

  public centerOn(clientSize: Size, gridX: number = 0, gridY: number = 0): void {
    this.offsetX = clientSize.width / 2 - gridX * this.cellSize;
    this.offsetY = clientSize.height / 2 - gridY * this.cellSize;
  }
}
