@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend"
set "COMPOSABLES_DIR=%BASE_DIR%\src\composables\atendimento"

cd "%COMPOSABLES_DIR%" || exit /b

:: Renomear composables de atendimento
if exist "useAbasAtendimento.js" ren "useAbasAtendimento.js" "useAttendanceTabs.js"
if exist "useAtendimento.js" ren "useAtendimento.js" "useAttendance.js"
if exist "useContatoAtendimento.js" ren "useContatoAtendimento.js" "useAttendanceContact.js"
if exist "useEstadoAtendimento.js" ren "useEstadoAtendimento.js" "useAttendanceState.js"
if exist "useFiltrosAtendimento.js" ren "useFiltrosAtendimento.js" "useAttendanceFilters.js"
if exist "useGavetasAtendimento.js" ren "useGavetasAtendimento.js" "useAttendanceDrawers.js"

echo Composables renomeados com sucesso!
pause
