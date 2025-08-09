<template>
  <Teleport to="body">
    <div v-if="modelValue" class="simple-dialog-overlay" @click="onOverlayClick">
      <div class="simple-dialog" @click.stop>
        <!-- Header -->
        <div class="simple-dialog-header">
          <h3 class="simple-dialog-title">{{ title }}</h3>
          <button v-if="showClose" class="simple-dialog-close" @click="onClose">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="simple-dialog-content">
          <!-- Icon -->
          <div v-if="showIcon" class="simple-dialog-icon" :class="`icon-${type}`">
            <svg v-if="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v8M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          
          <!-- Message -->
          <div class="simple-dialog-message">
            <p v-if="message">{{ message }}</p>
            <div v-if="warning" class="simple-dialog-warning">
              <p>{{ warning }}</p>
            </div>
            <div v-if="note" class="simple-dialog-note">
              <p>{{ note }}</p>
            </div>
            <slot></slot>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="simple-dialog-footer">
          <button 
            v-if="showCancelButton" 
            class="simple-dialog-button simple-dialog-button-cancel"
            @click="onCancel"
          >
            {{ cancelButtonText }}
          </button>
          <button 
            v-if="showConfirmButton"
            class="simple-dialog-button simple-dialog-button-confirm"
            :class="{ 'danger': confirmButtonType === 'danger' }"
            @click="onConfirm"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Diálogo'
  },
  message: {
    type: String,
    default: ''
  },
  warning: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['info', 'warning', 'error', 'success'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelButtonText: {
    type: String,
    default: 'Cancelar'
  },
  confirmButtonText: {
    type: String,
    default: 'Confirmar'
  },
  confirmButtonType: {
    type: String,
    default: 'primary'
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const onConfirm = () => {
  console.log('✅ SimpleDialog: onConfirm llamado - emitiendo evento confirm');
  emit('confirm');
  emit('update:modelValue', false);
};

const onCancel = () => {
  console.log('❌ SimpleDialog: onCancel llamado - emitiendo evento cancel');
  emit('cancel');
  emit('update:modelValue', false);
};

const onClose = () => {
  emit('update:modelValue', false);
};

const onOverlayClick = () => {
  if (props.closeOnClickModal) {
    emit('update:modelValue', false);
  }
};
</script>

<style scoped>
.simple-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(3px);
}

.simple-dialog {
  background: #23272e;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 500px;
  min-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  animation: dialogEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.simple-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #2a2f36 0%, #23272e 100%);
}

.simple-dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
}

.simple-dialog-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.simple-dialog-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.05);
}

.simple-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: #23272e;
}

.simple-dialog-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.simple-dialog-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0.2;
  background: currentColor;
}

.simple-dialog-icon.icon-warning {
  color: #ffb84d;
}

.simple-dialog-icon.icon-error {
  color: #e14d43;
}

.simple-dialog-icon.icon-info {
  color: #4a9eff;
}

.simple-dialog-icon svg {
  z-index: 1;
  position: relative;
}

.simple-dialog-message {
  flex: 1;
}

.simple-dialog-message p {
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  font-size: 16px;
  font-family: system-ui, -apple-system, sans-serif;
}

.simple-dialog-warning {
  background: rgba(255, 184, 77, 0.1);
  border: 1px solid rgba(255, 184, 77, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0;
}

.simple-dialog-warning p {
  margin: 0;
  color: #ffb84d;
  font-size: 14px;
  font-weight: 500;
}

.simple-dialog-note {
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0;
}

.simple-dialog-note p {
  margin: 0;
  color: #4a9eff;
  font-size: 14px;
  font-style: italic;
}

.simple-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px 24px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #1f2328 0%, #23272e 100%);
}

.simple-dialog-button {
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 100px;
  font-family: system-ui, -apple-system, sans-serif;
  position: relative;
  overflow: hidden;
}

.simple-dialog-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.simple-dialog-button:hover::before {
  transform: translateX(100%);
}

.simple-dialog-button-cancel {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.simple-dialog-button-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.simple-dialog-button-confirm {
  background: linear-gradient(135deg, #ffb84d 0%, #ff9f1a 100%);
  border-color: #ffb84d;
  color: #23272e;
}

.simple-dialog-button-confirm:hover {
  background: linear-gradient(135deg, #ffcb7d 0%, #ffb84d 100%);
  border-color: #ffcb7d;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 184, 77, 0.4);
}

.simple-dialog-button-confirm.danger {
  background: linear-gradient(135deg, #e14d43 0%, #d63384 100%);
  border-color: #e14d43;
  color: #fff;
}

.simple-dialog-button-confirm.danger:hover {
  background: linear-gradient(135deg, #f56565 0%, #e14d43 100%);
  border-color: #f56565;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(225, 77, 67, 0.4);
}

/* Efecto de pulsación para todos los botones */
.simple-dialog-button:active {
  transform: translateY(0) scale(0.98);
}

/* Animación de entrada para el contenido */
.simple-dialog-content,
.simple-dialog-footer {
  animation: contentFadeIn 0.4s ease-out 0.1s both;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
