@echo off
cd /d "%~dp0"

ren "useCache.js" "useCache.js"
ren "useImageOptimizer.js" "useOtimizadorImagem.js"
ren "useLoadingState.js" "useEstadoCarregamento.js"
ren "useLogger.js" "useRegistrador.js"
ren "useOffline.js" "useModoOffline.js"
ren "useRequestCache.js" "useCacheRequisicao.js"
ren "useStore.js" "useArmazenamento.js"

echo Arquivos renomeados com sucesso!
pause
