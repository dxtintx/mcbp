using MCBp.Data;
using MCBp.Localization;
using MCBp.Rendering;
using MCBp.Tools;

namespace MCBp.Canvas;

public partial class MapCanvas : Control
{
    public Camera Camera { get; } = new();
    public ProjectData Data { get; set; } = new();
    public ITool? ActiveTool { get; set; }
    public Color ActiveColor { get; set; } = Color.Black;
    public Font ActiveFont { get; set; } = new Font("Segoe UI", 12f);
    public bool ShowGrid { get; set; } = true;
    public bool ShowChunks { get; set; } = true;

    public Point CursorGridPos { get; private set; }

    public event Action? CursorMoved;
    public event Action? DataModified;

    public UndoRedoManager UndoRedo { get; } = new();

    public void PerformUndo()
    {
        var prev = UndoRedo.Undo(Data);
        if (prev != null)
        {
            Data = prev;
            DataModified?.Invoke();
            Invalidate();
        }
    }

    public void PerformRedo()
    {
        var next = UndoRedo.Redo(Data);
        if (next != null)
        {
            Data = next;
            DataModified?.Invoke();
            Invalidate();
        }
    }

    private static readonly Color BgColor = Color.White;

    public MapCanvas()
    {
        SetStyle(
            ControlStyles.OptimizedDoubleBuffer |
            ControlStyles.AllPaintingInWmPaint |
            ControlStyles.UserPaint |
            ControlStyles.ResizeRedraw,
            true);

        BackColor = BgColor;
    }

    public void CenterCamera()
    {
        Camera.CenterOn(ClientSize);
        Invalidate();
    }

    public int BlockCount => Data.BlockMap.Count;

    public Size GetProjectBoundsSize()
    {
        if (Data.BlockMap.Count == 0)
            return Size.Empty;

        int minX = int.MaxValue, maxX = int.MinValue;
        int minY = int.MaxValue, maxY = int.MinValue;

        foreach (var pt in Data.BlockMap.Keys)
        {
            if (pt.X < minX) minX = pt.X;
            if (pt.X > maxX) maxX = pt.X;
            if (pt.Y < minY) minY = pt.Y;
            if (pt.Y > maxY) maxY = pt.Y;
        }

        return new Size(maxX - minX + 1, maxY - minY + 1);
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighSpeed;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        g.Clear(BgColor);

        if (ShowGrid)
            GridRenderer.Draw(g, Camera, ClientSize, ShowChunks);

        var visRect = Camera.GetVisibleGridRect(ClientSize);
        int cs = Camera.CellSize;

        foreach (var kv in Data.BlockMap)
        {
            var pt = kv.Key;
            if (pt.X < visRect.Left || pt.X > visRect.Right ||
                pt.Y < visRect.Top || pt.Y > visRect.Bottom)
                continue;

            var sp = Camera.GridToScreen(pt.X, pt.Y);
            using var brush = new SolidBrush(kv.Value);
            g.FillRectangle(brush, sp.X, sp.Y, cs, cs);
        }

        foreach (var ruler in Data.Rulers)
        {
            DrawRuler(g, ruler);
        }

        foreach (var arc in Data.Arcs)
        {
            DrawArcCurve(g, arc);
        }

        foreach (var lbl in Data.TextLabels)
        {
            DrawTextLabel(g, lbl);
        }

        ActiveTool?.RenderPreview(g, Camera);
    }

    private void DrawRuler(Graphics g, RulerLine ruler)
    {
        var sp1 = Camera.GridToScreen(ruler.StartX, ruler.StartY);
        var sp2 = Camera.GridToScreen(ruler.EndX, ruler.EndY);
        int cs = Camera.CellSize;

        float cx1 = sp1.X + cs / 2f;
        float cy1 = sp1.Y + cs / 2f;
        float cx2 = sp2.X + cs / 2f;
        float cy2 = sp2.Y + cs / 2f;

        using var pen = new Pen(Color.FromArgb(200, 0, 0, 0), 2f)
        {
            DashStyle = System.Drawing.Drawing2D.DashStyle.Dash
        };
        g.DrawLine(pen, cx1, cy1, cx2, cy2);

        using var markerBrush = new SolidBrush(Color.FromArgb(200, 0, 0, 0));
        g.FillEllipse(markerBrush, cx1 - 3, cy1 - 3, 6, 6);
        g.FillEllipse(markerBrush, cx2 - 3, cy2 - 3, 6, 6);

        string label = $"{ruler.Distance} м.";
        using var font = new Font("Segoe UI", 9f, FontStyle.Bold);
        var textSize = g.MeasureString(label, font);

        float midX = (cx1 + cx2) / 2f;
        float midY = (cy1 + cy2) / 2f;
        float tx = midX - textSize.Width / 2f;
        float ty = midY - textSize.Height / 2f;

        using var bgBrush = new SolidBrush(Color.FromArgb(240, 255, 255, 255));
        g.FillRectangle(bgBrush, tx - 3, ty - 1, textSize.Width + 6, textSize.Height + 2);
        using var borderPen = new Pen(Color.FromArgb(150, 0, 0, 0));
        g.DrawRectangle(borderPen, tx - 3, ty - 1, textSize.Width + 6, textSize.Height + 2);
        g.DrawString(label, font, Brushes.Black, tx, ty);
    }

    private void DrawTextLabel(Graphics g, TextLabel lbl)
    {
        var sp = Camera.GridToScreen(lbl.GridX, lbl.GridY);
        using var font = new Font(lbl.FontFamily, lbl.FontSize, (FontStyle)lbl.FontStyle);
        using var brush = new SolidBrush(Color.FromArgb(lbl.ColorArgb));

        var textSize = g.MeasureString(lbl.Text, font);
        using var bgBrush = new SolidBrush(Color.FromArgb(180, 255, 255, 255));
        g.FillRectangle(bgBrush, sp.X, sp.Y, textSize.Width, textSize.Height);

        g.DrawString(lbl.Text, font, brush, sp.X, sp.Y);
    }

    private void DrawArcCurve(Graphics g, ArcCurve arc)
    {
        var p0 = new Point(arc.StartX, arc.StartY);
        var p1 = new Point(arc.EndX, arc.EndY);
        var p2 = new Point(arc.ControlX, arc.ControlY);
        int cs = Camera.CellSize;

        using var blockBrush = new SolidBrush(Color.FromArgb(arc.ColorArgb));
        foreach (var pt in RenderUtils.GetBezierCurve(p0, p2, p1))
        {
            var sp = Camera.GridToScreen(pt.X, pt.Y);
            g.FillRectangle(blockBrush, sp.X, sp.Y, cs, cs);
        }

        var sp0 = Camera.GridToScreen(arc.StartX, arc.StartY);
        var sp1 = Camera.GridToScreen(arc.EndX, arc.EndY);
        var sp2 = Camera.GridToScreen(arc.ControlX, arc.ControlY);

        float cx0 = sp0.X + cs / 2f, cy0 = sp0.Y + cs / 2f;
        float cx1 = sp1.X + cs / 2f, cy1 = sp1.Y + cs / 2f;
        float cx2 = sp2.X + cs / 2f, cy2 = sp2.Y + cs / 2f;

        using var guidePen = new Pen(Color.FromArgb(160, 150, 150, 150), 1.2f)
        {
            DashStyle = System.Drawing.Drawing2D.DashStyle.Dash
        };
        g.DrawLine(guidePen, cx0, cy0, cx2, cy2);
        g.DrawLine(guidePen, cx1, cy1, cx2, cy2);

        using var endDotBrush = new SolidBrush(Color.FromArgb(180, 120, 120, 120));
        g.FillEllipse(endDotBrush, cx0 - 3, cy0 - 3, 6, 6);
        g.FillEllipse(endDotBrush, cx1 - 3, cy1 - 3, 6, 6);

        using var greyCtrlBrush = new SolidBrush(Color.FromArgb(220, 130, 130, 130));
        using var greyBorderPen = new Pen(Color.FromArgb(240, 70, 70, 70), 1.5f);
        g.FillEllipse(greyCtrlBrush, cx2 - 6, cy2 - 6, 12, 12);
        g.DrawEllipse(greyBorderPen, cx2 - 6, cy2 - 6, 12, 12);
    }
}
