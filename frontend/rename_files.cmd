@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend"

:: Pasta atendimento
set "ATENDIMENTO_DIR=%BASE_DIR%\src\components\atendimento"
cd "%ATENDIMENTO_DIR%" || exit /b
if exist "AbasAtendimento.vue" ren "AbasAtendimento.vue" "AttendanceTabs.vue"
if exist "BannerEncaminharMensagem.vue" ren "BannerEncaminharMensagem.vue" "ForwardMessageBanner.vue"
if exist "BotoesAcaoMensagem.vue" ren "BotoesAcaoMensagem.vue" "MessageActionButtons.vue"
if exist "BotoesEnvio.vue" ren "BotoesEnvio.vue" "SendButtons.vue"
if exist "CabecalhoAtendimento.vue" ren "CabecalhoAtendimento.vue" "AttendanceHeader.vue"
if exist "CampoEntradaMensagem.vue" ren "CampoEntradaMensagem.vue" "MessageInputField.vue"
if exist "CampoEnvioArquivo.vue" ren "CampoEnvioArquivo.vue" "FileUploadField.vue"
if exist "ControlesGravacaoAudio.vue" ren "ControlesGravacaoAudio.vue" "AudioRecordingControls.vue"
if exist "Conversa.vue" ren "Conversa.vue" "Conversation.vue"
if exist "CronometroGravacao.vue" ren "CronometroGravacao.vue" "RecordingTimer.vue"
if exist "EntradaMensagem.vue" ren "EntradaMensagem.vue" "MessageInput.vue"
if exist "FiltrosAtendimento.vue" ren "FiltrosAtendimento.vue" "AttendanceFilters.vue"
if exist "GavetaAtendimentoDireita.vue" ren "GavetaAtendimentoDireita.vue" "RightAttendanceDrawer.vue"
if exist "GavetaAtendimentoEsquerda.vue" ren "GavetaAtendimentoEsquerda.vue" "LeftAttendanceDrawer.vue"
if exist "InfoCabecalhoConversa.vue" ren "InfoCabecalhoConversa.vue" "ConversationHeaderInfo.vue"
if exist "ItemAtendimentoContato.vue" ren "ItemAtendimentoContato.vue" "ContactAttendanceItem.vue"
if exist "ItemStatusWhatsapp.vue" ren "ItemStatusWhatsapp.vue" "WhatsappStatusItem.vue"
if exist "ItemTicket.vue" ren "ItemTicket.vue" "TicketItem.vue"
if exist "ListaInformacoesExtras.vue" ren "ListaInformacoesExtras.vue" "ExtraInformationList.vue"
if exist "ListaMensagensAgendadas.vue" ren "ListaMensagensAgendadas.vue" "ScheduledMessagesList.vue"
if exist "MensagemConversa.vue" ren "MensagemConversa.vue" "ConversationMessage.vue"
if exist "MenuMensagensRapidas.vue" ren "MenuMensagensRapidas.vue" "QuickMessagesMenu.vue"
if exist "ModalAgendamentoMensagem.vue" ren "ModalAgendamentoMensagem.vue" "MessageSchedulingModal.vue"
if exist "ModalPreVisualizacaoMidia.vue" ren "ModalPreVisualizacaoMidia.vue" "MediaPreviewModal.vue"
if exist "PreVisualizacaoMensagem.vue" ren "PreVisualizacaoMensagem.vue" "MessagePreview.vue"
if exist "PreVisualizacaoResposta.vue" ren "PreVisualizacaoResposta.vue" "ReplyPreview.vue"
if exist "SeletorCarteira.vue" ren "SeletorCarteira.vue" "WalletSelector.vue"
if exist "SeletorDataAgendamento.vue" ren "SeletorDataAgendamento.vue" "SchedulingDateSelector.vue"
if exist "SeletorEtiquetas.vue" ren "SeletorEtiquetas.vue" "TagSelector.vue"

:: Pasta campanhas
set "CAMPANHAS_DIR=%BASE_DIR%\src\components\campanhas"
cd "%CAMPANHAS_DIR%" || exit /b
if exist "Campanhas.vue" ren "Campanhas.vue" "Campaigns.vue"
if exist "DialogoCampanha.vue" ren "DialogoCampanha.vue" "CampaignDialog.vue"
if exist "ListaCampanhas.vue" ren "ListaCampanhas.vue" "CampaignsList.vue"
if exist "ModalAdicionarContatos.vue" ren "ModalAdicionarContatos.vue" "AddContactsModal.vue"
if exist "TabelaContatosCampanha.vue" ren "TabelaContatosCampanha.vue" "CampaignContactsTable.vue"

:: Pasta comum
set "COMUM_DIR=%BASE_DIR%\src\components\comum"
cd "%COMUM_DIR%" || exit /b
if exist "CartoesMultiplos.vue" ren "CartoesMultiplos.vue" "MultipleCards.vue"
if exist "EntradaPersonalizada.vue" ren "EntradaPersonalizada.vue" "CustomInput.vue"
if exist "LerMais.vue" ren "LerMais.vue" "ReadMore.vue"
if exist "MolduraCelular.vue" ren "MolduraCelular.vue" "PhoneFrame.vue"
if exist "SeletorData.vue" ren "SeletorData.vue" "DateSelector.vue"
if exist "SeletorDataHora.vue" ren "SeletorDataHora.vue" "DateTimeSelector.vue"
if exist "StatusUsuario.vue" ren "StatusUsuario.vue" "UserStatus.vue"

:: Pasta configuracoes
set "CONFIG_DIR=%BASE_DIR%\src\components\configuracoes"
cd "%CONFIG_DIR%" || exit /b
if exist "Settings.vue" ren "Settings.vue" "Settings.vue"

:: Pasta construtor-fluxo
set "FLUXO_DIR=%BASE_DIR%\src\components\construtor-fluxo"
cd "%FLUXO_DIR%" || exit /b
if exist "Ajuda.vue" ren "Ajuda.vue" "Help.vue"
if exist "CampoMensagem.vue" ren "CampoMensagem.vue" "MessageField.vue"
if exist "CampoMidia.vue" ren "CampoMidia.vue" "MediaField.vue"
if exist "CampoOpcoesMensagem.vue" ren "CampoOpcoesMensagem.vue" "MessageOptionsField.vue"
if exist "ConfiguracaoConexao.vue" ren "ConfiguracaoConexao.vue" "ConnectionConfig.vue"
if exist "ConfiguracaoNo.vue" ren "ConfiguracaoNo.vue" "NodeConfig.vue"
if exist "ConstrutorFluxo.vue" ren "ConstrutorFluxo.vue" "FlowBuilder.vue"
if exist "FormularioNo.vue" ren "FormularioNo.vue" "NodeForm.vue"
if exist "Informacao.vue" ren "Informacao.vue" "Information.vue"
if exist "MenuNo.vue" ren "MenuNo.vue" "NodeMenu.vue"
if exist "No.vue" ren "No.vue" "Node.vue"
if exist "Painel.vue" ren "Painel.vue" "Panel.vue"

:: Pasta estatisticas
set "STATS_DIR=%BASE_DIR%\src\components\estatisticas"
cd "%STATS_DIR%" || exit /b
if exist "CartaoEstatistica.vue" ren "CartaoEstatistica.vue" "StatisticsCard.vue"
if exist "Estatisticas.vue" ren "Estatisticas.vue" "Statistics.vue"

:: Pasta etiquetas
set "TAGS_DIR=%BASE_DIR%\src\components\etiquetas"
cd "%TAGS_DIR%" || exit /b
if exist "Etiquetas.vue" ren "Etiquetas.vue" "Tags.vue"
if exist "FormularioEtiqueta.vue" ren "FormularioEtiqueta.vue" "TagForm.vue"
if exist "ListaEtiquetas.vue" ren "ListaEtiquetas.vue" "TagsList.vue"

:: Pasta sessao-whatsapp
set "WHATSAPP_DIR=%BASE_DIR%\src\components\sessao-whatsapp"
cd "%WHATSAPP_DIR%" || exit /b
if exist "StatusWhatsapp.vue" ren "StatusWhatsapp.vue" "WhatsappStatus.vue"

:: Pasta sistema
set "SYSTEM_DIR=%BASE_DIR%\src\components\sistema"
cd "%SYSTEM_DIR%" || exit /b
if exist "LimiteErro.vue" ren "LimiteErro.vue" "ErrorLimit.vue"
if exist "Notificacao.vue" ren "Notificacao.vue" "Notification.vue"
if exist "PlanoFundoVideo.vue" ren "PlanoFundoVideo.vue" "VideoBackground.vue"
if exist "VersaoSistema.vue" ren "VersaoSistema.vue" "SystemVersion.vue"

:: Pasta usuarios
set "USERS_DIR=%BASE_DIR%\src\components\usuarios"
cd "%USERS_DIR%" || exit /b
if exist "LinkEssencial.vue" ren "LinkEssencial.vue" "EssentialLink.vue"
if exist "Usuarios.vue" ren "Usuarios.vue" "Users.vue"

:: Pasta composables/atendimento
set "COMPOSABLES_DIR=%BASE_DIR%\src\composables\atendimento"
cd "%COMPOSABLES_DIR%" || exit /b
if exist "useAtendimentoTabs.js" ren "useAtendimentoTabs.js" "useAttendanceTabs.js"

echo Arquivos renomeados com sucesso!
pause
