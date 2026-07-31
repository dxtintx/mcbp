using MCBp.Canvas;
using MCBp.Data;
using MCBp.Rendering;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Круг" — попиксельное рисование окружности из блоков по алгоритму Midpoint Circle.
/// </summary>
public class CircleTool : ITool
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
        _currentPos = gridPos;
    }

    public void OnRelease(Point gridPos, ProjectData data, Color activeColor)
    {
        if (_startPos.HasValue)
        {
            int radius = (int)Math.Round(RenderUtils.Distance(_startPos.Value, gridPos));
            foreach (var pt in RenderUtils.GetCircle(_startPos.Value, radius))
            {
                if (pt.Y >= Camera.MinY && pt.Y <= Camera.MaxY)
                    data.BlockMap[pt] = activeColor;
            }
            DataChanged = true;
        }
        _startPos = null;
        _isDragging = false;
    }

    public void OnHover(Point gridPos, ProjectData data) { }

    public void RenderPreview(Graphics g, Camera camera)
    {
        if (!_isDragging || !_startPos.HasValue)
            return;

        int radius = (int)Math.Round(RenderUtils.Distance(_startPos.Value, _currentPos));
        using var brush = new SolidBrush(Color.FromArgb(100, 0, 120, 255));
        foreach (var pt in RenderUtils.GetCircle(_startPos.Value, radius))
        {
            var sp = camera.GridToScreen(pt.X, pt.Y);
            g.FillRectangle(brush, sp.X, sp.Y, camera.CellSize, camera.CellSize);
        }

        // Радиусная пунктирная линия от центра
        var centerSp = camera.GridToScreen(_startPos.Value.X, _startPos.Value.Y);
        var currSp = camera.GridToScreen(_currentPos.X, _currentPos.Y);
        using var radiusPen = new Pen(Color.FromArgb(150, 0, 120, 255), 1.5f)
        {
            DashStyle = System.Drawing.Drawing2D.DashStyle.Dash
        };
        g.DrawLine(radiusPen,
            centerSp.X + camera.CellSize / 2f, centerSp.Y + camera.CellSize / 2f,
            currSp.X + camera.CellSize / 2f, currSp.Y + camera.CellSize / 2f);
    }
}
