<template>
	<div v-if="hasError" class="node-warning">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
			<circle 
				cx="12" 
				cy="12" 
				r="10" 
				fill="#ff4444" 
				stroke="#fff" 
				stroke-width="2"
			/>
			<path
				d="M12 8V12M12 16H12.01"
				stroke="#fff"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>
</template>

<script setup lang="ts">
interface Props {
	hasError: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.node-warning {
	position: absolute;
	top: -8px;
	right: -8px;
	z-index: 1000;
	filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
	animation: warning-pulse 1.5s infinite;
	pointer-events: none;
	border-radius: 50%;
}

@keyframes warning-pulse {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.15);
		opacity: 0.8;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.node-warning svg {
	display: block;
	border-radius: 50%;
}
</style>
