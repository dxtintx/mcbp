namespace MCBp.Data;

public class TextLabel
{
    public int GridX { get; set; }
    public int GridY { get; set; }
    public string Text { get; set; } = string.Empty;
    public int ColorArgb { get; set; } = unchecked((int)0xFF000000);
    public string FontFamily { get; set; } = "Segoe UI";
    public float FontSize { get; set; } = 12f;
    public int FontStyle { get; set; }
}
