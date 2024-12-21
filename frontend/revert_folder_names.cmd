@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend"

:: Reverter pastas em src/components
cd "%BASE_DIR%\src\components" || exit /b
ren "attendance" "atendimento"
ren "campaigns" "campanhas"
ren "common" "comum"
ren "settings" "configuracoes"
ren "flow-builder" "construtor-fluxo"
ren "contacts" "contatos"
ren "companies" "empresas"
ren "statistics" "estatisticas"
ren "tags" "etiquetas"
ren "queues" "filas"
ren "chat-flow" "fluxo-chat"
ren "schedules" "horarios"
ren "quick-messages" "mensagens-rapidas"
ren "dashboard" "painel"
ren "reports" "relatorios"
ren "auto-reply" "resposta-automatica"
ren "whatsapp-session" "sessao-whatsapp"
ren "system" "sistema"
ren "super-users" "super-usuarios"
ren "users" "usuarios"

:: Reverter pastas em src/composables
cd "%BASE_DIR%\src\composables" || exit /b
ren "attendance" "atendimento"
ren "authentication" "autenticacao"
ren "campaigns" "campanhas"
ren "tickets" "chamados"
ren "common" "comum"
ren "settings" "configuracoes"
ren "contacts" "contatos"
ren "date-time" "data-hora"
ren "company" "empresa"
ren "statistics" "estatisticas"
ren "tags" "etiquetas"
ren "queue" "fila"
ren "flow" "fluxo"
ren "integrations" "integracoes"
ren "ui" "interface"
ren "quick-messages" "mensagens-rapidas"
ren "core" "nucleo"
ren "social-networks" "redes-sociais"
ren "reports" "relatorios"
ren "security" "seguranca"
ren "system" "sistema"
ren "users" "usuarios"
ren "dashboard" "painel"
ren "scheduling" "agendamento"

echo Nomes das pastas revertidos para português com sucesso!
pause
