namespace MCBp.Canvas;

public class Camera
{
    public float OffsetX;
    public float OffsetY;
    public int CellSize = 16;

    public const int MinCellSize = 2;
    public const int MaxCellSize = 64;

    public const int MinY = -159;
    public const int MaxY = 159;

    public Point ScreenToGrid(Point screen)
    {
        int gx = (int)Math.Floor((screen.X - OffsetX) / CellSize);
        int gy = (int)Math.Floor((screen.Y - OffsetY) / CellSize);
        return new Point(gx, gy);
    }

    public PointF GridToScreen(int gx, int gy)
    {
        return new PointF(
            gx * CellSize + OffsetX,
            gy * CellSize + OffsetY);
    }

    public Rectangle GetVisibleGridRect(Size clientSize)
    {
        int left = (int)Math.Floor(-OffsetX / CellSize) - 1;
        int top = (int)Math.Floor(-OffsetY / CellSize) - 1;
        int right = (int)Math.Ceiling((clientSize.Width - OffsetX) / CellSize) + 1;
        int bottom = (int)Math.Ceiling((clientSize.Height - OffsetY) / CellSize) + 1;

        return new Rectangle(left, top, right - left, bottom - top);
    }

    public void ZoomAt(Point cursor, int delta)
    {
        float gridXBefore = (cursor.X - OffsetX) / CellSize;
        float gridYBefore = (cursor.Y - OffsetY) / CellSize;

        int step = delta > 0 ? 1 : -1;
        if (CellSize < 8)
            CellSize += step;
        else if (CellSize < 16)
            CellSize += step * 2;
        else
            CellSize += step * 4;

        CellSize = Math.Clamp(CellSize, MinCellSize, MaxCellSize);

        OffsetX = cursor.X - gridXBefore * CellSize;
        OffsetY = cursor.Y - gridYBefore * CellSize;
    }

    public void CenterOn(Size clientSize, int gridX = 0, int gridY = 0)
    {
        OffsetX = clientSize.Width / 2f - gridX * CellSize;
        OffsetY = clientSize.Height / 2f - gridY * CellSize;
    }
}
