<template>
  <div v-if="collapsed" class="collapsed-top">
    <button class="collapse-btn" @click="onToggle">
      <svg width="18" height="18" :viewBox="ICONS.EXPAND_RIGHT.viewBox" fill="none">
        <g v-html="ICONS.EXPAND_RIGHT.path"></g>
      </svg>
    </button>
  </div>
  <div v-else class="panel-header" @click="onToggle">
    <span>{{ title }}</span>
    <button class="collapse-btn">
      <svg width="18" height="18" :viewBox="ICONS.COLLAPSE_LEFT.viewBox" fill="none">
        <g v-html="ICONS.COLLAPSE_LEFT.path"></g>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ICONS, PANEL_CONFIG } from './constants';

// Props
interface Props {
  collapsed: boolean;
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: PANEL_CONFIG.PANEL_TITLE
});

// Events
interface Emits {
  toggle: [];
}

const emit = defineEmits<Emits>();

/**
 * Maneja el toggle del panel
 */
function onToggle(): void {
  emit('toggle');
}
</script>

<style scoped>
.collapsed-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-weight: bold;
  background: #23272e;
  cursor: pointer;
  border-bottom: 1px solid #23272e;
  margin-top: 20px;
  height: v-bind('PANEL_CONFIG.HEADER_HEIGHT + "px"');
  box-sizing: border-box;
}

.collapse-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s, background-color 0.2s;
}

.collapse-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
}
</style>
