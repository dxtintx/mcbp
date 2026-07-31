!define APP_NAME "MCBlueprint"
!define COMP_NAME "MCBlueprint Team"
!define VERSION "1.0.0"
!define EXEC_NAME "MCBp.exe"

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

    CreateDirectory "$SMPROGRAMS\MCBlueprint"
    CreateShortcut "$SMPROGRAMS\MCBlueprint\MCBlueprint.lnk" "$INSTDIR\${EXEC_NAME}"
    CreateShortcut "$DESKTOP\MCBlueprint.lnk" "$INSTDIR\${EXEC_NAME}"

    WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
    Delete "$DESKTOP\MCBlueprint.lnk"
    Delete "$SMPROGRAMS\MCBlueprint\MCBlueprint.lnk"
    RMDir "$SMPROGRAMS\MCBlueprint"

    RMDir /r "$INSTDIR"
SectionEnd
