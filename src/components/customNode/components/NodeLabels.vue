<template>
	<div class="node-labels">
		<div class="node-title">{{ label }}</div>
		<div class="node-type-badge">{{ typeDisplay }}</div>
		<div class="node-version">{{ version }}</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	label: string;
	typeDisplay: string;
	version: string;
}

defineProps<Props>();
</script>

<style scoped>
.node-labels {
	/* Estilos de labels se heredan del componente padre */
}

.node-title {
	/* Hereda del componente padre */
}

.node-type-badge {
	/* Hereda del componente padre */
}

.node-version {
	/* Hereda del componente padre */
}
</style>
