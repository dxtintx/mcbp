using MCBp.Canvas;
using MCBp.Data;

namespace MCBp.Tools;

/// <summary>
/// Инструмент "Текст" — размещение векторной текстовой метки на холсте.
/// </summary>
public class TextTool : ITool
{
    public bool DataChanged { get; private set; }

    /// <summary>
    /// Функция для показа диалога ввода текста. Устанавливается извне (из MainForm).
    /// </summary>
    public Func<string?>? ShowTextInputDialog { get; set; }

    public void OnPress(Point gridPos, ProjectData data, Color activeColor, Font activeFont)
    {
        DataChanged = false;

        if (gridPos.Y < Camera.MinY || gridPos.Y > Camera.MaxY)
            return;

        var text = ShowTextInputDialog?.Invoke();
        if (string.IsNullOrWhiteSpace(text))
            return;

        data.TextLabels.Add(new TextLabel
        {
            GridX = gridPos.X,
            GridY = gridPos.Y,
            Text = text,
            ColorArgb = activeColor.ToArgb(),
            FontFamily = activeFont.FontFamily.Name,
            FontSize = activeFont.Size,
            FontStyle = (int)activeFont.Style
        });
        DataChanged = true;
    }

    public void OnDrag(Point gridPos, ProjectData data, Color activeColor) { }
    public void OnRelease(Point gridPos, ProjectData data, Color activeColor) { }
    public void OnHover(Point gridPos, ProjectData data) { }
    public void RenderPreview(Graphics g, Camera camera) { }
}
