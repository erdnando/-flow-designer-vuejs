// Integración del componente CustomDialog en FlowCanvas.vue

// 1. Importar el componente
import CustomDialog from '@/components/CustomDialog.vue';

// 2. Definir los estados para los diálogos
const showClearFlowDialog = ref(false);
const showDeleteNodeDialog = ref(false);
const nodeToDelete = ref(null);
const nodeIndexToDelete = ref(-1);

// 3. Funciones para manejar la limpieza del flujo
function clearFlow() {
  // Mostrar el diálogo de confirmación
  showClearFlowDialog.value = true;
}

function confirmClearFlow() {
  // Limpiar nodos y edges
  nodes.value = [];
  edges.value = [];

  // Limpiar selección y mostrar propiedades del proyecto
  selectedNodeId.value = null;
  selectedNode.value = null;
  // ... código adicional para limpiar el flujo
  
  // También limpiar localStorage
  localStorage.removeItem('flow_data');
  
  // Mostrar notificación de éxito
  showSuccess('Flujo limpiado', {
    description: 'Se han eliminado todos los nodos y conexiones'
  });
}

// 4. Funciones para manejar la eliminación de nodos
function onNodeDelete(nodeId) {
  const nodeIndex = nodes.value.findIndex(n => n.id === nodeId);
  if (nodeIndex !== -1) {
    // Guardar referencia del nodo e índice para usarlo cuando se confirme la eliminación
    nodeToDelete.value = nodes.value[nodeIndex];
    nodeIndexToDelete.value = nodeIndex;
    
    // Mostrar diálogo de confirmación
    showDeleteNodeDialog.value = true;
  }
}

function confirmDeleteNode() {
  if (!nodeToDelete.value) return;
  
  // Obtener datos antes de eliminar
  const nodeLabel = nodeToDelete.value.label || nodeToDelete.value.type || 'Nodo';
  const deletedNode = nodeToDelete.value;
  const nodeIndex = nodeIndexToDelete.value;
  
  // Eliminar el nodo
  nodes.value.splice(nodeIndex, 1);
  
  // Mostrar notificación con opción de deshacer
  showWarning('Nodo eliminado', {
    description: `Se eliminó el nodo "${nodeLabel}"`,
    actions: [
      {
        label: 'Deshacer',
        action: () => {
          // Restaurar el nodo eliminado
          nodes.value.splice(nodeIndex, 0, deletedNode);
        }
      }
    ]
  });
  
  // Resetear variables
  nodeToDelete.value = null;
  nodeIndexToDelete.value = -1;
}

function cancelDeleteNode() {
  // Simplemente resetear las variables y cerrar el diálogo
  nodeToDelete.value = null;
  nodeIndexToDelete.value = -1;
  showDeleteNodeDialog.value = false;
}

// 5. Plantilla de ejemplo para los diálogos
/*
<template>
  <!-- Otros componentes -->
  
  <!-- Diálogo de confirmación para limpieza del flujo -->
  <CustomDialog 
    v-model="showClearFlowDialog"
    title="Confirmar limpieza"
    message="¿Estás seguro de que deseas limpiar el flujo? Esta acción eliminará todos los nodos y conexiones."
    type="warning"
    :show-icon="true"
    :show-cancel-button="true"
    cancel-button-text="Cancelar"
    confirm-button-text="Sí, limpiar"
    confirm-button-type="danger"
    @confirm="confirmClearFlow"
    @cancel="showClearFlowDialog = false"
  />
  
  <!-- Diálogo de confirmación para eliminar nodo -->
  <CustomDialog 
    v-if="nodeToDelete"
    v-model="showDeleteNodeDialog"
    :title="`Eliminar nodo ${nodeToDelete?.label || nodeToDelete?.type || 'sin nombre'}`"
    message="¿Estás seguro de que deseas eliminar este nodo?"
    note="Esta acción eliminará también todas las conexiones asociadas a este nodo."
    type="error"
    :show-icon="true"
    :show-cancel-button="true"
    cancel-button-text="Cancelar"
    confirm-button-text="Eliminar"
    confirm-button-type="danger"
    @confirm="confirmDeleteNode"
    @cancel="cancelDeleteNode"
  />
</template>
*/
