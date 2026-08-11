using MCBp.Canvas;
using MCBp.Data;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Линейка" — замер расстояния строго по горизонтали или вертикали.
/// </summary>
public class RulerTool : ITool
{
    private Point? _startPos;
    private Point _currentPos;
    private bool _isDragging;

    public bool DataChanged { get; private set; }

    public void OnPress(Point gridPos, ProjectData data, Color activeColor, Font activeFont)
    {
        _startPos = gridPos;
        _currentPos = gridPos;
        _isDragging = true;
        DataChanged = false;
    }

    public void OnDrag(Point gridPos, ProjectData data, Color activeColor)
    {
        if (!_startPos.HasValue) return;
        _currentPos = SnapToAxis(_startPos.Value, gridPos);
    }

    public void OnRelease(Point gridPos, ProjectData data, Color activeColor)
    {
        if (_startPos.HasValue)
        {
            var endPos = SnapToAxis(_startPos.Value, gridPos);
            if (endPos != _startPos.Value)
            {
                data.Rulers.Add(new RulerLine
                {
                    StartX = _startPos.Value.X,
                    StartY = _startPos.Value.Y,
                    EndX = endPos.X,
                    EndY = endPos.Y
                });
                DataChanged = true;
            }
        }
        _startPos = null;
        _isDragging = false;
    }

    public void OnHover(Point gridPos, ProjectData data) { }

    public void RenderPreview(Graphics g, Camera camera)
    {
        if (!_isDragging || !_startPos.HasValue)
            return;

        var snapped = _currentPos;
        var sp1 = camera.GridToScreen(_startPos.Value.X, _startPos.Value.Y);
        var sp2 = camera.GridToScreen(snapped.X, snapped.Y);

        // Центры ячеек
        float cx1 = sp1.X + camera.CellSize / 2f;
        float cy1 = sp1.Y + camera.CellSize / 2f;
        float cx2 = sp2.X + camera.CellSize / 2f;
        float cy2 = sp2.Y + camera.CellSize / 2f;

        using var pen = new Pen(Color.FromArgb(200, 255, 200, 0), 2f)
        {
            DashStyle = System.Drawing.Drawing2D.DashStyle.Dash
        };
        g.DrawLine(pen, cx1, cy1, cx2, cy2);

        // Расстояние
        int dist = Math.Abs(snapped.X - _startPos.Value.X) + Math.Abs(snapped.Y - _startPos.Value.Y) + 1;
        string label = $"{dist} блоков";
        using var font = new Font("Segoe UI", 9f, FontStyle.Bold);
        var textSize = g.MeasureString(label, font);
        float tx = (cx1 + cx2) / 2 - textSize.Width / 2;
        float ty = Math.Max(cy1, cy2) + 4;

        using var bgBrush = new SolidBrush(Color.FromArgb(200, 255, 255, 230));
        g.FillRectangle(bgBrush, tx - 2, ty - 1, textSize.Width + 4, textSize.Height + 2);
        g.DrawString(label, font, Brushes.Black, tx, ty);
    }

    /// <summary>
    /// Привязка конечной точки строго к горизонтали или вертикали.
    /// </summary>
    private static Point SnapToAxis(Point start, Point current)
    {
        int dx = Math.Abs(current.X - start.X);
        int dy = Math.Abs(current.Y - start.Y);

        if (dx >= dy)
            return new Point(current.X, start.Y); // горизонталь
        else
            return new Point(start.X, current.Y); // вертикаль
    }
}
