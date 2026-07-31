import { ProjectData, TextLabel, RulerLine, ArcCurve } from './types';

export function serializeProject(data: ProjectData): string {
  // Convert internal JS representation to C# desktop compatible JSON format (PascalCase)
  const rawExport = {
    Blocks: data.blocks || {},
    TextLabels: (data.textLabels || []).map((t) => ({
      GridX: t.gridX,
      GridY: t.gridY,
      Text: t.text,
      ColorArgb: t.colorArgb,
      FontFamily: t.fontFamily,
      FontSize: t.fontSize,
      FontStyle: t.fontStyle,
    })),
    Rulers: (data.rulers || []).map((r) => ({
      StartX: r.startX,
      StartY: r.startY,
      EndX: r.endX,
      EndY: r.endY,
    })),
    Arcs: (data.arcs || []).map((a) => ({
      StartX: a.startX,
      StartY: a.startY,
      EndX: a.endX,
      EndY: a.endY,
      ControlX: a.controlX,
      ControlY: a.controlY,
      ColorArgb: a.colorArgb,
    })),
  };

  return JSON.stringify(rawExport, null, 2);
}

export function deserializeProject(jsonStr: string): ProjectData {
  const raw = JSON.parse(jsonStr);

  const blocks: Record<string, number> = raw.Blocks || raw.blocks || {};

  const rawTexts = raw.TextLabels || raw.textLabels || [];
  const textLabels: TextLabel[] = rawTexts.map((t: any) => ({
    gridX: t.GridX ?? t.gridX ?? 0,
    gridY: t.GridY ?? t.gridY ?? 0,
    text: t.Text ?? t.text ?? '',
    colorArgb: t.ColorArgb ?? t.colorArgb ?? -16777216,
    fontFamily: t.FontFamily ?? t.fontFamily ?? 'Segoe UI',
    fontSize: t.FontSize ?? t.fontSize ?? 12,
    fontStyle: t.FontStyle ?? t.fontStyle ?? 0,
  }));

  const rawRulers = raw.Rulers || raw.rulers || [];
  const rulers: RulerLine[] = rawRulers.map((r: any) => ({
    startX: r.StartX ?? r.startX ?? 0,
    startY: r.StartY ?? r.startY ?? 0,
    endX: r.EndX ?? r.endX ?? 0,
    endY: r.EndY ?? r.endY ?? 0,
  }));

  const rawArcs = raw.Arcs || raw.arcs || [];
  const arcs: ArcCurve[] = rawArcs.map((a: any) => ({
    startX: a.StartX ?? a.startX ?? 0,
    startY: a.StartY ?? a.startY ?? 0,
    endX: a.EndX ?? a.endX ?? 0,
    endY: a.EndY ?? a.endY ?? 0,
    controlX: a.ControlX ?? a.controlX ?? 0,
    controlY: a.ControlY ?? a.controlY ?? 0,
    colorArgb: a.ColorArgb ?? a.colorArgb ?? -16777216,
  }));

  return { blocks, textLabels, rulers, arcs };
}
