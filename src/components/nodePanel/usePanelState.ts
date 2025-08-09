import { ref, type Ref } from 'vue';
import type { PanelState } from './types';

/**
 * Composable para manejo del estado del panel (colapso/expansión)
 */
export function usePanelState(initialCollapsed: boolean = false) {
  // Estado reactivo
  const collapsed = ref<boolean>(initialCollapsed);
  
  /**
   * Alterna el estado colapsado del panel
   */
  function toggle(): void {
    collapsed.value = !collapsed.value;
    console.log(`📋 Panel ${collapsed.value ? 'collapsed' : 'expanded'}`);
  }
  
  /**
   * Colapsa el panel
   */
  function collapse(): void {
    if (!collapsed.value) {
      collapsed.value = true;
      console.log('📋 Panel collapsed');
    }
  }
  
  /**
   * Expande el panel
   */
  function expand(): void {
    if (collapsed.value) {
      collapsed.value = false;
      console.log('📋 Panel expanded');
    }
  }
  
  /**
   * Establece el estado de colapso
   * @param isCollapsed - Nuevo estado
   */
  function setCollapsed(isCollapsed: boolean): void {
    if (collapsed.value !== isCollapsed) {
      collapsed.value = isCollapsed;
      console.log(`📋 Panel ${isCollapsed ? 'collapsed' : 'expanded'}`);
    }
  }
  
  /**
   * Obtiene el estado actual como objeto
   * @returns Estado del panel
   */
  function getState(): PanelState {
    return {
      collapsed: collapsed.value
    };
  }
  
  return {
    // Estado reactivo
    collapsed: collapsed as Ref<boolean>,
    
    // Métodos
    toggle,
    collapse,
    expand,
    setCollapsed,
    getState
  };
}
