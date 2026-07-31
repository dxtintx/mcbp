!define APP_NAME "MCBlueprint"
!define COMP_NAME "MCBlueprint Team"
!define VERSION "1.0.0"
!define EXEC_NAME "MCBp.exe"

Icon "app.ico"
UninstallIcon "app.ico"

OutFile "MCBlueprint_Installer_Win64.exe"
InstallDir "$PROGRAMFILES64\MCBlueprint"
RequestExecutionLevel admin

Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    File /r "publish_win64\*.*"
    File "app.ico"

    CreateDirectory "$SMPROGRAMS\MCBlueprint"
    CreateShortcut "$SMPROGRAMS\MCBlueprint\MCBlueprint.lnk" "$INSTDIR\${EXEC_NAME}" "" "$INSTDIR\app.ico"
    CreateShortcut "$DESKTOP\MCBlueprint.lnk" "$INSTDIR\${EXEC_NAME}" "" "$INSTDIR\app.ico"

    WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
    Delete "$DESKTOP\MCBlueprint.lnk"
    Delete "$SMPROGRAMS\MCBlueprint\MCBlueprint.lnk"
    RMDir "$SMPROGRAMS\MCBlueprint"

    RMDir /r "$INSTDIR"
SectionEnd
