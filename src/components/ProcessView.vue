<template>
  <div class="process-view">
    <div class="process-header">
      <h3>{{ title }}</h3>
      <span class="process-badge">Vista de Proceso</span>
    </div>
    
    <div class="process-content">
      <div class="placeholder-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6b7280" stroke-width="2"/>
          <path d="M9 9h6v6H9V9z" fill="#6b7280" opacity="0.5"/>
          <circle cx="12" cy="12" r="5" stroke="#6b7280" stroke-width="2" stroke-dasharray="2"/>
        </svg>
        
        <p class="placeholder-message">Este es un componente de vista de proceso genérico</p>
      </div>
      
      <div class="process-actions">
        <button @click="handleNext" class="next-button">Continuar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  wizardStep?: {
    title?: string;
    description?: string;
    nodeData?: any;
  };
}>();

const emit = defineEmits(['next', 'previous']);

const title = computed(() => props.wizardStep?.title || 'Paso de Proceso');

function handleNext() {
  emit('next');
}
</script>

<style scoped>
.process-view {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9fafb;
  height: 100%;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.process-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.process-badge {
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #6b7280;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.process-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.placeholder-message {
  margin-top: 16px;
  color: #6b7280;
  text-align: center;
}

.process-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.next-button {
  padding: 8px 16px;
  border-radius: 4px;
  background-color: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.next-button:hover {
  background-color: #2563eb;
}

.next-button:active {
  background-color: #1d4ed8;
}
</style>
