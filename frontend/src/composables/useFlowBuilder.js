import { reactive } from 'vue'

export function useFlowBuilder() {
  const jsplumbSetting = reactive({
    // Anchors dinâmicos, posição adaptativa
    Anchors: ['Top', 'TopCenter', 'TopRight', 'TopLeft', 'Right', 'RightMiddle', 'Bottom', 'BottomCenter', 'BottomRight', 'BottomLeft', 'Left', 'LeftMiddle'],
    // ID do container
    Container: 'efContainer',
    // Estilo da conexão, linha reta ou curva
    Connector: ['Bezier', { curviness: 100 }],
    // Não permite arrastar para deletar conexão
    ConnectionsDetachable: false,
    // Não deleta endpoints ao desconectar
    DeleteEndpointsOnDetach: false,
    // Endpoint vazio
    Endpoint: ['Blank', { Overlays: '' }],
    // Estilo do endpoint
    EndpointStyle: { fill: '#1879ffa1', outlineWidth: 1 },
    // Logs internos do jsPlumb
    LogEnabled: true,
    // Estilo da pintura
    PaintStyle: {
      stroke: '#E0E3E7',
      strokeWidth: 1,
      outlineStroke: 'transparent',
      outlineWidth: 10
    },
    DragOptions: { cursor: 'pointer', zIndex: 2000 },
    // Overlays
    Overlays: [
      ['Arrow', {
        width: 10,
        length: 8,
        location: 1,
        direction: 1,
        foldback: 0.623
      }],
      ['Label', {
        label: '',
        location: 0.1,
        cssClass: 'aLabel'
      }]
    ],
    // Modo de renderização
    RenderMode: 'svg',
    // Estilo hover
    HoverPaintStyle: { stroke: '#b0b2b5', strokeWidth: 1 },
    // Scope padrão
    Scope: 'jsPlumb_DefaultScope'
  })

  const jsplumbConnectOptions = reactive({
    isSource: true,
    isTarget: true,
    anchor: 'Continuous',
    labelStyle: {
      cssClass: 'flowLabel'
    },
    emptyLabelStyle: {
      cssClass: 'emptyFlowLabel'
    }
  })

  const jsplumbSourceOptions = reactive({
    filter: '.flow-node-drag',
    filterExclude: false,
    anchor: 'Continuous',
    allowLoopback: true,
    maxConnections: -1,
    onMaxConnections: (info) => {
      console.log(`Máximo de conexões atingido: ${info.maxConnections}`)
    }
  })

  const jsplumbSourceOptions2 = reactive({
    filter: '.flow-node-drag',
    filterExclude: false,
    allowLoopback: true,
    connector: ['Flowchart', { curviness: 50 }],
    connectorStyle: {
      stroke: 'red',
      strokeWidth: 1,
      outlineStroke: 'transparent',
      outlineWidth: 10
    },
    connectorHoverStyle: { stroke: 'red', strokeWidth: 2 }
  })

  const jsplumbTargetOptions = reactive({
    filter: '.flow-node-drag',
    filterExclude: false,
    anchor: 'Continuous',
    allowLoopback: true,
    dropOptions: { hoverClass: 'ef-drop-hover' }
  })

  return {
    jsplumbSetting,
    jsplumbConnectOptions,
    jsplumbSourceOptions,
    jsplumbSourceOptions2,
    jsplumbTargetOptions
  }
}
