<template>
	<div class="node-icon">
		<!-- Icono dinámico según el tipo -->
		<span v-html="icon"></span>
	</div>
</template>

<script setup lang="ts">
interface Props {
	icon: string;
}

defineProps<Props>();
</script>

<style scoped>
.node-icon {
	/* Estilos del icono se heredan del componente padre */
}
</style>
