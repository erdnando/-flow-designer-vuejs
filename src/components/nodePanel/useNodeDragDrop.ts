import type { NodeItem, DragData } from './types';
import { DRAG_DROP_CONFIG } from './constants';

/**
 * Composable para funcionalidad de Drag & Drop de nodos
 */
export function useNodeDragDrop() {
  
  /**
   * Maneja el inicio del drag de un nodo
   * @param node - Nodo que se está arrastrando
   * @param event - Evento de drag
   */
  function onDragStart(node: NodeItem, event: DragEvent): void {
    if (!event.dataTransfer) {
      console.warn('⚠️ DataTransfer not available for drag operation');
      return;
    }
    
    try {
      // Configurar el efecto de drag
      event.dataTransfer.effectAllowed = DRAG_DROP_CONFIG.DRAG_EFFECT;
      
      // Datos básicos del nodo
      event.dataTransfer.setData(
        DRAG_DROP_CONFIG.MIME_TYPES.NODE_TYPE, 
        node.type
      );
      
      // Datos adicionales para nodos del catálogo
      if (node.templateId) {
        event.dataTransfer.setData(
          DRAG_DROP_CONFIG.MIME_TYPES.TEMPLATE_ID, 
          node.templateId
        );
      }
      
      if (node.defaultData) {
        event.dataTransfer.setData(
          DRAG_DROP_CONFIG.MIME_TYPES.DEFAULT_DATA, 
          JSON.stringify(node.defaultData)
        );
      }
      
      console.log(`🎯 Drag started for node: ${node.type} (${node.label})`);
      
      // Log para debugging
      logDragData(node);
      
    } catch (error) {
      console.error('❌ Error setting drag data:', error);
    }
  }
  
  /**
   * Crea los datos de drag para un nodo
   * @param node - Nodo
   * @returns Datos de drag
   */
  function createDragData(node: NodeItem): DragData {
    return {
      nodeType: node.type,
      templateId: node.templateId,
      defaultData: node.defaultData
    };
  }
  
  /**
   * Extrae datos de drag desde un DataTransfer
   * @param dataTransfer - DataTransfer del evento
   * @returns Datos de drag extraídos
   */
  function extractDragData(dataTransfer: DataTransfer): DragData | null {
    try {
      const nodeType = dataTransfer.getData(DRAG_DROP_CONFIG.MIME_TYPES.NODE_TYPE);
      
      if (!nodeType) {
        return null;
      }
      
      const templateId = dataTransfer.getData(DRAG_DROP_CONFIG.MIME_TYPES.TEMPLATE_ID) || undefined;
      
      let defaultData: Record<string, any> | undefined;
      const defaultDataStr = dataTransfer.getData(DRAG_DROP_CONFIG.MIME_TYPES.DEFAULT_DATA);
      
      if (defaultDataStr) {
        try {
          defaultData = JSON.parse(defaultDataStr);
        } catch (error) {
          console.warn('⚠️ Failed to parse default data from drag transfer:', error);
        }
      }
      
      return {
        nodeType,
        templateId,
        defaultData
      };
      
    } catch (error) {
      console.error('❌ Error extracting drag data:', error);
      return null;
    }
  }
  
  /**
   * Valida si un evento de drag contiene datos válidos de nodo
   * @param event - Evento de drag
   * @returns true si contiene datos válidos
   */
  function isValidNodeDrag(event: DragEvent): boolean {
    if (!event.dataTransfer) {
      return false;
    }
    
    const types = Array.from(event.dataTransfer.types);
    return types.includes(DRAG_DROP_CONFIG.MIME_TYPES.NODE_TYPE);
  }
  
  /**
   * Obtiene información sobre el tipo de nodo siendo arrastrado
   * @param event - Evento de drag
   * @returns Información del nodo o null
   */
  function getDragNodeInfo(event: DragEvent): { type: string; isTemplate: boolean } | null {
    if (!event.dataTransfer || !isValidNodeDrag(event)) {
      return null;
    }
    
    const nodeType = event.dataTransfer.getData(DRAG_DROP_CONFIG.MIME_TYPES.NODE_TYPE);
    const isTemplate = event.dataTransfer.types.includes(DRAG_DROP_CONFIG.MIME_TYPES.TEMPLATE_ID);
    
    return {
      type: nodeType,
      isTemplate
    };
  }
  
  /**
   * Crea un ghost image personalizado para el drag (opcional)
   * @param node - Nodo que se arrastra
   * @param event - Evento de drag
   */
  function setCustomDragImage(node: NodeItem, event: DragEvent): void {
    try {
      // Crear elemento temporal para el ghost
      const dragGhost = document.createElement('div');
      dragGhost.style.cssText = `
        background: #23272e;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        position: absolute;
        top: -1000px;
        left: -1000px;
        pointer-events: none;
        white-space: nowrap;
      `;
      dragGhost.textContent = node.label;
      
      document.body.appendChild(dragGhost);
      
      if (event.dataTransfer) {
        event.dataTransfer.setDragImage(dragGhost, 50, 20);
      }
      
      // Limpiar después de un frame
      setTimeout(() => {
        document.body.removeChild(dragGhost);
      }, 0);
      
    } catch (error) {
      console.warn('⚠️ Failed to set custom drag image:', error);
    }
  }
  
  /**
   * Log de datos de drag para debugging
   * @param node - Nodo siendo arrastrado
   */
  function logDragData(node: NodeItem): void {
    console.log('🎯 Drag Data:', {
      type: node.type,
      label: node.label,
      templateId: node.templateId,
      hasDefaultData: !!node.defaultData,
      defaultData: node.defaultData
    });
  }
  
  /**
   * Obtiene estadísticas de operaciones de drag
   */
  function getDragStats() {
    // En una implementación más completa, esto podría rastrear métricas
    return {
      mimeTypes: DRAG_DROP_CONFIG.MIME_TYPES,
      dragEffect: DRAG_DROP_CONFIG.DRAG_EFFECT
    };
  }
  
  return {
    // Métodos principales
    onDragStart,
    createDragData,
    extractDragData,
    
    // Métodos de validación
    isValidNodeDrag,
    getDragNodeInfo,
    
    // Métodos de utilidad
    setCustomDragImage,
    logDragData,
    getDragStats
  };
}
