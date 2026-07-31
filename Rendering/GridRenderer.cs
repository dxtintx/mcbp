using MCBp.Canvas;

namespace MCBp.Rendering;

public static class GridRenderer
{
    private static readonly Pen GridPen = new(Color.FromArgb(40, 180, 180, 180), 1f);
    private static readonly Pen ChunkPen = new(Color.FromArgb(80, 120, 120, 120), 1f);
    private static readonly Pen OriginPen = new(Color.FromArgb(150, 80, 80, 80), 1.5f);
    private static readonly Pen BoundaryPen = new(Color.FromArgb(120, 100, 100, 100), 2f);

    public static void Draw(Graphics g, Camera camera, Size clientSize, bool showChunks)
    {
        var visRect = camera.GetVisibleGridRect(clientSize);
        int cs = camera.CellSize;

        if (cs >= 4)
        {
            for (int gx = visRect.Left; gx <= visRect.Right; gx++)
            {
                float sx = gx * cs + camera.OffsetX;
                bool isChunk = showChunks && gx % 16 == 0;
                var pen = isChunk ? ChunkPen : GridPen;
                g.DrawLine(pen, sx, 0, sx, clientSize.Height);
            }

            for (int gy = visRect.Top; gy <= visRect.Bottom; gy++)
            {
                float sy = gy * cs + camera.OffsetY;
                bool isChunk = showChunks && gy % 16 == 0;
                var pen = isChunk ? ChunkPen : GridPen;
                g.DrawLine(pen, 0, sy, clientSize.Width, sy);
            }
        }

        float y0 = camera.OffsetY;
        if (y0 >= 0 && y0 <= clientSize.Height)
            g.DrawLine(OriginPen, 0, y0, clientSize.Width, y0);

        float x0 = camera.OffsetX;
        if (x0 >= 0 && x0 <= clientSize.Width)
            g.DrawLine(OriginPen, x0, 0, x0, clientSize.Height);

        float yMin = Camera.MinY * cs + camera.OffsetY;
        float yMax = (Camera.MaxY + 1) * cs + camera.OffsetY;

        if (yMin >= -2 && yMin <= clientSize.Height + 2)
            g.DrawLine(BoundaryPen, 0, yMin, clientSize.Width, yMin);
        if (yMax >= -2 && yMax <= clientSize.Height + 2)
            g.DrawLine(BoundaryPen, 0, yMax, clientSize.Width, yMax);
    }
}
