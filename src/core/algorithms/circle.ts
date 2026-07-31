import { Point } from '../types';

export function getMidpointCircle(center: Point, radius: number): Point[] {
  const pointSet = new Set<string>();
  const points: Point[] = [];

  const addPoint = (x: number, y: number) => {
    const key = `${x},${y}`;
    if (!pointSet.has(key)) {
      pointSet.add(key);
      points.push({ x, y });
    }
  };

  if (radius <= 0) {
    points.push({ x: center.x, y: center.y });
    return points;
  }

  let x = radius;
  let y = 0;
  let err = 0;

  while (x >= y) {
    addOctantPoints(addPoint, center, x, y);

    y++;
    err += 1 + 2 * y;
    if (2 * (err - x) + 1 > 0) {
      x--;
      err += 1 - 2 * x;
    }
  }

  return points;
}

function addOctantPoints(
  addPoint: (x: number, y: number) => void,
  center: Point,
  x: number,
  y: number
) {
  addPoint(center.x + x, center.y + y);
  addPoint(center.x + y, center.y + x);
  addPoint(center.x - y, center.y + x);
  addPoint(center.x - x, center.y + y);
  addPoint(center.x - x, center.y - y);
  addPoint(center.x - y, center.y - x);
  addPoint(center.x + y, center.y - x);
  addPoint(center.x + x, center.y - y);
}
