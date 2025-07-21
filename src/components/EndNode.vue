<template>
	<div class="end-node">
		<div class="end-node-content">
			<div class="end-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" fill="#F44336" stroke="#C62828" stroke-width="2"/>
					<rect x="8" y="8" width="8" height="8" fill="white" rx="1"/>
				</svg>
			</div>
			<div class="end-text">
				<div class="end-title">END</div>
				<div class="end-subtitle">{{ subtitle || 'Fin del flujo' }}</div>
			</div>
		</div>
		<!-- Solo handle de entrada (izquierda) -->
		<Handle 
			type="target" 
			:position="Position.Left" 
			:style="{ background: '#F44336', width: '12px', height: '12px' }"
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

const subtitle = computed(() => props.data?.subtitle || 'Fin del flujo');
</script>

<style scoped>
.end-node {
	background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
	border: 2px solid #C62828;
	border-radius: 20px;
	padding: 12px 16px;
	min-width: 140px;
	position: relative;
	box-shadow: 
		0 4px 12px rgba(244, 67, 54, 0.3),
		0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
}

.end-node:hover {
	transform: translateY(-2px);
	box-shadow: 
		0 6px 16px rgba(244, 67, 54, 0.4),
		0 4px 8px rgba(0, 0, 0, 0.15);
}

.end-node-content {
	display: flex;
	align-items: center;
	gap: 10px;
	color: white;
}

.end-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
}

.end-text {
	flex: 1;
}

.end-title {
	font-weight: 700;
	font-size: 14px;
	letter-spacing: 1px;
	margin-bottom: 2px;
}

.end-subtitle {
	font-size: 11px;
	opacity: 0.9;
	font-weight: 400;
	line-height: 1.2;
}
</style>
