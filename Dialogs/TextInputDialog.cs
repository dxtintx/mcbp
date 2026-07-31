namespace MCBp.Dialogs;

/// <summary>
/// Простой диалог ввода текста.
/// </summary>
public class TextInputDialog : Form
{
    private readonly TextBox _textBox;
    private readonly Button _okButton;
    private readonly Button _cancelButton;

    public string InputText => _textBox.Text;

    public TextInputDialog()
    {
        Text = "Введите текст";
        FormBorderStyle = FormBorderStyle.FixedDialog;
        StartPosition = FormStartPosition.CenterParent;
        MaximizeBox = false;
        MinimizeBox = false;
        Size = new Size(400, 160);

        var label = new Label
        {
            Text = "Текст метки:",
            Location = new Point(12, 12),
            AutoSize = true,
        };

        _textBox = new TextBox
        {
            Location = new Point(12, 36),
            Width = 360,
        };

        _okButton = new Button
        {
            Text = "ОК",
            DialogResult = DialogResult.OK,
            Location = new Point(216, 80),
            Width = 75,
        };

        _cancelButton = new Button
        {
            Text = "Отмена",
            DialogResult = DialogResult.Cancel,
            Location = new Point(297, 80),
            Width = 75,
        };

        AcceptButton = _okButton;
        CancelButton = _cancelButton;
        Controls.AddRange(new Control[] { label, _textBox, _okButton, _cancelButton });
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        _textBox.Focus();
    }
}
