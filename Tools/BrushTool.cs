using MCBp.Canvas;
using MCBp.Data;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Кисть" — размещение блоков по клику и при ведении.
/// </summary>
public class BrushTool : ITool
{
    public bool DataChanged { get; private set; }

    public void OnPress(Point gridPos, ProjectData data, Color activeColor, Font activeFont)
    {
        PlaceBlock(gridPos, data, activeColor);
    }

    public void OnDrag(Point gridPos, ProjectData data, Color activeColor)
    {
        PlaceBlock(gridPos, data, activeColor);
    }

    public void OnRelease(Point gridPos, ProjectData data, Color activeColor) { }
    public void OnHover(Point gridPos, ProjectData data) { }
    public void RenderPreview(Graphics g, Camera camera) { }

    private void PlaceBlock(Point gridPos, ProjectData data, Color color)
    {
        // Ограничение по высоте карты
        if (gridPos.Y < Camera.MinY || gridPos.Y > Camera.MaxY)
            return;

        data.BlockMap[gridPos] = color;
        DataChanged = true;
    }
}
