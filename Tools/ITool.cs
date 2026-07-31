using MCBp.Canvas;
using MCBp.Data;

namespace MCBp.Tools;

public interface ITool
{
    void OnPress(Point gridPos, ProjectData data, Color activeColor, Font activeFont);
    void OnDrag(Point gridPos, ProjectData data, Color activeColor);
    void OnRelease(Point gridPos, ProjectData data, Color activeColor);
    void OnHover(Point gridPos, ProjectData data);
    void RenderPreview(Graphics g, Camera camera);
    bool DataChanged { get; }
}
