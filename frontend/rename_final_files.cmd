@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend\src\composables"

:: Renomear pasta painel
cd "%BASE_DIR%" || exit /b
ren "painel" "dashboard"

:: Renomear arquivos em campaigns
cd "%BASE_DIR%\campaigns" || exit /b
if exist "usesCampanhas.js" ren "usesCampanhas.js" "useCampaignsExtra.js"

:: Renomear arquivos em system
cd "%BASE_DIR%\system" || exit /b
if exist "useNotificacao.js" ren "useNotificacao.js" "useNotification2.js"
if exist "useNotificacoes.js" ren "useNotificacoes.js" "useNotifications.js"

:: Renomear arquivos em whatsapp
cd "%BASE_DIR%\whatsapp" || exit /b
if exist "useCodigoQR.js" ren "useCodigoQR.js" "useQRCode.js"

echo Arquivos finais renomeados com sucesso!
pause
