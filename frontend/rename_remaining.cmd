@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend"

:: Renomear arquivos em construtor-fluxo
cd "%BASE_DIR%\src\components\construtor-fluxo" || exit /b
if exist "direcaoForcada.js" ren "direcaoForcada.js" "forcedDirection.js"
if exist "fluxoPadrao.js" ren "fluxoPadrao.js" "defaultFlow.js"
if exist "utilidades.js" ren "utilidades.js" "utilities.js"

:: Renomear pastas principais (mantendo conteúdo)
cd "%BASE_DIR%\src\components" || exit /b
ren "atendimento" "attendance"
ren "campanhas" "campaigns"
ren "comum" "common"
ren "configuracoes" "settings"
ren "construtor-fluxo" "flow-builder"
ren "contatos" "contacts"
ren "empresas" "companies"
ren "estatisticas" "statistics"
ren "etiquetas" "tags"
ren "filas" "queues"
ren "fluxo-chat" "chat-flow"
ren "horarios" "schedules"
ren "mensagens-rapidas" "quick-messages"
ren "painel" "dashboard"
ren "relatorios" "reports"
ren "resposta-automatica" "auto-reply"
ren "sessao-whatsapp" "whatsapp-session"
ren "sistema" "system"
ren "super-usuarios" "super-users"
ren "usuarios" "users"

echo Arquivos restantes renomeados com sucesso!
pause
