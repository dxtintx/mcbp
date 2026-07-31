namespace MCBp.Data;

public class ArcCurve
{
    public int StartX { get; set; }
    public int StartY { get; set; }
    public int EndX { get; set; }
    public int EndY { get; set; }
    public int ControlX { get; set; }
    public int ControlY { get; set; }
    public int ColorArgb { get; set; } = unchecked((int)0xFF000000);
}
