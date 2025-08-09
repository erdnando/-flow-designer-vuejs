<template>
	<div 
		v-if="visible" 
		class="node-toolbar-inline"
		@click.stop
		@mousedown.stop
	>
		<!-- Botón de copiar -->
		<button
			class="toolbar-btn copy-btn"
			@click="handleCopy"
			title="Copiar nodo"
		>
			<img 
				:src="TOOLBAR_ICONS.COPY"
				width="18"
				height="18"
				alt="Copiar"
			/>
		</button>

		<!-- Botón de duplicar -->
		<button
			class="toolbar-btn duplicate-btn"
			@click="handleDuplicate"
			title="Duplicar nodo"
		>
			<img 
				:src="TOOLBAR_ICONS.DUPLICATE"
				width="18"
				height="18"
				alt="Duplicar"
			/>
		</button>

		<!-- Botón de eliminar -->
		<button
			class="toolbar-btn delete-btn"
			@click="handleDelete"
			title="Eliminar nodo"
		>
			<img 
				:src="TOOLBAR_ICONS.DELETE"
				width="18"
				height="18"
				alt="Eliminar"
			/>
		</button>

		<!-- Botón de menú -->
		<button
			class="toolbar-btn menu-btn"
			@click="handleMenu"
			title="Más opciones"
		>
			<img 
				:src="TOOLBAR_ICONS.MENU"
				width="18"
				height="18"
				alt="Menú"
			/>
		</button>
	</div>
</template>

<script setup lang="ts">
import { TOOLBAR_ICONS } from '../constants';

interface Props {
	visible: boolean;
}

interface Events {
	copy: [];
	duplicate: [];
	delete: [];
	menu: [event: MouseEvent];
}

defineProps<Props>();
const emit = defineEmits<Events>();

function handleCopy() {
	emit('copy');
}

function handleDuplicate() {
	emit('duplicate');
}

function handleDelete() {
	emit('delete');
}

function handleMenu(event: MouseEvent) {
	emit('menu', event);
}
</script>

<style scoped>
.node-toolbar-inline {
	/* Los estilos se heredan del componente padre para mantener compatibilidad */
}

.toolbar-btn {
	/* Los estilos se heredan del componente padre */
}
</style>
