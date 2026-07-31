using System.Drawing.Drawing2D;
using MCBp.Canvas;
using MCBp.Data;
using MCBp.Rendering;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Указатель/Курсор" — перетаскивание текста и серого курсора изгиба дуг по сетке,
/// а при клике по пустому месту — временная векторная линия 2px.
/// </summary>
public class PointerTool : ITool
{
    private readonly List<PointF> _screenPoints = new();
    private bool _isMouseDown;

    private TextLabel? _draggedText;
    private Point _dragTextOffset;

    private ArcCurve? _draggedArc;
    private Point _dragArcOffset;

    public bool DataChanged { get; private set; }

    public void OnPress(Point gridPos, ProjectData data, Color activeColor, Font activeFont)
    {
        DataChanged = false;
        _isMouseDown = true;
        _draggedText = null;
        _draggedArc = null;

        // 1. Проверяем, не кликнули ли по серому контрольному курсору дуги для изменения её изгиба
        for (int i = data.Arcs.Count - 1; i >= 0; i--)
        {
            var arc = data.Arcs[i];
            if (Math.Abs(arc.ControlX - gridPos.X) <= 1 && Math.Abs(arc.ControlY - gridPos.Y) <= 1)
            {
                _draggedArc = arc;
                _dragArcOffset = new Point(arc.ControlX - gridPos.X, arc.ControlY - gridPos.Y);
                return;
            }
        }

        // 2. Проверяем, не кликнули ли по текстовой метке для её перемещения
        for (int i = data.TextLabels.Count - 1; i >= 0; i--)
        {
            var lbl = data.TextLabels[i];
            if (RenderUtils.IsPointInTextLabel(lbl, gridPos))
            {
                _draggedText = lbl;
                _dragTextOffset = new Point(lbl.GridX - gridPos.X, lbl.GridY - gridPos.Y);
                return;
            }
        }

        // 3. Если кликнули по пустому месту — начинаем рисовать временную указку
        _screenPoints.Clear();
    }

    public void OnDrag(Point gridPos, ProjectData data, Color activeColor)
    {
        if (_draggedArc != null)
        {
            int newX = gridPos.X + _dragArcOffset.X;
            int newY = Math.Clamp(gridPos.Y + _dragArcOffset.Y, Camera.MinY, Camera.MaxY);

            if (_draggedArc.ControlX != newX || _draggedArc.ControlY != newY)
            {
                _draggedArc.ControlX = newX;
                _draggedArc.ControlY = newY;
                DataChanged = true;
            }
            return;
        }

        if (_draggedText != null)
        {
            int newX = gridPos.X + _dragTextOffset.X;
            int newY = Math.Clamp(gridPos.Y + _dragTextOffset.Y, Camera.MinY, Camera.MaxY);

            if (_draggedText.GridX != newX || _draggedText.GridY != newY)
            {
                _draggedText.GridX = newX;
                _draggedText.GridY = newY;
                DataChanged = true;
            }
            return;
        }
    }

    public void FeedScreenPoint(Point screenPoint)
    {
        if (_isMouseDown && _draggedText == null && _draggedArc == null)
        {
            if (_screenPoints.Count == 0 ||
                Math.Abs(_screenPoints[^1].X - screenPoint.X) > 1 ||
                Math.Abs(_screenPoints[^1].Y - screenPoint.Y) > 1)
            {
                _screenPoints.Add(screenPoint);
            }
        }
    }

    public void OnRelease(Point gridPos, ProjectData data, Color activeColor)
    {
        _isMouseDown = false;
        _draggedText = null;
        _draggedArc = null;
        _screenPoints.Clear();
    }

    public void OnHover(Point gridPos, ProjectData data) { }

    public void RenderPreview(Graphics g, Camera camera)
    {
        // Подсветка перетаскиваемого серого контрольного пикселя дуги
        if (_draggedArc != null)
        {
            var sp0 = camera.GridToScreen(_draggedArc.StartX, _draggedArc.StartY);
            var sp1 = camera.GridToScreen(_draggedArc.EndX, _draggedArc.EndY);
            var sp2 = camera.GridToScreen(_draggedArc.ControlX, _draggedArc.ControlY);

            int cs = camera.CellSize;
            float cx0 = sp0.X + cs / 2f, cy0 = sp0.Y + cs / 2f;
            float cx1 = sp1.X + cs / 2f, cy1 = sp1.Y + cs / 2f;
            float cx2 = sp2.X + cs / 2f, cy2 = sp2.Y + cs / 2f;

            using var guidePen = new Pen(Color.FromArgb(200, 70, 130, 220), 1.5f)
            {
                DashStyle = DashStyle.Dash
            };
            g.DrawLine(guidePen, cx0, cy0, cx2, cy2);
            g.DrawLine(guidePen, cx1, cy1, cx2, cy2);
            return;
        }

        // Подсветка перетаскиваемого текста
        if (_draggedText != null)
        {
            var bounds = RenderUtils.GetTextGridBounds(_draggedText, camera.CellSize);
            var sp = camera.GridToScreen(bounds.X, bounds.Y);
            float w = bounds.Width * camera.CellSize;
            float h = bounds.Height * camera.CellSize;

            using var pen = new Pen(Color.FromArgb(200, 70, 130, 220), 2f)
            {
                DashStyle = DashStyle.Dash
            };
            g.DrawRectangle(pen, sp.X, sp.Y, w, h);
            return;
        }

        // Временная указка
        if (!_isMouseDown || _screenPoints.Count < 2)
            return;

        var oldSmoothing = g.SmoothingMode;
        g.SmoothingMode = SmoothingMode.AntiAlias;

        using var laserPen = new Pen(Color.FromArgb(230, 220, 40, 40), 2f)
        {
            StartCap = LineCap.Round,
            EndCap = LineCap.Round,
            LineJoin = LineJoin.Round
        };

        g.DrawLines(laserPen, _screenPoints.ToArray());

        g.SmoothingMode = oldSmoothing;
    }
}
