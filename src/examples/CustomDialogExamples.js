// Ejemplos de uso del componente CustomDialog

/*
 * 1. Importar el componente CustomDialog
 */
import CustomDialog from '@/components/CustomDialog.vue';

/*
 * 2. Definir los estados para controlar la visibilidad de los diálogos
 */
import { ref } from 'vue';

// Estado para cada tipo de diálogo
const showDeleteDialog = ref(false);
const showWarningDialog = ref(false);
const showConfirmationDialog = ref(false);

/*
 * 3. Definir las funciones para manejar las acciones del diálogo
 */
// Para diálogo de eliminación
function onDeleteConfirm() {
  // Lógica para eliminar el elemento
  console.log('Elemento eliminado');
  // Aquí iría tu código para eliminar el nodo, documento, etc.
}

// Para diálogo de advertencia
function onWarningConfirm() {
  // Lógica para proceder a pesar de las advertencias
  console.log('Procediendo con advertencias');
}

// Para diálogo de confirmación
function onActionConfirm() {
  // Lógica para confirmar la acción
  console.log('Acción confirmada');
}

/*
 * 4. Ejemplos de uso en la plantilla
 */

// Ejemplo 1: Diálogo de eliminación (similar a la primera imagen)
<template>
  <!-- Botón que abre el diálogo -->
  <el-button @click="showDeleteDialog = true" type="danger">
    Eliminar nodo
  </el-button>
  
  <!-- Diálogo de eliminación -->
  <CustomDialog
    v-model="showDeleteDialog"
    title="Eliminar nodo Step"
    message="¿Estás seguro de que deseas eliminar este nodo?"
    warning="Este nodo tiene advertencias que podrían afectar al flujo."
    note="Esta acción no se puede deshacer y eliminará también todas las conexiones asociadas."
    :show-cancel-button="true"
    cancel-button-text="Cancelar"
    confirm-button-text="Eliminar"
    confirm-button-type="danger"
    confirm-button-class="el-button--danger"
    @confirm="onDeleteConfirm"
    @cancel="console.log('Eliminación cancelada')"
  />
</template>

// Ejemplo 2: Diálogo de confirmación de limpieza (similar a la segunda imagen)
<template>
  <!-- Botón que abre el diálogo -->
  <el-button @click="showConfirmationDialog = true">
    Limpiar flujo
  </el-button>
  
  <!-- Diálogo de confirmación simple -->
  <CustomDialog
    v-model="showConfirmationDialog"
    title="Confirmar limpieza"
    message="¿Estás seguro de que deseas limpiar el flujo? Esta acción eliminará todos los nodos y conexiones."
    type="warning"
    :show-icon="true"
    :show-cancel-button="true"
    cancel-button-text="Cancelar"
    confirm-button-text="Sí, limpiar"
    confirm-button-type="primary"
    confirm-button-class="el-button--primary"
    @confirm="onActionConfirm"
  />
</template>

// Ejemplo 3: Diálogo de advertencia
<template>
  <!-- Botón que abre el diálogo -->
  <el-button @click="showWarningDialog = true" type="warning">
    Acción con advertencias
  </el-button>
  
  <!-- Diálogo con advertencia -->
  <CustomDialog
    v-model="showWarningDialog"
    title="Advertencia"
    message="Esta acción podría tener consecuencias inesperadas."
    warning="Se detectaron posibles problemas: conexiones circulares, nodos sin salida."
    type="warning"
    :show-icon="true"
    :show-cancel-button="true"
    cancel-button-text="Cancelar"
    confirm-button-text="Continuar de todos modos"
    @confirm="onWarningConfirm"
  />
</template>
