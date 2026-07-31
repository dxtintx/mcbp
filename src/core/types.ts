export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TextLabel {
  gridX: number;
  gridY: number;
  text: string;
  colorArgb: number;
  fontFamily: string;
  fontSize: number;
  fontStyle: number;
}

export interface RulerLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface ArcCurve {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  colorArgb: number;
}

export interface ProjectData {
  blocks: Record<string, number>;
  textLabels: TextLabel[];
  rulers: RulerLine[];
  arcs: ArcCurve[];
}

export type ToolType =
  | 'pointer'
  | 'brush'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'arc'
  | 'text'
  | 'ruler'
  | 'eraser';

export type Language =
  | 'English'
  | 'Russian'
  | 'Spanish'
  | 'German'
  | 'French'
  | 'Chinese'
  | 'Japanese'
  | 'Portuguese'
  | 'Italian'
  | 'Korean';
