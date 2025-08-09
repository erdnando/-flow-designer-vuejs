<template>
	<div class="node-form">
		<!-- Icono y título del nodo -->
		<div class="node-header">
			<div class="node-icon-display">
				<span v-html="nodeIcon"></span>
			</div>
			<div class="node-info">
				<h3 class="node-name">{{ nodeProperties.label || 'Nodo sin nombre' }}</h3>
				<span class="node-type-label">{{ nodeProperties.type }}</span>
			</div>
		</div>
		
		<label>
			Nombre
			<input :value="nodeProperties.label" @input="onLabelChange" />
		</label>
		
		<label>
			Tipo
			<select
				:value="nodeProperties.type === 'if' ? 'condition' : nodeProperties.type"
				@change="onTypeChange"
			>
				<option
					v-for="typeKey in allNodeTypes.filter((t) => t !== 'if')"
					:key="typeKey"
					:value="typeKey === 'condition' ? 'condition' : typeKey"
				>
					{{ typeKey === 'condition' ? 'Condición (If)' : typeKey }}
				</option>
			</select>
		</label>
		
		<label>
			Subtítulo
			<input
				:value="nodeProperties.subtitle"
				@input="onSubtitleChange"
				placeholder="Ingrese un subtítulo"
			/>
		</label>
	</div>
</template>

<script setup lang="ts">
import type { NodeProperties } from '../types';

interface Props {
	nodeProperties: NodeProperties;
	nodeIcon: string;
	allNodeTypes: string[];
}

interface Emits {
	'label-change': [Event];
	'type-change': [Event];
	'subtitle-change': [Event];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function onLabelChange(event: Event) {
	emit('label-change', event);
}

function onTypeChange(event: Event) {
	emit('type-change', event);
}

function onSubtitleChange(event: Event) {
	emit('subtitle-change', event);
}
</script>

<style scoped>
.node-form {
	padding: 20px;
}

.node-header {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 20px;
	padding-bottom: 16px;
	border-bottom: 1px solid #30363d;
}

.node-icon-display {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #21262d;
	border-radius: 8px;
	border: 1px solid #30363d;
}

.node-icon-display :deep(svg) {
	width: 20px;
	height: 20px;
	color: #58a6ff;
}

.node-info {
	flex: 1;
}

.node-name {
	color: #c9d1d9;
	font-size: 16px;
	font-weight: 600;
	margin: 0;
	margin-bottom: 4px;
}

.node-type-label {
	color: #8b949e;
	font-size: 12px;
	text-transform: uppercase;
	font-weight: 500;
}

label {
	display: block;
	margin-bottom: 16px;
	color: #c9d1d9;
	font-size: 12px;
	font-weight: 500;
}

input,
select {
	width: 100%;
	background: #21262d;
	border: 1px solid #30363d;
	border-radius: 6px;
	padding: 8px 12px;
	color: #c9d1d9;
	font-size: 14px;
	margin-top: 4px;
	transition: border-color 0.2s;
}

input:focus,
select:focus {
	outline: none;
	border-color: #58a6ff;
}

input::placeholder {
	color: #6e7681;
}
</style>
