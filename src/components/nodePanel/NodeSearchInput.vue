<template>
  <div class="search-container">
    <input 
      v-model="searchQuery"
      class="search"
      :placeholder="placeholder"
      @input="onSearchChange"
      @keydown.escape="onEscape"
      ref="searchInput"
    />
    <div v-if="showClearButton" class="clear-button" @click="onClear">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path 
          d="M18 6L6 18M6 6L18 18" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div v-if="showStats && hasResults" class="search-stats">
      {{ filteredCount }} resultado{{ filteredCount !== 1 ? 's' : '' }}
    </div>
    <div v-if="showNoResults && !hasResults" class="no-results">
      No se encontraron nodos
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { PANEL_CONFIG } from './constants';

// Props
interface Props {
  modelValue: string;
  placeholder?: string;
  showClearButton?: boolean;
  showStats?: boolean;
  showNoResults?: boolean;
  filteredCount?: number;
  hasResults?: boolean;
  autofocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: PANEL_CONFIG.SEARCH_PLACEHOLDER,
  showClearButton: true,
  showStats: true,
  showNoResults: true,
  filteredCount: 0,
  hasResults: true,
  autofocus: false
});

// Events
interface Emits {
  'update:modelValue': [value: string];
  'search-change': [query: string];
  'clear': [];
  'focus': [];
  'blur': [];
}

const emit = defineEmits<Emits>();

// Template refs
const searchInput = ref<HTMLInputElement>();

// Computed
const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value);
  }
});

const showClearButton = computed(() => {
  return props.showClearButton && searchQuery.value.length > 0;
});

const showNoResults = computed(() => {
  return props.showNoResults && searchQuery.value.length > 0 && !props.hasResults;
});

/**
 * Maneja cambios en el input de búsqueda
 */
function onSearchChange(): void {
  emit('search-change', searchQuery.value);
}

/**
 * Maneja el botón de limpiar
 */
function onClear(): void {
  searchQuery.value = '';
  emit('clear');
  focusInput();
}

/**
 * Maneja la tecla Escape
 */
function onEscape(): void {
  if (searchQuery.value) {
    onClear();
  } else {
    searchInput.value?.blur();
  }
}

/**
 * Enfoca el input de búsqueda
 */
async function focusInput(): Promise<void> {
  await nextTick();
  searchInput.value?.focus();
}

/**
 * Selecciona todo el texto del input
 */
async function selectAllText(): Promise<void> {
  await nextTick();
  searchInput.value?.select();
}

// Autofocus si está habilitado
if (props.autofocus) {
  nextTick(() => {
    focusInput();
  });
}

// Exponer métodos para el componente padre
defineExpose({
  focusInput,
  selectAllText,
  clear: onClear
});
</script>

<style scoped>
.search-container {
  position: relative;
  margin-bottom: 8px;
}

.search {
  width: 100%;
  padding: 8px 12px;
  padding-right: v-bind('showClearButton ? "36px" : "12px"');
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
}

.search:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.search::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transition: color 0.2s, background-color 0.2s;
}

.clear-button:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.search-stats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 4px 8px;
  text-align: center;
}

.no-results {
  font-size: 12px;
  color: rgba(255, 193, 7, 0.8);
  padding: 8px;
  text-align: center;
  font-style: italic;
}
</style>
