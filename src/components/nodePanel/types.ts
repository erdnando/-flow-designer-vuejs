/**
 * Tipos para el sistema NodePanel
 */

/**
 * Representación de un nodo en el panel
 */
export interface NodeItem {
  type: string;
  label: string;
  templateId?: string;
  icon?: string;
  defaultData?: Record<string, any>;
}

/**
 * Categoría de nodos
 */
export interface NodeCategory {
  name: string;
  nodes: NodeItem[];
}

/**
 * Estado del panel (colapsado/expandido)
 */
export interface PanelState {
  collapsed: boolean;
}

/**
 * Estado de búsqueda
 */
export interface SearchState {
  query: string;
  filteredCategories: NodeCategory[];
}

/**
 * Estado del acordeón de categorías
 */
export interface CategoryState {
  expandedCategories: Set<string>;
}

/**
 * Datos para drag & drop
 */
export interface DragData {
  nodeType: string;
  templateId?: string;
  defaultData?: Record<string, any>;
}

/**
 * Metadatos de tipo de nodo
 */
export interface NodeTypeMeta {
  icon: string;
  color?: string;
  category?: string;
}

/**
 * Props del componente principal
 */
export interface NodePanelProps {
  initialCollapsed?: boolean;
  defaultExpandedCategories?: string[];
}

/**
 * Eventos emitidos por NodePanel
 */
export interface NodePanelEvents {
  'panel-toggle': [collapsed: boolean];
  'node-drag-start': [data: DragData, event: DragEvent];
  'category-toggle': [categoryName: string, expanded: boolean];
  'search-change': [query: string];
}

/**
 * Configuración de categorías estáticas
 */
export interface StaticCategoryConfig {
  name: string;
  nodes: Omit<NodeItem, 'templateId'>[];
  defaultExpanded?: boolean;
}
