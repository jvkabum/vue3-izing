@echo off
cd /d "%~dp0"

:: Pasta atendimento
cd atendimento
ren "AtendimentoDrawerLeft.vue" "GavetaAtendimentoEsquerda.vue"
ren "AtendimentoDrawerRight.vue" "GavetaAtendimentoDireita.vue"
ren "AtendimentoFiltros.vue" "FiltrosAtendimento.vue"
ren "AtendimentoHeader.vue" "CabecalhoAtendimento.vue"
ren "AtendimentoTabs.vue" "AbasAtendimento.vue"
ren "AudioRecordingControls.vue" "ControlesGravacaoAudio.vue"
ren "Chat.vue" "Conversa.vue"
ren "FileUploadField.vue" "CampoEnvioArquivo.vue"
ren "ForwardMessageBanner.vue" "BannerEncaminharMensagem.vue"
ren "InfoCabecalhoChat.vue" "InfoCabecalhoConversa.vue"
ren "InputMensagem.vue" "EntradaMensagem.vue"
ren "MessageActionButtons.vue" "BotoesAcaoMensagem.vue"
ren "MessageInputField.vue" "CampoEntradaMensagem.vue"
ren "MessagePreview.vue" "PreVisualizacaoMensagem.vue"
ren "QuickMessagesMenu.vue" "MenuMensagensRapidas.vue"
ren "RecordingTimer.vue" "CronometroGravacao.vue"
ren "ReplyMessagePreview.vue" "PreVisualizacaoResposta.vue"
ren "ScheduleDatePicker.vue" "SeletorDataAgendamento.vue"
ren "ScheduledMessagesList.vue" "ListaMensagensAgendadas.vue"
ren "ScheduleMessageModal.vue" "ModalAgendamentoMensagem.vue"
ren "SendButtons.vue" "BotoesEnvio.vue"
ren "TagSelector.vue" "SeletorEtiquetas.vue"
ren "WalletSelector.vue" "SeletorCarteira.vue"
cd ..

:: Pasta campanhas
cd campanhas
ren "CampaignDialog.vue" "DialogoCampanha.vue"
ren "CampaignList.vue" "ListaCampanhas.vue"
ren "Campaigns.vue" "Campanhas.vue"
ren "CampanhaAddContatosModal.vue" "ModalAdicionarContatos.vue"
ren "CampanhaContatosTable.vue" "TabelaContatosCampanha.vue"
cd ..

:: Pasta comum
cd comum
ren "cDatePick.vue" "SeletorData.vue"
ren "cDateTimePick.vue" "SeletorDataHora.vue"
ren "cInput.vue" "EntradaPersonalizada.vue"
ren "cMolduraCelular.vue" "MolduraCelular.vue"
ren "cMultipleCards.vue" "CartoesMultiplos.vue"
ren "cStatusUsuario.vue" "StatusUsuario.vue"
ren "ReadMore.vue" "LerMais.vue"
cd ..

:: Pasta construtor-fluxo
cd construtor-fluxo
ren "ConnectionConfig.vue" "ConfiguracaoConexao.vue"
ren "FlowBuilder.vue" "ConstrutorFluxo.vue"
ren "defaultFlow.js" "fluxoPadrao.js"
ren "force-directed.js" "direcaoForcada.js"
ren "help.vue" "Ajuda.vue"
ren "info.vue" "Informacao.vue"
ren "mediaField.vue" "CampoMidia.vue"
ren "messageField.vue" "CampoMensagem.vue"
ren "messageOptionsField.vue" "CampoOpcoesMensagem.vue"
ren "node_form.vue" "FormularioNo.vue"
ren "node_menu.vue" "MenuNo.vue"
ren "node.vue" "No.vue"
ren "NodeConfig.vue" "ConfiguracaoNo.vue"
ren "panel.vue" "Painel.vue"
ren "utils.js" "utilidades.js"
cd ..

:: Pasta estatisticas
cd estatisticas
ren "StatCard.vue" "CartaoEstatistica.vue"
ren "Statistics.vue" "Estatisticas.vue"
cd ..

:: Pasta etiquetas
cd etiquetas
ren "TagForm.vue" "FormularioEtiqueta.vue"
ren "TagList.vue" "ListaEtiquetas.vue"
ren "Tags.vue" "Etiquetas.vue"
cd ..

:: Pasta sistema
cd sistema
ren "cSystemVersion.vue" "VersaoSistema.vue"
ren "ErrorBoundary.vue" "LimiteErro.vue"
ren "Notification.vue" "Notificacao.vue"
ren "VideoBackground.vue" "PlanoFundoVideo.vue"
cd ..

:: Pasta usuarios
cd usuarios
ren "EssentialLink.vue" "LinkEssencial.vue"
ren "Users.vue" "Usuarios.vue"
cd ..

echo Arquivos renomeados com sucesso!
pause
