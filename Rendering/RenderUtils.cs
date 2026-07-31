using MCBp.Data;

namespace MCBp.Rendering;

public static class RenderUtils
{
    public static IEnumerable<Point> Bresenham(Point a, Point b)
    {
        int x0 = a.X, y0 = a.Y;
        int x1 = b.X, y1 = b.Y;

        int dx = Math.Abs(x1 - x0);
        int dy = Math.Abs(y1 - y0);
        int sx = x0 < x1 ? 1 : -1;
        int sy = y0 < y1 ? 1 : -1;
        int err = dx - dy;

        while (true)
        {
            yield return new Point(x0, y0);

            if (x0 == x1 && y0 == y1)
                break;

            int e2 = 2 * err;
            if (e2 > -dy)
            {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx)
            {
                err += dx;
                y0 += sy;
            }
        }
    }

    public static IEnumerable<Point> GetRectangle(Point a, Point b)
    {
        int minX = Math.Min(a.X, b.X);
        int maxX = Math.Max(a.X, b.X);
        int minY = Math.Min(a.Y, b.Y);
        int maxY = Math.Max(a.Y, b.Y);

        var points = new HashSet<Point>();

        for (int x = minX; x <= maxX; x++)
        {
            points.Add(new Point(x, minY));
            points.Add(new Point(x, maxY));
        }
        for (int y = minY; y <= maxY; y++)
        {
            points.Add(new Point(minX, y));
            points.Add(new Point(maxX, y));
        }

        return points;
    }

    public static IEnumerable<Point> GetCircle(Point center, int radius)
    {
        var points = new HashSet<Point>();
        if (radius <= 0)
        {
            points.Add(center);
            return points;
        }

        int x = radius;
        int y = 0;
        int err = 0;

        while (x >= y)
        {
            AddOctantPoints(points, center, x, y);

            y++;
            err += 1 + 2 * y;
            if (2 * (err - x) + 1 > 0)
            {
                x--;
                err += 1 - 2 * x;
            }
        }

        return points;
    }

    private static void AddOctantPoints(HashSet<Point> points, Point center, int x, int y)
    {
        points.Add(new Point(center.X + x, center.Y + y));
        points.Add(new Point(center.X + y, center.Y + x));
        points.Add(new Point(center.X - y, center.Y + x));
        points.Add(new Point(center.X - x, center.Y + y));
        points.Add(new Point(center.X - x, center.Y - y));
        points.Add(new Point(center.X - y, center.Y - x));
        points.Add(new Point(center.X + y, center.Y - x));
        points.Add(new Point(center.X + x, center.Y - y));
    }

    public static IEnumerable<Point> GetBezierCurve(Point p0, Point p1, Point p2)
    {
        var points = new HashSet<Point>();
        double dist = Distance(p0, p1) + Distance(p1, p2);
        int steps = Math.Max(10, (int)(dist * 2));

        for (int i = 0; i <= steps; i++)
        {
            double t = (double)i / steps;
            double u = 1.0 - t;

            int x = (int)Math.Round(u * u * p0.X + 2 * u * t * p1.X + t * t * p2.X);
            int y = (int)Math.Round(u * u * p0.Y + 2 * u * t * p1.Y + t * t * p2.Y);

            points.Add(new Point(x, y));
        }

        return points;
    }

    public static Rectangle GetTextGridBounds(TextLabel label, int cellSize = 16)
    {
        if (string.IsNullOrEmpty(label.Text))
            return new Rectangle(label.GridX, label.GridY, 1, 1);

        float approxWidthPx = label.Text.Length * (label.FontSize * 0.7f);
        float approxHeightPx = label.FontSize * 1.3f;

        int widthInGrid = Math.Max(1, (int)Math.Ceiling(approxWidthPx / Math.Max(1, cellSize)));
        int heightInGrid = Math.Max(1, (int)Math.Ceiling(approxHeightPx / Math.Max(1, cellSize)));

        return new Rectangle(label.GridX, label.GridY, widthInGrid, heightInGrid);
    }

    public static bool IsPointInTextLabel(TextLabel label, Point gridPos, int cellSize = 16)
    {
        var bounds = GetTextGridBounds(label, cellSize);
        return bounds.Contains(gridPos);
    }

    public static bool IsPointNearArcCurve(ArcCurve arc, Point gridPos)
    {
        if (Math.Abs(arc.ControlX - gridPos.X) <= 1 && Math.Abs(arc.ControlY - gridPos.Y) <= 1)
            return true;

        var p0 = new Point(arc.StartX, arc.StartY);
        var p1 = new Point(arc.EndX, arc.EndY);
        var p2 = new Point(arc.ControlX, arc.ControlY);

        foreach (var pt in GetBezierCurve(p0, p2, p1))
        {
            if (Math.Abs(pt.X - gridPos.X) <= 1 && Math.Abs(pt.Y - gridPos.Y) <= 1)
                return true;
        }

        return false;
    }

    public static double Distance(Point a, Point b)
        => Math.Sqrt(Math.Pow(b.X - a.X, 2) + Math.Pow(b.Y - a.Y, 2));
}
