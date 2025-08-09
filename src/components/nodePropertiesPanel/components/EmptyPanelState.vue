<template>
	<div class="empty-panel">
		<div class="empty-icon">📋</div>
		<p class="empty-message">
			Selecciona un nodo o haz click en el fondo para ver propiedades del flujo
		</p>
	</div>
</template>

<script setup lang="ts">
// No props needed for this simple component
</script>

<style scoped>
.empty-panel {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	text-align: center;
	color: #6e7681;
	height: 200px;
}

.empty-icon {
	font-size: 48px;
	margin-bottom: 16px;
	opacity: 0.5;
}

.empty-message {
	font-size: 14px;
	line-height: 1.5;
	margin: 0;
	max-width: 250px;
}
</style>
