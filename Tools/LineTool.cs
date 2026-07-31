using MCBp.Canvas;
using MCBp.Data;
using MCBp.Rendering;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Линия" — рисование прямых линий из блоков (алгоритм Брезенхема).
/// </summary>
public class LineTool : ITool
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
        _currentPos = gridPos;
    }

    public void OnRelease(Point gridPos, ProjectData data, Color activeColor)
    {
        if (_startPos.HasValue)
        {
            foreach (var pt in RenderUtils.Bresenham(_startPos.Value, gridPos))
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

        using var brush = new SolidBrush(Color.FromArgb(100, 0, 120, 255));
        foreach (var pt in RenderUtils.Bresenham(_startPos.Value, _currentPos))
        {
            var sp = camera.GridToScreen(pt.X, pt.Y);
            g.FillRectangle(brush, sp.X, sp.Y, camera.CellSize, camera.CellSize);
        }
    }
}
