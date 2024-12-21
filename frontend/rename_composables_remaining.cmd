@echo off
setlocal enabledelayedexpansion

set "BASE_DIR=D:\izing\Git Hub\vue3-izing\frontend\src\composables"

:: Renomear pastas
cd "%BASE_DIR%" || exit /b
ren "agendamento" "scheduling"
ren "autenticacao" "authentication"
ren "campanhas" "campaigns"
ren "chamados" "tickets"
ren "comum" "common"
ren "configuracoes" "settings"
ren "contatos" "contacts"
ren "data-hora" "date-time"
ren "empresa" "company"
ren "estatisticas" "statistics"
ren "etiquetas" "tags"
ren "fila" "queue"
ren "fluxo" "flow"
ren "integracoes" "integrations"
ren "interface" "ui"
ren "mensagens-rapidas" "quick-messages"
ren "nucleo" "core"
ren "redes-sociais" "social-networks"
ren "relatorios" "reports"
ren "seguranca" "security"
ren "sistema" "system"
ren "templates" "templates"
ren "usuarios" "users"

:: Renomear arquivos em scheduling (antigo agendamento)
cd "%BASE_DIR%\scheduling" || exit /b
ren "useAgendamento.js" "useScheduling.js"
ren "useHorariosTrabalho.js" "useWorkHours.js"
ren "useMensagensAgendadas.js" "useScheduledMessages.js"

:: Renomear arquivos em api
cd "%BASE_DIR%\api" || exit /b
ren "useChavesApi.js" "useApiKeys.js"

:: Renomear arquivos em audio
cd "%BASE_DIR%\audio" || exit /b
ren "useGravadorAudio.js" "useAudioRecorder.js"
ren "useReprodutorMidia.js" "useMediaPlayer.js"

:: Renomear arquivos em authentication (antigo autenticacao)
cd "%BASE_DIR%\authentication" || exit /b
ren "useAutenticacao.js" "useAuthentication.js"
ren "useSessao.js" "useSession.js"

:: Renomear arquivos em campaigns (antigo campanhas)
cd "%BASE_DIR%\campaigns" || exit /b
ren "useCampanhas.js" "useCampaigns.js"
ren "useContatosCampanha.js" "useCampaignContacts.js"
ren "useModalCampanha.js" "useCampaignModal.js"
ren "usesCampanhas.js" "useCampaigns.js"

:: Renomear arquivos em tickets (antigo chamados)
cd "%BASE_DIR%\tickets" || exit /b
ren "useAtendimentoChamado.js" "useTicketAttendance.js"
ren "useChamados.js" "useTickets.js"
ren "useStatusChamado.js" "useTicketStatus.js"

:: Renomear arquivos em chat
cd "%BASE_DIR%\chat" || exit /b
ren "useConversa.js" "useConversation.js"
ren "useFluxoConversa.js" "useConversationFlow.js"
ren "useFormatadorMensagem.js" "useMessageFormatter.js"
ren "useMensagem.js" "useMessage.js"
ren "useMensagens.js" "useMessages.js"

:: Renomear arquivos em common (antigo comum)
cd "%BASE_DIR%\common" || exit /b
ren "useFormulario.js" "useForm.js"
ren "useValidacao.js" "useValidation.js"

:: Renomear arquivos em settings (antigo configuracoes)
cd "%BASE_DIR%\settings" || exit /b
ren "useConfiguracoes.js" "useSettings.js"
ren "useTema.js" "useTheme.js"

:: Renomear arquivos em contacts (antigo contatos)
cd "%BASE_DIR%\contacts" || exit /b
ren "useContato.js" "useContact.js"
ren "useContatos.js" "useContacts.js"
ren "useExportacaoContatos.js" "useContactsExport.js"
ren "useGruposContatos.js" "useContactGroups.js"
ren "useImportacaoContatos.js" "useContactsImport.js"
ren "useListasContatos.js" "useContactLists.js"

:: Renomear arquivos em date-time (antigo data-hora)
cd "%BASE_DIR%\date-time" || exit /b
ren "useDataHora.js" "useDateTime.js"
ren "useFusoHorario.js" "useTimeZone.js"
ren "useIntervaloTempo.js" "useTimeInterval.js"

:: Renomear arquivos em company (antigo empresa)
cd "%BASE_DIR%\company" || exit /b
ren "useAssinatura.js" "useSignature.js"
ren "useConfigApp.js" "useAppConfig.js"
ren "useEmpresa.js" "useCompany.js"
ren "useFaturas.js" "useInvoices.js"
ren "useUsuariosApp.js" "useAppUsers.js"

:: Renomear arquivos em statistics (antigo estatisticas)
cd "%BASE_DIR%\statistics" || exit /b
ren "useEstatisticas.js" "useStatistics.js"
ren "useMetricas.js" "useMetrics.js"

:: Renomear arquivos em tags (antigo etiquetas)
cd "%BASE_DIR%\tags" || exit /b
ren "useCorEtiqueta.js" "useTagColor.js"
ren "useEtiquetas.js" "useTags.js"
ren "useGerenciadorEtiquetas.js" "useTagManager.js"

:: Renomear arquivos em queue (antigo fila)
cd "%BASE_DIR%\queue" || exit /b
ren "useConfigFila.js" "useQueueConfig.js"
ren "useFila.js" "useQueue.js"
ren "useFilas.js" "useQueues.js"
ren "usePainelFila.js" "useQueuePanel.js"

:: Renomear arquivos em flow (antigo fluxo)
cd "%BASE_DIR%\flow" || exit /b
ren "useConstrutorFluxo.js" "useFlowBuilder.js"
ren "useEstadoConstrutorFluxo.js" "useFlowBuilderState.js"
ren "useFluxoChat.js" "useChatFlow.js"
ren "useRespostaAutomatica.js" "useAutoReply.js"

:: Renomear arquivos em integrations (antigo integracoes)
cd "%BASE_DIR%\integrations" || exit /b
ren "useEventosSocket.js" "useSocketEvents.js"
ren "useIntegracoes.js" "useIntegrations.js"
ren "useLogsIntegracao.js" "useIntegrationLogs.js"

:: Renomear arquivos em ui (antigo interface)
cd "%BASE_DIR%\ui" || exit /b
ren "useAcessibilidade.js" "useAccessibility.js"
ren "useAnimacao.js" "useAnimation.js"
ren "useAtalhos.js" "useShortcuts.js"
ren "useCarregamento.js" "useLoading.js"
ren "useEnvio.js" "useSend.js"
ren "useEnvioArquivo.js" "useFileUpload.js"
ren "useIdioma.js" "useLanguage.js"
ren "useInteracao.js" "useInteraction.js"
ren "useModoEscuro.js" "useDarkMode.js"
ren "useNavegacao.js" "useNavigation.js"
ren "useResponsividade.js" "useResponsiveness.js"
ren "useRolagem.js" "useScroll.js"

:: Renomear arquivos em quick-messages (antigo mensagens-rapidas)
cd "%BASE_DIR%\quick-messages" || exit /b
ren "useMensagensRapidas.js" "useQuickMessages.js"
ren "useRespostasInstantaneas.js" "useInstantReplies.js"
ren "useRespostasRapidas.js" "useQuickReplies.js"

:: Renomear arquivos em core (antigo nucleo)
cd "%BASE_DIR%\core" || exit /b
ren "useArmazenamento.js" "useStorage.js"
ren "useCacheRequisicao.js" "useRequestCache.js"
ren "useEstadoCarregamento.js" "useLoadingState.js"
ren "useModoOffline.js" "useOfflineMode.js"
ren "useOtimizadorImagem.js" "useImageOptimizer.js"
ren "useRegistrador.js" "useLogger.js"
ren "useTratadorErros.js" "useErrorHandler.js"

:: Renomear arquivos em social-networks (antigo redes-sociais)
cd "%BASE_DIR%\social-networks" || exit /b
ren "useCanais.js" "useChannels.js"

:: Renomear arquivos em reports (antigo relatorios)
cd "%BASE_DIR%\reports" || exit /b
ren "useAuditoria.js" "useAudit.js"
ren "useAvaliacoes.js" "useRatings.js"
ren "usePainel.js" "useDashboard.js"
ren "useRelatorios.js" "useReports.js"

:: Renomear arquivos em security (antigo seguranca)
cd "%BASE_DIR%\security" || exit /b
ren "useListaNegra.js" "useBlacklist.js"
ren "usePermissoes.js" "usePermissions.js"

:: Renomear arquivos em templates
cd "%BASE_DIR%\templates" || exit /b
ren "useModelos.js" "useTemplates.js"
ren "useSaudacoes.js" "useGreetings.js"
ren "useTransferencia.js" "useTransfer.js"

:: Renomear arquivos em users (antigo usuarios)
cd "%BASE_DIR%\users" || exit /b
ren "usePreferenciasUsuario.js" "useUserPreferences.js"
ren "useStatusUsuario.js" "useUserStatus.js"
ren "useUsuario.js" "useUser.js"
ren "useUsuarios.js" "useUsers.js"

echo Todos os composables foram renomeados com sucesso!
pause
