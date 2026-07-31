import { Point } from '../types';

export function getDistance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function getBezierCurve(p0: Point, p1: Point, p2: Point): Point[] {
  const pointSet = new Set<string>();
  const points: Point[] = [];

  const dist = getDistance(p0, p1) + getDistance(p1, p2);
  const steps = Math.max(10, Math.round(dist * 2));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1.0 - t;

    const x = Math.round(u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x);
    const y = Math.round(u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y);

    const key = `${x},${y}`;
    if (!pointSet.has(key)) {
      pointSet.add(key);
      points.push({ x, y });
    }
  }

  return points;
}
