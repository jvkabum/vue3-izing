@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend\src\composables"

:: Renomear pasta atendimento para attendance
cd "%BASE_DIR%" || exit /b
ren "atendimento" "attendance"

echo Última pasta renomeada com sucesso!
pause
