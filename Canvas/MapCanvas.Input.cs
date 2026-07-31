using MCBp.Tools;

namespace MCBp.Canvas;

public partial class MapCanvas
{
    private bool _isPanning;
    private Point _panLastPos;
    private bool _isToolActive;

    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e);
        Focus();

        if (e.Button == MouseButtons.Right || e.Button == MouseButtons.Middle)
        {
            _isPanning = true;
            _panLastPos = e.Location;
            Cursor = Cursors.SizeAll;
            return;
        }

        if (e.Button == MouseButtons.Left && ActiveTool != null)
        {
            _isToolActive = true;
            if (ActiveTool is not PointerTool)
            {
                UndoRedo.SaveSnapshot(Data);
            }

            var gridPos = Camera.ScreenToGrid(e.Location);
            ActiveTool.OnPress(gridPos, Data, ActiveColor, ActiveFont);

            if (ActiveTool is PointerTool pt)
            {
                pt.FeedScreenPoint(e.Location);
            }

            if (ActiveTool.DataChanged)
                DataModified?.Invoke();
            Invalidate();
        }
    }

    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);

        CursorGridPos = Camera.ScreenToGrid(e.Location);
        CursorMoved?.Invoke();

        if (_isPanning)
        {
            Camera.OffsetX += e.X - _panLastPos.X;
            Camera.OffsetY += e.Y - _panLastPos.Y;
            _panLastPos = e.Location;
            Invalidate();
            return;
        }

        if (_isToolActive && ActiveTool != null)
        {
            var gridPos = Camera.ScreenToGrid(e.Location);
            ActiveTool.OnDrag(gridPos, Data, ActiveColor);

            if (ActiveTool is PointerTool pt)
            {
                pt.FeedScreenPoint(e.Location);
            }

            if (ActiveTool.DataChanged)
                DataModified?.Invoke();
            Invalidate();
            return;
        }

        if (ActiveTool != null)
        {
            var gridPos = Camera.ScreenToGrid(e.Location);
            ActiveTool.OnHover(gridPos, Data);
            Invalidate();
        }
    }

    protected override void OnMouseUp(MouseEventArgs e)
    {
        base.OnMouseUp(e);

        if (_isPanning && (e.Button == MouseButtons.Right || e.Button == MouseButtons.Middle))
        {
            _isPanning = false;
            Cursor = Cursors.Default;
            return;
        }

        if (_isToolActive && e.Button == MouseButtons.Left && ActiveTool != null)
        {
            _isToolActive = false;
            var gridPos = Camera.ScreenToGrid(e.Location);
            ActiveTool.OnRelease(gridPos, Data, ActiveColor);
            if (ActiveTool.DataChanged)
                DataModified?.Invoke();
            Invalidate();
        }
    }

    protected override void OnMouseWheel(MouseEventArgs e)
    {
        base.OnMouseWheel(e);
        Camera.ZoomAt(e.Location, e.Delta);
        CursorGridPos = Camera.ScreenToGrid(e.Location);
        CursorMoved?.Invoke();
        Invalidate();
    }

    protected override void OnResize(EventArgs e)
    {
        base.OnResize(e);
        Invalidate();
    }
}
