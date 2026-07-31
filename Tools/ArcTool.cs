using System.Drawing.Drawing2D;
using MCBp.Canvas;
using MCBp.Data;
using MCBp.Rendering;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Дуга" — построение кривой Безье с выбором концов и перетаскиванием серой контрольной точки изгиба.
/// </summary>
public class ArcTool : ITool
{
    private enum ArcState { Idle, SettingEnd, PullingControl }

    private ArcState _state = ArcState.Idle;
    private Point _p0; // Начало
    private Point _p1; // Конец
    private Point _p2; // Контрольная точка изгиба

    public bool DataChanged { get; private set; }

    public void OnPress(Point gridPos, ProjectData data, Color activeColor, Font activeFont)
    {
        DataChanged = false;

        if (_state == ArcState.Idle)
        {
            _p0 = gridPos;
            _p1 = gridPos;
            _p2 = gridPos;
            _state = ArcState.SettingEnd;
        }
        else if (_state == ArcState.PullingControl)
        {
            _p2 = gridPos;
            BakeArc(data, activeColor);
            _state = ArcState.Idle;
        }
    }

    public void OnDrag(Point gridPos, ProjectData data, Color activeColor)
    {
        if (_state == ArcState.SettingEnd)
        {
            _p1 = gridPos;
            _p2 = new Point((_p0.X + _p1.X) / 2, (_p0.Y + _p1.Y) / 2);
        }
        else if (_state == ArcState.PullingControl)
        {
            _p2 = gridPos;
        }
    }

    public void OnRelease(Point gridPos, ProjectData data, Color activeColor)
    {
        if (_state == ArcState.SettingEnd)
        {
            if (_p0 != _p1)
            {
                _state = ArcState.PullingControl;
                _p2 = gridPos;
            }
            else
            {
                _state = ArcState.Idle;
            }
        }
    }

    public void OnHover(Point gridPos, ProjectData data)
    {
        if (_state == ArcState.PullingControl)
        {
            _p2 = gridPos;
        }
    }

    public void RenderPreview(Graphics g, Camera camera)
    {
        if (_state == ArcState.Idle)
            return;

        using var brush = new SolidBrush(Color.FromArgb(120, 0, 120, 255));
        var curvePoints = RenderUtils.GetBezierCurve(_p0, _p2, _p1);

        foreach (var pt in curvePoints)
        {
            var sp = camera.GridToScreen(pt.X, pt.Y);
            g.FillRectangle(brush, sp.X, sp.Y, camera.CellSize, camera.CellSize);
        }

        if (_state == ArcState.PullingControl)
        {
            var sp0 = camera.GridToScreen(_p0.X, _p0.Y);
            var sp1 = camera.GridToScreen(_p1.X, _p1.Y);
            var sp2 = camera.GridToScreen(_p2.X, _p2.Y);

            int cs = camera.CellSize;
            float cx0 = sp0.X + cs / 2f, cy0 = sp0.Y + cs / 2f;
            float cx1 = sp1.X + cs / 2f, cy1 = sp1.Y + cs / 2f;
            float cx2 = sp2.X + cs / 2f, cy2 = sp2.Y + cs / 2f;

            using var guidePen = new Pen(Color.FromArgb(180, 255, 140, 0), 1.5f)
            {
                DashStyle = DashStyle.Dash
            };
            g.DrawLine(guidePen, cx0, cy0, cx2, cy2);
            g.DrawLine(guidePen, cx1, cy1, cx2, cy2);

            // Отрисовка серого контрольного курсора изгиба
            using var ctrlBrush = new SolidBrush(Color.FromArgb(200, 140, 140, 140));
            g.FillEllipse(ctrlBrush, cx2 - 6, cy2 - 6, 12, 12);
            g.DrawEllipse(Pens.Gray, cx2 - 6, cy2 - 6, 12, 12);
        }
    }

    private void BakeArc(ProjectData data, Color color)
    {
        data.Arcs.Add(new ArcCurve
        {
            StartX = _p0.X,
            StartY = _p0.Y,
            EndX = _p1.X,
            EndY = _p1.Y,
            ControlX = _p2.X,
            ControlY = _p2.Y,
            ColorArgb = color.ToArgb()
        });
        DataChanged = true;
    }
}
