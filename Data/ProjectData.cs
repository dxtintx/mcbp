using System.Drawing;
using System.Text.Json.Serialization;

namespace MCBp.Data;

public class ProjectData
{
    public Dictionary<string, int> Blocks { get; set; } = new();
    public List<TextLabel> TextLabels { get; set; } = new();
    public List<RulerLine> Rulers { get; set; } = new();
    public List<ArcCurve> Arcs { get; set; } = new();

    [JsonIgnore]
    public Dictionary<Point, Color> BlockMap { get; set; } = new();

    public void PrepareForSave()
    {
        Blocks.Clear();
        foreach (var kv in BlockMap)
        {
            Blocks[$"{kv.Key.X},{kv.Key.Y}"] = kv.Value.ToArgb();
        }
    }

    public void RestoreFromLoad()
    {
        BlockMap.Clear();
        foreach (var kv in Blocks)
        {
            var parts = kv.Key.Split(',');
            if (parts.Length == 2 &&
                int.TryParse(parts[0], out int x) &&
                int.TryParse(parts[1], out int y))
            {
                BlockMap[new Point(x, y)] = Color.FromArgb(kv.Value);
            }
        }
    }
}
