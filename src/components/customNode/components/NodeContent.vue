<template>
	<div class="node-content">
		<NodeIcon :icon="icon" />
		<NodeLabels 
			:label="label"
			:typeDisplay="typeDisplay"
			:version="version"
		/>
	</div>
</template>

<script setup lang="ts">
import NodeIcon from './NodeIcon.vue';
import NodeLabels from './NodeLabels.vue';

interface Props {
	icon: string;
	label: string;
	typeDisplay: string;
	version: string;
}

defineProps<Props>();
</script>

<style scoped>
.node-content {
	/* Los estilos se heredan del componente padre para mantener compatibilidad */
}
</style>
