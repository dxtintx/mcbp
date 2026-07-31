namespace MCBp.Data;

public class RulerLine
{
    public int StartX { get; set; }
    public int StartY { get; set; }
    public int EndX { get; set; }
    public int EndY { get; set; }

    public int Distance =>
        StartX == EndX
            ? Math.Abs(EndY - StartY)
            : Math.Abs(EndX - StartX);
}
