using System.Drawing.Drawing2D;
using MCBp.Tools;

namespace MCBp.Rendering;

/// <summary>
/// Генератор векторных иконок 20x20 для панелей инструментов.
/// </summary>
public static class IconFactory
{
    public static Bitmap CreateToolIcon(ToolType type) => type switch
    {
        ToolType.Pointer => CreatePointerIcon(),
        ToolType.Brush => CreateBrushIcon(),
        ToolType.Line => CreateLineIcon(),
        ToolType.Rectangle => CreateRectangleIcon(),
        ToolType.Circle => CreateCircleIcon(),
        ToolType.Arc => CreateArcIcon(),
        ToolType.Text => CreateTextIcon(),
        ToolType.Ruler => CreateRulerIcon(),
        ToolType.Eraser => CreateEraserIcon(),
        _ => CreatePointerIcon()
    };

    public static Bitmap CreateRectangleIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var pen = new Pen(Color.FromArgb(30, 100, 200), 2f);
        g.DrawRectangle(pen, 3, 4, 14, 12);
        return bmp;
    }

    public static Bitmap CreateCircleIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var pen = new Pen(Color.FromArgb(30, 100, 200), 2f);
        g.DrawEllipse(pen, 3, 3, 14, 14);
        return bmp;
    }

    public static Bitmap CreateArcIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var pen = new Pen(Color.FromArgb(30, 100, 200), 2f);
        g.DrawArc(pen, 3, 3, 14, 14, 200, 140);

        using var dotBrush = new SolidBrush(Color.FromArgb(230, 255, 100, 0));
        g.FillEllipse(dotBrush, 9, 2, 4, 4);

        return bmp;
    }

    public static Bitmap CreatePointerIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        // Стрелка-указатель (мышонка) с червонной лазерной точкой
        PointF[] arrow = {
            new(3, 3), new(3, 16), new(7, 12), new(10, 17), new(12, 16), new(9, 11), new(14, 11)
        };
        using var fillBrush = new SolidBrush(Color.FromArgb(40, 40, 40));
        using var borderPen = new Pen(Color.Black, 1f);
        g.FillPolygon(fillBrush, arrow);
        g.DrawPolygon(borderPen, arrow);

        // Лазерная волнистая линия / точка
        using var redPen = new Pen(Color.FromArgb(230, 40, 40), 1.5f);
        g.DrawArc(redPen, 11, 4, 6, 6, 200, 260);

        return bmp;
    }

    public static Bitmap CreateBrushIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        // Ручка кисти
        using var handlePen = new Pen(Color.FromArgb(139, 69, 19), 3f);
        g.DrawLine(handlePen, 4, 16, 11, 9);

        // Металлическая обойма
        using var metalPen = new Pen(Color.DarkGray, 3.5f);
        g.DrawLine(metalPen, 11, 9, 13, 7);

        // Ворс кисти с краской
        PointF[] tip = { new(13, 7), new(17, 3), new(15, 2), new(12, 5) };
        using var paintBrush = new SolidBrush(Color.FromArgb(30, 120, 220));
        g.FillPolygon(paintBrush, tip);

        return bmp;
    }

    public static Bitmap CreateLineIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var linePen = new Pen(Color.FromArgb(30, 100, 200), 2f);
        g.DrawLine(linePen, 3, 17, 17, 3);

        // Засечки на концах
        using var dotBrush = new SolidBrush(Color.FromArgb(40, 40, 40));
        g.FillEllipse(dotBrush, 2, 16, 3, 3);
        g.FillEllipse(dotBrush, 15, 2, 3, 3);

        return bmp;
    }

    public static Bitmap CreateTextIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var font = new Font("Segoe UI", 12f, FontStyle.Bold);
        using var brush = new SolidBrush(Color.FromArgb(40, 40, 50));
        g.DrawString("A", font, brush, 3, 0);

        using var barPen = new Pen(Color.FromArgb(70, 130, 220), 2f);
        g.DrawLine(barPen, 3, 17, 17, 17);

        return bmp;
    }

    public static Bitmap CreateRulerIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        // Грани линейки
        PointF[] body = { new(3, 14), new(14, 3), new(17, 6), new(6, 17) };
        using var rulerBrush = new SolidBrush(Color.FromArgb(240, 220, 130));
        using var rulerPen = new Pen(Color.FromArgb(160, 140, 60), 1f);
        g.FillPolygon(rulerBrush, body);
        g.DrawPolygon(rulerPen, body);

        // Деления (засечки)
        using var markPen = new Pen(Color.FromArgb(100, 80, 20), 1f);
        g.DrawLine(markPen, 6, 11, 8, 13);
        g.DrawLine(markPen, 8, 9, 11, 12);
        g.DrawLine(markPen, 11, 6, 13, 8);

        return bmp;
    }

    public static Bitmap CreateEraserIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        // Блок ластика
        PointF[] pinkPart = { new(5, 12), new(11, 6), new(15, 10), new(9, 16) };
        using var pinkBrush = new SolidBrush(Color.FromArgb(240, 130, 160));
        using var borderPen = new Pen(Color.FromArgb(100, 100, 100), 1f);
        g.FillPolygon(pinkBrush, pinkPart);
        g.DrawPolygon(borderPen, pinkPart);

        // Синяя часть ластика
        PointF[] bluePart = { new(5, 12), new(2, 9), new(6, 5), new(11, 6) };
        using var blueBrush = new SolidBrush(Color.FromArgb(100, 140, 220));
        g.FillPolygon(blueBrush, bluePart);
        g.DrawPolygon(borderPen, bluePart);

        return bmp;
    }

    public static Bitmap CreateColorPaletteIcon(Color color)
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var fillBrush = new SolidBrush(color);
        using var borderPen = new Pen(Color.FromArgb(100, 100, 100), 1.5f);

        g.FillRectangle(fillBrush, 3, 3, 14, 14);
        g.DrawRectangle(borderPen, 3, 3, 14, 14);

        return bmp;
    }

    public static Bitmap CreateFontIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var font1 = new Font("Times New Roman", 10f, FontStyle.Bold);
        using var brush1 = new SolidBrush(Color.FromArgb(50, 50, 60));
        g.DrawString("F", font1, brush1, 1, 2);

        using var font2 = new Font("Segoe UI", 8f, FontStyle.Regular);
        using var brush2 = new SolidBrush(Color.FromArgb(70, 130, 220));
        g.DrawString("f", font2, brush2, 11, 8);

        return bmp;
    }

    public static Bitmap CreateGridIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var pen = new Pen(Color.FromArgb(100, 100, 110), 1f);
        g.DrawRectangle(pen, 3, 3, 14, 14);
        g.DrawLine(pen, 7, 3, 7, 17);
        g.DrawLine(pen, 12, 3, 12, 17);
        g.DrawLine(pen, 3, 7, 17, 7);
        g.DrawLine(pen, 3, 12, 17, 12);

        return bmp;
    }

    public static Bitmap CreateUndoIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var pen = new Pen(Color.FromArgb(60, 60, 70), 2f);
        pen.CustomEndCap = new AdjustableArrowCap(3, 4);
        g.DrawArc(pen, 4, 4, 12, 12, 0, -180);

        return bmp;
    }

    public static Bitmap CreateRedoIcon()
    {
        var bmp = new Bitmap(20, 20);
        using var g = Graphics.FromImage(bmp);
        SetupGraphics(g);

        using var pen = new Pen(Color.FromArgb(60, 60, 70), 2f);
        pen.CustomEndCap = new AdjustableArrowCap(3, 4);
        g.DrawArc(pen, 4, 4, 12, 12, 180, -180);

        return bmp;
    }

    private static void SetupGraphics(Graphics g)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;
    }
}
