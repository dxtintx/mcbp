using System.Text.Json;

namespace MCBp.Data;

public class UndoRedoManager
{
    private readonly Stack<string> _undoStack = new();
    private readonly Stack<string> _redoStack = new();
    private const int MaxHistoryDepth = 50;

    public bool CanUndo => _undoStack.Count > 0;
    public bool CanRedo => _redoStack.Count > 0;

    public void SaveSnapshot(ProjectData data)
    {
        data.PrepareForSave();
        string json = JsonSerializer.Serialize(data);

        _undoStack.Push(json);
        if (_undoStack.Count > MaxHistoryDepth)
        {
            var temp = _undoStack.ToArray();
            _undoStack.Clear();
            for (int i = temp.Length - 2; i >= 0; i--)
            {
                _undoStack.Push(temp[i]);
            }
        }

        _redoStack.Clear();
    }

    public ProjectData? Undo(ProjectData currentData)
    {
        if (!CanUndo) return null;

        currentData.PrepareForSave();
        _redoStack.Push(JsonSerializer.Serialize(currentData));

        string snapshotJson = _undoStack.Pop();
        var data = JsonSerializer.Deserialize<ProjectData>(snapshotJson);
        data?.RestoreFromLoad();
        return data;
    }

    public ProjectData? Redo(ProjectData currentData)
    {
        if (!CanRedo) return null;

        currentData.PrepareForSave();
        _undoStack.Push(JsonSerializer.Serialize(currentData));

        string snapshotJson = _redoStack.Pop();
        var data = JsonSerializer.Deserialize<ProjectData>(snapshotJson);
        data?.RestoreFromLoad();
        return data;
    }

    public void Clear()
    {
        _undoStack.Clear();
        _redoStack.Clear();
    }
}
