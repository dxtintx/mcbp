using MCBp.Canvas;
using MCBp.Data;
using MCBp.Rendering;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Ластик" — удаление блоков, дуг, текстовых меток и линеек.
/// При наведении подсвечивает удаляемый объект красным.
/// </summary>
public class EraserTool : ITool
{
    private enum HitType { None, Block, Arc, Text, Ruler }

    private HitType _hoveredType = HitType.None;
    private Point _hoveredBlock;
    private TextLabel? _hoveredText;
    private ArcCurve? _hoveredArc;

    public bool DataChanged { get; private set; }

    public void OnPress(Point gridPos, ProjectData data, Color activeColor, Font activeFont)
    {
        DataChanged = false;

        // 1. Блок
        if (data.BlockMap.ContainsKey(gridPos))
        {
            data.BlockMap.Remove(gridPos);
            DataChanged = true;
            return;
        }

        // 2. Дуга (кривая Безье)
        for (int i = data.Arcs.Count - 1; i >= 0; i--)
        {
            var arc = data.Arcs[i];
            if (RenderUtils.IsPointNearArcCurve(arc, gridPos))
            {
                data.Arcs.RemoveAt(i);
                DataChanged = true;
                return;
            }
        }

        // 3. Текстовая метка
        for (int i = data.TextLabels.Count - 1; i >= 0; i--)
        {
            var lbl = data.TextLabels[i];
            if (RenderUtils.IsPointInTextLabel(lbl, gridPos))
            {
                data.TextLabels.RemoveAt(i);
                DataChanged = true;
                return;
            }
        }

        // 4. Линейка
        for (int i = data.Rulers.Count - 1; i >= 0; i--)
        {
            var r = data.Rulers[i];
            if (IsOnRuler(r, gridPos))
            {
                data.Rulers.RemoveAt(i);
                DataChanged = true;
                return;
            }
        }
    }

    public void OnDrag(Point gridPos, ProjectData data, Color activeColor)
    {
        if (data.BlockMap.ContainsKey(gridPos))
        {
            data.BlockMap.Remove(gridPos);
            DataChanged = true;
        }
    }

    public void OnRelease(Point gridPos, ProjectData data, Color activeColor) { }

    public void OnHover(Point gridPos, ProjectData data)
    {
        _hoveredType = HitType.None;
        _hoveredText = null;
        _hoveredArc = null;

        if (data.BlockMap.ContainsKey(gridPos))
        {
            _hoveredType = HitType.Block;
            _hoveredBlock = gridPos;
            return;
        }

        foreach (var arc in data.Arcs)
        {
            if (RenderUtils.IsPointNearArcCurve(arc, gridPos))
            {
                _hoveredType = HitType.Arc;
                _hoveredArc = arc;
                return;
            }
        }

        foreach (var lbl in data.TextLabels)
        {
            if (RenderUtils.IsPointInTextLabel(lbl, gridPos))
            {
                _hoveredType = HitType.Text;
                _hoveredText = lbl;
                return;
            }
        }

        for (int i = 0; i < data.Rulers.Count; i++)
        {
            if (IsOnRuler(data.Rulers[i], gridPos))
            {
                _hoveredType = HitType.Ruler;
                return;
            }
        }
    }

    public void RenderPreview(Graphics g, Camera camera)
    {
        if (_hoveredType == HitType.None)
            return;

        using var brush = new SolidBrush(Color.FromArgb(100, 255, 0, 0));
        using var pen = new Pen(Color.Red, 2f);

        if (_hoveredType == HitType.Block)
        {
            var sp = camera.GridToScreen(_hoveredBlock.X, _hoveredBlock.Y);
            g.FillRectangle(brush, sp.X, sp.Y, camera.CellSize, camera.CellSize);
        }
        else if (_hoveredType == HitType.Arc && _hoveredArc != null)
        {
            var p0 = new Point(_hoveredArc.StartX, _hoveredArc.StartY);
            var p1 = new Point(_hoveredArc.EndX, _hoveredArc.EndY);
            var p2 = new Point(_hoveredArc.ControlX, _hoveredArc.ControlY);

            foreach (var pt in RenderUtils.GetBezierCurve(p0, p2, p1))
            {
                var sp = camera.GridToScreen(pt.X, pt.Y);
                g.FillRectangle(brush, sp.X, sp.Y, camera.CellSize, camera.CellSize);
            }

            var ctrlSp = camera.GridToScreen(_hoveredArc.ControlX, _hoveredArc.ControlY);
            float cx = ctrlSp.X + camera.CellSize / 2f;
            float cy = ctrlSp.Y + camera.CellSize / 2f;
            g.FillEllipse(Brushes.Red, cx - 6, cy - 6, 12, 12);
        }
        else if (_hoveredType == HitType.Text && _hoveredText != null)
        {
            var bounds = RenderUtils.GetTextGridBounds(_hoveredText, camera.CellSize);
            var sp = camera.GridToScreen(bounds.X, bounds.Y);
            float w = bounds.Width * camera.CellSize;
            float h = bounds.Height * camera.CellSize;

            g.FillRectangle(brush, sp.X, sp.Y, w, h);
            g.DrawRectangle(pen, sp.X, sp.Y, w, h);
        }
    }

    private static bool IsOnRuler(RulerLine r, Point p)
    {
        if (r.StartY == r.EndY && p.Y == r.StartY)
        {
            int minX = Math.Min(r.StartX, r.EndX);
            int maxX = Math.Max(r.StartX, r.EndX);
            return p.X >= minX && p.X <= maxX;
        }
        if (r.StartX == r.EndX && p.X == r.StartX)
        {
            int minY = Math.Min(r.StartY, r.EndY);
            int maxY = Math.Max(r.StartY, r.EndY);
            return p.Y >= minY && p.Y <= maxY;
        }
        return false;
    }
}
