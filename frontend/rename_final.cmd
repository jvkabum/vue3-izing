@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend"
set "COMPOSABLES_DIR=%BASE_DIR%\src\composables\atendimento"

cd "%COMPOSABLES_DIR%" || exit /b

:: Renomear o último arquivo
if exist "useAbasAtendimento.js" del "useAttendanceTabs.js" 2>nul
if exist "useAbasAtendimento.js" ren "useAbasAtendimento.js" "useAttendanceTabs.js"

echo Renomeação final concluída!
pause
