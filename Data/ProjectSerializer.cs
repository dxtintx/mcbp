using System.Text.Json;

namespace MCBp.Data;

public static class ProjectSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = true,
    };

    public static void Save(ProjectData data, string path)
    {
        data.PrepareForSave();
        var json = JsonSerializer.Serialize(data, Options);
        File.WriteAllText(path, json);
    }

    public static ProjectData? Load(string path)
    {
        try
        {
            var json = File.ReadAllText(path);
            var data = JsonSerializer.Deserialize<ProjectData>(json, Options);
            data?.RestoreFromLoad();
            return data;
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Failed to load project:\n{ex.Message}",
                "Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return null;
        }
    }
}
