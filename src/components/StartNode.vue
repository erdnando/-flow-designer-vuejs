<template>
	<div class="start-node">
		<div class="start-node-content">
			<div class="start-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
					<polygon points="10,8 16,12 10,16" fill="white"/>
				</svg>
			</div>
			<div class="start-text">
				<div class="start-title">START</div>
				<div class="start-subtitle">{{ subtitle || 'Inicio del flujo' }}</div>
			</div>
		</div>
		<!-- Solo handle de salida (derecha) -->
		<Handle 
			type="source" 
			:position="Position.Right" 
			:style="{ background: '#4CAF50', width: '12px', height: '12px' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { computed } from 'vue';

interface Props {
	data?: {
		subtitle?: string;
		[key: string]: any;
	};
}

const props = withDefaults(defineProps<Props>(), {
	data: () => ({})
});

const subtitle = computed(() => props.data?.subtitle || 'Inicio del flujo');
</script>

<style scoped>
.start-node {
	background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
	border: 2px solid #2E7D32;
	border-radius: 20px;
	padding: 12px 16px;
	min-width: 140px;
	position: relative;
	box-shadow: 
		0 4px 12px rgba(76, 175, 80, 0.3),
		0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
}

.start-node:hover {
	transform: translateY(-2px);
	box-shadow: 
		0 6px 16px rgba(76, 175, 80, 0.4),
		0 4px 8px rgba(0, 0, 0, 0.15);
}

.start-node-content {
	display: flex;
	align-items: center;
	gap: 10px;
	color: white;
}

.start-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
}

.start-text {
	flex: 1;
}

.start-title {
	font-weight: 700;
	font-size: 14px;
	letter-spacing: 1px;
	margin-bottom: 2px;
}

.start-subtitle {
	font-size: 11px;
	opacity: 0.9;
	font-weight: 400;
	line-height: 1.2;
}
</style>
