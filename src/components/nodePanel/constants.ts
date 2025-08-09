import type { StaticCategoryConfig } from './types';

/**
 * Configuraciones estáticas del NodePanel
 */

/**
 * Categorías estáticas predefinidas
 */
export const STATIC_CATEGORIES: StaticCategoryConfig[] = [
  {
    name: 'Control de flujo',
    defaultExpanded: true,
    nodes: [
      { type: 'start', label: 'INICIO' },
      // { type: 'condition', label: 'Condición (If)' }, // Temporalmente oculto
      { type: 'end', label: 'FIN' },
    ],
  },
];

/**
 * Categorías expandidas por defecto
 */
export const DEFAULT_EXPANDED_CATEGORIES = [
  'Control de flujo', 
  'Proceso', 
  'Motores de decisión'
];

/**
 * Configuración del panel
 */
export const PANEL_CONFIG = {
  /**
   * Ancho del panel cuando está expandido (px)
   */
  EXPANDED_WIDTH: 280,
  
  /**
   * Ancho del panel cuando está colapsado (px)
   */
  COLLAPSED_WIDTH: 36,
  
  /**
   * Altura del header (px)
   */
  HEADER_HEIGHT: 44,
  
  /**
   * Duración de la transición de colapso (ms)
   */
  COLLAPSE_TRANSITION_DURATION: 200,
  
  /**
   * Placeholder para búsqueda
   */
  SEARCH_PLACEHOLDER: 'Buscar nodo...',
  
  /**
   * Título del panel
   */
  PANEL_TITLE: 'Originación',
} as const;

/**
 * Clases CSS para el panel
 */
export const PANEL_CLASSES = {
  PANEL: 'node-panel',
  COLLAPSED: 'collapsed',
  HEADER: 'panel-header',
  CONTENT: 'panel-content',
  SEARCH: 'search',
  ACCORDION_CONTAINER: 'accordion-container',
  ACCORDION_SECTION: 'accordion-section',
  ACCORDION_HEADER: 'accordion-header',
  ACCORDION_CONTENT: 'accordion-content',
  NODE_GRID: 'node-grid',
  NODE_CARD: 'node-card',
} as const;

/**
 * Configuración de drag and drop
 */
export const DRAG_DROP_CONFIG = {
  /**
   * Tipos MIME para transferencia de datos
   */
  MIME_TYPES: {
    NODE_TYPE: 'application/reactflow-node-type',
    TEMPLATE_ID: 'application-template-id', 
    DEFAULT_DATA: 'application-default-data',
  },
  
  /**
   * Efectos permitidos para drag
   */
  DRAG_EFFECT: 'copy' as DataTransfer['effectAllowed'],
} as const;

/**
 * Configuración de iconos SVG
 */
export const ICONS = {
  /**
   * Icono para colapsar panel (hacia la izquierda)
   */
  COLLAPSE_LEFT: {
    viewBox: '0 0 24 24',
    path: `
      <path d="M13.5 7L9.5 12L13.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 7L13 12L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  
  /**
   * Icono para expandir panel (hacia la derecha)
   */
  EXPAND_RIGHT: {
    viewBox: '0 0 24 24', 
    path: `
      <path d="M10.5 7L14.5 12L10.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 7L11 12L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  
  /**
   * Icono para acordeón (flecha hacia abajo)
   */
  ACCORDION_ARROW: {
    viewBox: '0 0 12 12',
    path: '<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  }
} as const;

/**
 * Z-index del panel
 */
export const PANEL_Z_INDEX = 20;
