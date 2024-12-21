@echo off
cd /d "%~dp0"

:: Campanhas
cd campanhas
ren "useCampaigns.js" "usesCampanhas.js"
ren "useCampanhaContatos.js" "useContatosCampanha.js"
ren "useCampanhaModal.js" "useModalCampanha.js"
ren "useCampanhas.js" "useCampanhas.js"
cd ..

:: Nucleo
cd nucleo
ren "useCache.js" "useCache.js"
ren "useErrorHandler.js" "useTratadorErros.js"
ren "useImageOptimizer.js" "useOtimizadorImagem.js"
ren "useLoadingState.js" "useEstadoCarregamento.js"
ren "useLogger.js" "useRegistrador.js"
ren "useOffline.js" "useModoOffline.js"
ren "useRequestCache.js" "useCacheRequisicao.js"
ren "useStore.js" "useArmazenamento.js"
cd ..

echo Arquivos renomeados com sucesso!
pause
