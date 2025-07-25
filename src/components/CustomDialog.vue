<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :append-to-body="true"
    :show-close="showClose"
    :close-on-click-modal="closeOnClickModal"
    :class="['custom-dialog', type ? `dialog-${type}` : '']"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
    destroy-on-close
  >
    <!-- Contenido principal del diálogo -->
    <div class="dialog-content">
      <!-- Icono de advertencia o información si existe -->
      <div v-if="showIcon" class="dialog-icon">
        <div :class="['icon-container', `icon-${type}`]">
          <i v-if="type === 'warning'" class="el-icon-warning"></i>
          <i v-else-if="type === 'error'" class="el-icon-error"></i>
          <i v-else-if="type === 'info'" class="el-icon-info"></i>
          <i v-else-if="type === 'success'" class="el-icon-success"></i>
          <span v-else>!</span>
        </div>
      </div>
      
      <!-- Contenido principal -->
      <div class="dialog-main-content">
        <!-- Mensaje principal -->
        <p class="dialog-message" v-if="message">{{ message }}</p>
        
        <!-- Slot para contenido personalizado -->
        <slot></slot>
        
        <!-- Advertencias si existen -->
        <div v-if="warning" class="dialog-warning">
          <p>{{ warning }}</p>
        </div>
        
        <!-- Nota adicional -->
        <div v-if="note" class="dialog-note">
          <p>{{ note }}</p>
        </div>
      </div>
    </div>
    
    <!-- Botones de acción -->
    <template #footer>
      <div class="dialog-footer">
        <!-- Botón de cancelar -->
        <el-button 
          v-if="showCancelButton" 
          @click="onCancel" 
          :class="cancelButtonClass"
        >
          {{ cancelButtonText }}
        </el-button>
        
        <!-- Botón de confirmar -->
        <el-button 
          v-if="showConfirmButton" 
          @click="onConfirm" 
          :type="confirmButtonType" 
          :class="confirmButtonClass"
        >
          {{ confirmButtonText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Props definitions with types
defineProps({
  // Control del diálogo
  modelValue: {
    type: Boolean,
    required: true
  },
  // Apariencia general
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '420px'
  },
  type: {
    type: String,
    default: '', // 'warning', 'error', 'info', 'success'
    validator: (value: string) => ['', 'warning', 'error', 'info', 'success'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: false
  },
  // Contenido adicional
  warning: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  // Comportamiento del diálogo
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  // Botón de confirmación
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  confirmButtonText: {
    type: String,
    default: 'Aceptar'
  },
  confirmButtonType: {
    type: String,
    default: 'primary'
  },
  confirmButtonClass: {
    type: String,
    default: ''
  },
  // Botón de cancelar
  showCancelButton: {
    type: Boolean,
    default: false
  },
  cancelButtonText: {
    type: String,
    default: 'Cancelar'
  },
  cancelButtonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel'
]);

// Manejo de eventos
const onConfirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};

const onCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
/* Estilos base para el diálogo personalizado */
.custom-dialog :deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

.custom-dialog :deep(.el-dialog__wrapper) {
  background-color: rgba(0, 0, 0, 0.5);
}

.custom-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  margin-right: 0;
  background: #292e38;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px 5px 0 0;
}

.custom-dialog :deep(.el-dialog__headerbtn) {
  top: 16px;
}

.custom-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 20px;
  color: #333;
  background-color: #222832;
  color: #e9e9e9;
}

.custom-dialog :deep(.el-dialog__footer) {
  padding: 10px 20px 16px;
  background-color: #222832;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0 0 5px 5px;
}

.dialog-content {
  display: flex;
  align-items: flex-start;
}

.dialog-icon {
  margin-right: 15px;
  padding-top: 3px;
}

.icon-container {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.icon-warning {
  background-color: #e6a23c;
}

.icon-error {
  background-color: #f56c6c;
}

.icon-info {
  background-color: #409eff;
}

.icon-success {
  background-color: #67c23a;
}

.dialog-main-content {
  flex: 1;
}

.dialog-message {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 15px;
}

.dialog-warning {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  padding: 10px 15px;
  margin-top: 15px;
  border-radius: 4px;
  font-size: 14px;
}

.dialog-note {
  background: rgba(220, 53, 69, 0.05);
  color: #6c757d;
  padding: 10px 15px;
  margin-top: 10px;
  border-radius: 4px;
  font-style: italic;
  font-size: 0.9em;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Estilos específicos para diálogos de tipo */
.dialog-warning :deep(.el-dialog__header) {
  background-color: #e6a23c;
}

.dialog-error :deep(.el-dialog__header) {
  background-color: #f56c6c;
}

.dialog-info :deep(.el-dialog__header) {
  background-color: #409eff;
}

.dialog-success :deep(.el-dialog__header) {
  background-color: #67c23a;
}
</style>
