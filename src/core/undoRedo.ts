import { ProjectData } from './types';

export class UndoRedoManager {
  private _undoStack: string[] = [];
  private _redoStack: string[] = [];
  private readonly maxHistoryDepth: number = 50;

  public get canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  public saveSnapshot(data: ProjectData): void {
    const json = JSON.stringify(data);
    this._undoStack.push(json);

    if (this._undoStack.length > this.maxHistoryDepth) {
      this._undoStack.shift(); // Remove oldest
    }

    this._redoStack = []; // Clear redo stack on new operation
  }

  public undo(currentData: ProjectData): ProjectData | null {
    if (!this.canUndo) return null;

    this._redoStack.push(JSON.stringify(currentData));

    const snapshotJson = this._undoStack.pop();
    if (!snapshotJson) return null;

    return JSON.parse(snapshotJson) as ProjectData;
  }

  public redo(currentData: ProjectData): ProjectData | null {
    if (!this.canRedo) return null;

    this._undoStack.push(JSON.stringify(currentData));

    const snapshotJson = this._redoStack.pop();
    if (!snapshotJson) return null;

    return JSON.parse(snapshotJson) as ProjectData;
  }

  public clear(): void {
    this._undoStack = [];
    this._redoStack = [];
  }
}
