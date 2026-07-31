using MCBp.Canvas;
using MCBp.Data;
using MCBp.Dialogs;
using MCBp.Localization;
using MCBp.Rendering;
using MCBp.Tools;

namespace MCBp;

/// <summary>
/// Главное окно приложения MCBlueprint (Планировщик и архитектор для Minecraft).
/// </summary>
public class MainForm : Form
{
    private readonly MapCanvas _canvas;
    private readonly MenuStrip _menuStrip;
    private readonly ToolStrip _toolStrip;
    private readonly StatusStrip _statusStrip;

    // Меню элементы
    private readonly ToolStripMenuItem _fileMenu;
    private readonly ToolStripMenuItem _newItem;
    private readonly ToolStripMenuItem _openItem;
    private readonly ToolStripMenuItem _saveItem;
    private readonly ToolStripMenuItem _saveAsItem;
    private readonly ToolStripMenuItem _exitItem;

    private readonly ToolStripMenuItem _editMenu;
    private readonly ToolStripMenuItem _undoMenuItem;
    private readonly ToolStripMenuItem _redoMenuItem;
    private readonly ToolStripMenuItem _clearAllItem;

    private readonly ToolStripMenuItem _viewMenu;
    private readonly ToolStripMenuItem _viewGridItem;
    private readonly ToolStripMenuItem _centerCameraItem;

    private readonly ToolStripMenuItem _languageMenu;

    private readonly ToolStripMenuItem _helpMenu;
    private readonly ToolStripMenuItem _aboutItem;

    // Статус-бар элементы
    private readonly ToolStripStatusLabel _coordLabel;
    private readonly ToolStripStatusLabel _sizeLabel;
    private readonly ToolStripStatusLabel _blockCountLabel;
    private readonly ToolStripStatusLabel _zoomLabel;

    // Тулбар элементы
    private readonly ToolStripButton _undoToolButton;
    private readonly ToolStripButton _redoToolButton;
    private readonly ToolStripButton _fontToolButton;
    private readonly ToolStripButton _gridToolButton;
    private readonly ToolStripButton _colorButton;

    // Инструменты
    private readonly Dictionary<ToolType, ITool> _tools;
    private readonly Dictionary<ToolType, ToolStripButton> _toolButtons;
    private ToolType _activeTool = ToolType.Brush;

    // Цвет / шрифт
    private Color _activeColor = Color.Black;
    private Font _activeFont = new("Segoe UI", 12f);

    // Путь текущего файла
    private string? _currentFilePath;

    public MainForm()
    {
        Size = new Size(1280, 800);
        MinimumSize = new Size(640, 480);
        StartPosition = FormStartPosition.CenterScreen;
        KeyPreview = true;

        if (File.Exists("logo.png"))
        {
            try
            {
                using var bmp = new Bitmap("logo.png");
                Icon = Icon.FromHandle(bmp.GetHicon());
            }
            catch { }
        }

        // === Инструменты ===
        var textTool = new TextTool
        {
            ShowTextInputDialog = ShowTextInput
        };

        _tools = new Dictionary<ToolType, ITool>
        {
            [ToolType.Pointer] = new PointerTool(),
            [ToolType.Brush] = new BrushTool(),
            [ToolType.Line] = new LineTool(),
            [ToolType.Rectangle] = new RectangleTool(),
            [ToolType.Circle] = new CircleTool(),
            [ToolType.Arc] = new ArcTool(),
            [ToolType.Text] = textTool,
            [ToolType.Ruler] = new RulerTool(),
            [ToolType.Eraser] = new EraserTool(),
        };

        // === Canvas ===
        _canvas = new MapCanvas
        {
            Dock = DockStyle.Fill,
            ActiveTool = _tools[ToolType.Brush],
            ActiveColor = _activeColor,
            ActiveFont = _activeFont,
        };

        _canvas.CursorMoved += UpdateStatusBar;
        _canvas.DataModified += OnDataModified;

        // === 1. Главное меню (MenuStrip) ===
        _menuStrip = new MenuStrip();

        // Файл
        _fileMenu = new ToolStripMenuItem();
        _newItem = new ToolStripMenuItem("", null, (_, _) => NewProject()) { ShortcutKeys = Keys.Control | Keys.N };
        _openItem = new ToolStripMenuItem("", null, (_, _) => LoadProject()) { ShortcutKeys = Keys.Control | Keys.O };
        _saveItem = new ToolStripMenuItem("", null, (_, _) => SaveProject()) { ShortcutKeys = Keys.Control | Keys.S };
        _saveAsItem = new ToolStripMenuItem("", null, (_, _) => SaveProjectAs());
        _exitItem = new ToolStripMenuItem("", null, (_, _) => Close());
        _fileMenu.DropDownItems.AddRange(new ToolStripItem[] { _newItem, _openItem, _saveItem, _saveAsItem, new ToolStripSeparator(), _exitItem });

        // Правка
        _editMenu = new ToolStripMenuItem();
        _undoMenuItem = new ToolStripMenuItem("", null, (_, _) => PerformUndo()) { ShortcutKeys = Keys.Control | Keys.Z };
        _redoMenuItem = new ToolStripMenuItem("", null, (_, _) => PerformRedo()) { ShortcutKeys = Keys.Control | Keys.X };
        _clearAllItem = new ToolStripMenuItem("", null, (_, _) => ClearCanvas());
        _editMenu.DropDownItems.AddRange(new ToolStripItem[] { _undoMenuItem, _redoMenuItem, new ToolStripSeparator(), _clearAllItem });

        // Вид
        _viewMenu = new ToolStripMenuItem();
        _viewGridItem = new ToolStripMenuItem("", null, (_, _) => ToggleGrid()) { Checked = true, ShortcutKeyDisplayString = "G" };
        _centerCameraItem = new ToolStripMenuItem("", null, (_, _) => _canvas.CenterCamera());
        _viewMenu.DropDownItems.AddRange(new ToolStripItem[] { _viewGridItem, _centerCameraItem });

        // Язык (10 локализаций)
        _languageMenu = new ToolStripMenuItem();
        PopulateLanguageMenu();

        // Справка
        _helpMenu = new ToolStripMenuItem();
        _aboutItem = new ToolStripMenuItem("", null, (_, _) => ShowAboutDialog());
        _helpMenu.DropDownItems.Add(_aboutItem);

        _menuStrip.Items.AddRange(new ToolStripItem[] { _fileMenu, _editMenu, _viewMenu, _languageMenu, _helpMenu });

        // === 2. Панель инструментов (ToolStrip) с иконками ===
        _toolStrip = new ToolStrip
        {
            GripStyle = ToolStripGripStyle.Hidden,
            Padding = new Padding(4, 2, 4, 2),
            ImageScalingSize = new Size(20, 20),
        };

        _toolButtons = new Dictionary<ToolType, ToolStripButton>();

        AddToolButton(ToolType.Pointer);
        AddToolButton(ToolType.Brush);
        AddToolButton(ToolType.Line);
        AddToolButton(ToolType.Rectangle);
        AddToolButton(ToolType.Circle);
        AddToolButton(ToolType.Arc);
        AddToolButton(ToolType.Text);
        AddToolButton(ToolType.Ruler);
        AddToolButton(ToolType.Eraser);

        _toolStrip.Items.Add(new ToolStripSeparator());

        // Выбор цвета
        _colorButton = new ToolStripButton
        {
            DisplayStyle = ToolStripItemDisplayStyle.Image,
        };
        _colorButton.Click += (_, _) => SelectColor();
        _toolStrip.Items.Add(_colorButton);
        UpdateColorButton();

        // Выбор шрифта
        _fontToolButton = new ToolStripButton
        {
            DisplayStyle = ToolStripItemDisplayStyle.Image,
            Image = IconFactory.CreateFontIcon(),
        };
        _fontToolButton.Click += (_, _) => SelectFont();
        _toolStrip.Items.Add(_fontToolButton);

        _toolStrip.Items.Add(new ToolStripSeparator());

        // Кнопки Отмена / Повтор
        _undoToolButton = new ToolStripButton
        {
            DisplayStyle = ToolStripItemDisplayStyle.Image,
            Image = IconFactory.CreateUndoIcon(),
            Enabled = false,
        };
        _undoToolButton.Click += (_, _) => PerformUndo();
        _toolStrip.Items.Add(_undoToolButton);

        _redoToolButton = new ToolStripButton
        {
            DisplayStyle = ToolStripItemDisplayStyle.Image,
            Image = IconFactory.CreateRedoIcon(),
            Enabled = false,
        };
        _redoToolButton.Click += (_, _) => PerformRedo();
        _toolStrip.Items.Add(_redoToolButton);

        _toolStrip.Items.Add(new ToolStripSeparator());

        // Сетка (Иконка)
        _gridToolButton = new ToolStripButton
        {
            DisplayStyle = ToolStripItemDisplayStyle.Image,
            Image = IconFactory.CreateGridIcon(),
            CheckOnClick = true,
            Checked = true,
        };
        _gridToolButton.CheckedChanged += (_, _) =>
        {
            _canvas.ShowGrid = _gridToolButton.Checked;
            _viewGridItem.Checked = _gridToolButton.Checked;
            _canvas.Invalidate();
        };
        _toolStrip.Items.Add(_gridToolButton);

        // === 3. Статус-бар ===
        _statusStrip = new StatusStrip
        {
            SizingGrip = false,
        };

        _coordLabel = new ToolStripStatusLabel("X: 0  Y: 0")
        {
            BorderSides = ToolStripStatusLabelBorderSides.Right,
            AutoSize = false,
            Width = 160,
            TextAlign = ContentAlignment.MiddleLeft,
        };

        _sizeLabel = new ToolStripStatusLabel()
        {
            BorderSides = ToolStripStatusLabelBorderSides.Right,
            AutoSize = false,
            Width = 200,
            TextAlign = ContentAlignment.MiddleLeft,
        };

        _blockCountLabel = new ToolStripStatusLabel()
        {
            BorderSides = ToolStripStatusLabelBorderSides.Right,
            AutoSize = false,
            Width = 140,
            TextAlign = ContentAlignment.MiddleLeft,
        };

        _zoomLabel = new ToolStripStatusLabel()
        {
            AutoSize = false,
            Width = 140,
            TextAlign = ContentAlignment.MiddleLeft,
        };

        _statusStrip.Items.AddRange(new ToolStripItem[]
        {
            _coordLabel, _sizeLabel, _blockCountLabel, _zoomLabel
        });

        // === Компоновка формы ===
        Controls.Add(_canvas);      // Fill
        Controls.Add(_statusStrip); // Bottom
        Controls.Add(_toolStrip);   // Top
        Controls.Add(_menuStrip);   // Top

        MainMenuStrip = _menuStrip;

        // Подписка на смену языка
        LocalizationManager.LanguageChanged += ApplyLocalization;
        ApplyLocalization();

        // Начальный инструмент — Кисть
        SelectTool(ToolType.Brush);

        Load += (_, _) => _canvas.CenterCamera();
    }

    private void PopulateLanguageMenu()
    {
        _languageMenu.DropDownItems.Clear();
        foreach (Language lang in Enum.GetValues(typeof(Language)))
        {
            var item = new ToolStripMenuItem(LocalizationManager.GetNativeName(lang), null, (_, _) =>
            {
                LocalizationManager.SetLanguage(lang);
            });

            if (lang == LocalizationManager.CurrentLanguage)
                item.Checked = true;

            _languageMenu.DropDownItems.Add(item);
        }
    }

    private void ApplyLocalization()
    {
        // Заголовок формы
        Text = _currentFilePath != null
            ? $"{LocalizationManager.Get("AppTitle")} — {Path.GetFileName(_currentFilePath)}"
            : LocalizationManager.Get("AppTitle");

        // Меню
        _fileMenu.Text = LocalizationManager.Get("MenuFile");
        _newItem.Text = LocalizationManager.Get("MenuNew");
        _openItem.Text = LocalizationManager.Get("MenuOpen");
        _saveItem.Text = LocalizationManager.Get("MenuSave");
        _saveAsItem.Text = LocalizationManager.Get("MenuSaveAs");
        _exitItem.Text = LocalizationManager.Get("MenuExit");

        _editMenu.Text = LocalizationManager.Get("MenuEdit");
        _undoMenuItem.Text = LocalizationManager.Get("MenuUndo");
        _redoMenuItem.Text = LocalizationManager.Get("MenuRedo");
        _clearAllItem.Text = LocalizationManager.Get("MenuClearAll");

        _viewMenu.Text = LocalizationManager.Get("MenuView");
        _viewGridItem.Text = LocalizationManager.Get("MenuGrid");
        _centerCameraItem.Text = LocalizationManager.Get("MenuCenterCamera");

        _languageMenu.Text = LocalizationManager.Get("MenuLanguage");
        foreach (ToolStripMenuItem item in _languageMenu.DropDownItems)
        {
            item.Checked = item.Text == LocalizationManager.GetNativeName(LocalizationManager.CurrentLanguage);
        }

        _helpMenu.Text = LocalizationManager.Get("MenuHelp");
        _aboutItem.Text = LocalizationManager.Get("MenuAbout");

        // Подсказки кнопок тулбара
        SetToolTooltip(ToolType.Pointer, "ToolPointer");
        SetToolTooltip(ToolType.Brush, "ToolBrush");
        SetToolTooltip(ToolType.Line, "ToolLine");
        SetToolTooltip(ToolType.Rectangle, "ToolRectangle");
        SetToolTooltip(ToolType.Circle, "ToolCircle");
        SetToolTooltip(ToolType.Arc, "ToolArc");
        SetToolTooltip(ToolType.Text, "ToolText");
        SetToolTooltip(ToolType.Ruler, "ToolRuler");
        SetToolTooltip(ToolType.Eraser, "ToolEraser");

        _colorButton.ToolTipText = LocalizationManager.Get("ToolColor");
        _fontToolButton.ToolTipText = LocalizationManager.Get("ToolFont");
        _undoToolButton.ToolTipText = LocalizationManager.Get("ToolUndo");
        _redoToolButton.ToolTipText = LocalizationManager.Get("ToolRedo");
        _gridToolButton.ToolTipText = LocalizationManager.Get("ToolGrid");

        UpdateStatusBar();
    }

    private void SetToolTooltip(ToolType type, string locKey)
    {
        if (_toolButtons.TryGetValue(type, out var btn))
        {
            btn.ToolTipText = LocalizationManager.Get(locKey);
        }
    }

    // === Управление инструментами ===

    private void AddToolButton(ToolType type)
    {
        var btn = new ToolStripButton
        {
            DisplayStyle = ToolStripItemDisplayStyle.Image,
            Image = IconFactory.CreateToolIcon(type),
            Tag = type,
        };
        btn.Click += (_, _) => SelectTool(type);
        _toolStrip.Items.Add(btn);
        _toolButtons[type] = btn;
    }

    private void SelectTool(ToolType type)
    {
        _activeTool = type;
        _canvas.ActiveTool = _tools[type];

        foreach (var kv in _toolButtons)
            kv.Value.Checked = kv.Key == type;

        _canvas.Cursor = type switch
        {
            ToolType.Eraser => Cursors.Cross,
            ToolType.Pointer => Cursors.Hand,
            _ => Cursors.Default
        };

        _canvas.Invalidate();
    }

    // === Undo / Redo ===

    private void PerformUndo()
    {
        _canvas.PerformUndo();
        UpdateUndoRedoState();
    }

    private void PerformRedo()
    {
        _canvas.PerformRedo();
        UpdateUndoRedoState();
    }

    private void UpdateUndoRedoState()
    {
        bool canUndo = _canvas.UndoRedo.CanUndo;
        bool canRedo = _canvas.UndoRedo.CanRedo;

        _undoMenuItem.Enabled = canUndo;
        _undoToolButton.Enabled = canUndo;

        _redoMenuItem.Enabled = canRedo;
        _redoToolButton.Enabled = canRedo;
    }

    private void OnDataModified()
    {
        UpdateStatusBar();
        UpdateUndoRedoState();
    }

    // === Действия меню и диалогов ===

    private void SelectColor()
    {
        using var dlg = new ColorDialog { Color = _activeColor, FullOpen = true };
        if (dlg.ShowDialog() == DialogResult.OK)
        {
            _activeColor = dlg.Color;
            _canvas.ActiveColor = _activeColor;
            UpdateColorButton();
        }
    }

    private void UpdateColorButton()
    {
        _colorButton.Image = IconFactory.CreateColorPaletteIcon(_activeColor);
    }

    private void SelectFont()
    {
        using var dlg = new FontDialog { Font = _activeFont };
        if (dlg.ShowDialog() == DialogResult.OK)
        {
            _activeFont = dlg.Font;
            _canvas.ActiveFont = _activeFont;
        }
    }

    private void ToggleGrid()
    {
        _canvas.ShowGrid = !_canvas.ShowGrid;
        _gridToolButton.Checked = _canvas.ShowGrid;
        _viewGridItem.Checked = _canvas.ShowGrid;
        _canvas.Invalidate();
    }

    private void ClearCanvas()
    {
        if (_canvas.BlockCount > 0 || _canvas.Data.TextLabels.Count > 0 || _canvas.Data.Rulers.Count > 0 || _canvas.Data.Arcs.Count > 0)
        {
            _canvas.UndoRedo.SaveSnapshot(_canvas.Data);
            _canvas.Data = new ProjectData();
            OnDataModified();
            _canvas.Invalidate();
        }
    }

    private void NewProject()
    {
        _canvas.Data = new ProjectData();
        _canvas.UndoRedo.Clear();
        _currentFilePath = null;
        Text = LocalizationManager.Get("NewProjectTitle");
        _canvas.CenterCamera();
        OnDataModified();
        _canvas.Invalidate();
    }

    private void SaveProject()
    {
        if (_currentFilePath == null)
        {
            SaveProjectAs();
            return;
        }

        ProjectSerializer.Save(_canvas.Data, _currentFilePath);
        Text = $"{LocalizationManager.Get("AppTitle")} — {Path.GetFileName(_currentFilePath)}";
    }

    private void SaveProjectAs()
    {
        using var dlg = new SaveFileDialog
        {
            Filter = "MCBp Project (*.mcbp)|*.mcbp",
            DefaultExt = "mcbp",
        };
        if (dlg.ShowDialog() != DialogResult.OK)
            return;

        _currentFilePath = dlg.FileName;
        ProjectSerializer.Save(_canvas.Data, _currentFilePath);
        Text = $"{LocalizationManager.Get("AppTitle")} — {Path.GetFileName(_currentFilePath)}";
    }

    private void LoadProject()
    {
        using var dlg = new OpenFileDialog
        {
            Filter = "MCBp Project (*.mcbp)|*.mcbp",
        };
        if (dlg.ShowDialog() != DialogResult.OK)
            return;

        var data = ProjectSerializer.Load(dlg.FileName);
        if (data == null)
            return;

        _canvas.Data = data;
        _canvas.UndoRedo.Clear();
        _currentFilePath = dlg.FileName;
        Text = $"{LocalizationManager.Get("AppTitle")} — {Path.GetFileName(_currentFilePath)}";
        _canvas.CenterCamera();
        OnDataModified();
        _canvas.Invalidate();
    }

    private void ShowAboutDialog()
    {
        using var form = new Form
        {
            Text = LocalizationManager.Get("AboutTitle"),
            Size = new Size(420, 360),
            StartPosition = FormStartPosition.CenterParent,
            FormBorderStyle = FormBorderStyle.FixedDialog,
            MaximizeBox = false,
            MinimizeBox = false,
            BackColor = Color.FromArgb(24, 24, 27),
            ForeColor = Color.White,
        };

        if (File.Exists("logo.png"))
        {
            try
            {
                var pic = new PictureBox
                {
                    Image = Image.FromFile("logo.png"),
                    SizeMode = PictureBoxSizeMode.Zoom,
                    Size = new Size(80, 80),
                    Location = new Point(160, 16),
                };
                form.Controls.Add(pic);
            }
            catch { }
        }

        var titleLabel = new Label
        {
            Text = "MCBlueprint",
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            TextAlign = ContentAlignment.MiddleCenter,
            Size = new Size(380, 28),
            Location = new Point(12, 104),
            ForeColor = Color.White,
        };
        form.Controls.Add(titleLabel);

        var textLabel = new Label
        {
            Text = LocalizationManager.Get("AboutText"),
            Font = new Font("Segoe UI", 9f),
            TextAlign = ContentAlignment.TopLeft,
            Size = new Size(380, 130),
            Location = new Point(16, 136),
            ForeColor = Color.FromArgb(200, 200, 200),
        };
        form.Controls.Add(textLabel);

        var btnOk = new Button
        {
            Text = "OK",
            DialogResult = DialogResult.OK,
            Size = new Size(90, 30),
            Location = new Point(155, 275),
            BackColor = Color.FromArgb(40, 40, 45),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
        };
        form.Controls.Add(btnOk);
        form.AcceptButton = btnOk;

        form.ShowDialog(this);
    }

    // === Статус-бар ===

    private void UpdateStatusBar()
    {
        var pos = _canvas.CursorGridPos;
        _coordLabel.Text = $"X: {pos.X}  Y: {pos.Y}";

        var bounds = _canvas.GetProjectBoundsSize();
        string blocksUnit = LocalizationManager.Get("BlocksLabel");
        _sizeLabel.Text = $"{LocalizationManager.Get("StatusSize")}: {bounds.Width} × {bounds.Height} {blocksUnit}";

        _blockCountLabel.Text = $"{LocalizationManager.Get("StatusBlocks")}: {_canvas.BlockCount}";

        _zoomLabel.Text = $"{LocalizationManager.Get("StatusZoom")}: {_canvas.Camera.CellSize}px";
    }

    // === Обработка горячих клавиш ===

    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        switch (keyData)
        {
            case Keys.D0: SelectTool(ToolType.Pointer); return true;
            case Keys.D1: SelectTool(ToolType.Brush); return true;
            case Keys.D2: SelectTool(ToolType.Line); return true;
            case Keys.D3: SelectTool(ToolType.Rectangle); return true;
            case Keys.D4: SelectTool(ToolType.Circle); return true;
            case Keys.D5: SelectTool(ToolType.Arc); return true;
            case Keys.D6: SelectTool(ToolType.Text); return true;
            case Keys.D7: SelectTool(ToolType.Ruler); return true;
            case Keys.D8: SelectTool(ToolType.Eraser); return true;
            case Keys.Control | Keys.Z: PerformUndo(); return true;
            case Keys.Control | Keys.X:
            case Keys.Control | Keys.Y:
            case Keys.Control | Keys.Shift | Keys.Z:
                PerformRedo();
                return true;
        }
        return base.ProcessCmdKey(ref msg, keyData);
    }

    // === Помощник текста ===

    private string? ShowTextInput()
    {
        using var dlg = new TextInputDialog();
        return dlg.ShowDialog() == DialogResult.OK && !string.IsNullOrWhiteSpace(dlg.InputText)
            ? dlg.InputText
            : null;
    }
}
