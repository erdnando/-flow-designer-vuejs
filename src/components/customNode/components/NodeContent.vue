<template>
	<div class="node-content">
		<NodeIcon :icon="icon" />
		<NodeLabels 
			:label="label"
			:subtitle="subtitle"
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
	subtitle: string;
	typeDisplay: string;
	version: string;
}

defineProps<Props>();
</script>

<style scoped>
/* Los estilos se manejan en los componentes hijos */
</style>
