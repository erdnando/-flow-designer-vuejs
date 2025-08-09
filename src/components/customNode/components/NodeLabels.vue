<template>
	<div class="node-labels">
		<div class="node-title">{{ label }}</div>
		<div v-if="subtitle" class="node-subtitle">{{ subtitle }}</div>
		<div class="node-type-badge">{{ typeDisplay }}</div>
		<div class="node-version">{{ version }}</div>
	</div>
</template>

<script setup lang="ts">
interface Props {
	label: string;
	subtitle: string;
	typeDisplay: string;
	version: string;
}

defineProps<Props>();
</script>

<style scoped>
.node-labels {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.node-title {
	font-weight: 700;
	font-size: 1rem;
	color: #fff;
	letter-spacing: 0.01em;
	line-height: 1.2;
	margin-bottom: 5px;
}

.node-subtitle {
	font-size: 0.92rem;
	color: #b0b0b0;
	font-weight: 500;
	letter-spacing: 0.01em;
	line-height: 1.1;
	margin-bottom: 4px;
}

.node-type-badge {
	display: inline-block;
	background: #363a40;
	color: #ffb84d;
	font-size: 0.85rem;
	font-weight: 600;
	border-radius: 6px;
	padding: 2px 8px;
	margin: 2px 0 4px 0;
	letter-spacing: 0.02em;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	max-width: fit-content;
	transition: all 0.3s ease;
	animation: type-badge-flash 1.5s 1;
}

.node-version {
	display: inline-block;
	background: #2a4c2a;
	color: #90ee90;
	font-size: 0.75rem;
	font-weight: 500;
	border-radius: 4px;
	padding: 1px 6px;
	margin: 2px 0;
	letter-spacing: 0.01em;
	max-width: fit-content;
	border: 1px solid #4a6b4a;
}

@keyframes type-badge-flash {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.7; }
}
</style>
