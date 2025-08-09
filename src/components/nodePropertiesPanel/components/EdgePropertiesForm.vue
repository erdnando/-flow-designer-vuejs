<template>
	<div class="edge-form">
		<label>
			ID de la conexión
			<input :value="edgeProperties.id" disabled />
		</label>
		
		<label>
			Tipo de conexión
			<select :value="edgeProperties.type" @change="onEdgeTypeChange">
				<option
					v-for="edgeType in EDGE_TYPE_OPTIONS"
					:key="edgeType.value"
					:value="edgeType.value"
				>
					{{ edgeType.label }}
				</option>
			</select>
		</label>
		
		<label>
			Nodo origen
			<input :value="sourceNodeInfo" disabled />
		</label>
		
		<label>
			Nodo destino
			<input :value="targetNodeInfo" disabled />
		</label>
		
		<label>
			Handle origen
			<input :value="edgeProperties.sourceHandle" disabled />
		</label>
		
		<label>
			Handle destino
			<input :value="edgeProperties.targetHandle" disabled />
		</label>
		
		<div class="edge-properties">
			<label class="checkbox-label">
				<input
					type="checkbox"
					:checked="edgeProperties.animated"
					@change="onEdgeAnimatedChange"
				/>
				Animación habilitada
			</label>
			
			<label class="checkbox-label">
				<input
					type="checkbox"
					:checked="edgeProperties.selectable"
					@change="onEdgeSelectableChange"
				/>
				Seleccionable
			</label>
		</div>
		
		<div class="edge-meta">
			<span>Posición origen: {{ sourcePosition }}</span>
			<span>Posición destino: {{ targetPosition }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { EDGE_TYPE_OPTIONS } from '../constants';
import type { EdgeProperties } from '../types';

interface Props {
	edgeProperties: EdgeProperties;
	sourceNodeInfo: string;
	targetNodeInfo: string;
	sourcePosition: string;
	targetPosition: string;
}

interface Emits {
	'edge-type-change': [Event];
	'edge-animated-change': [Event];
	'edge-selectable-change': [Event];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function onEdgeTypeChange(event: Event) {
	emit('edge-type-change', event);
}

function onEdgeAnimatedChange(event: Event) {
	emit('edge-animated-change', event);
}

function onEdgeSelectableChange(event: Event) {
	emit('edge-selectable-change', event);
}
</script>

<style scoped>
.edge-form {
	padding: 20px;
}

label {
	display: block;
	margin-bottom: 16px;
	color: #c9d1d9;
	font-size: 12px;
	font-weight: 500;
}

.checkbox-label {
	display: flex;
	align-items: center;
	cursor: pointer;
	margin-bottom: 12px;
}

.checkbox-label input[type="checkbox"] {
	width: auto;
	margin-right: 8px;
	margin-top: 0;
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

input:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.edge-properties {
	margin: 20px 0;
	padding: 16px;
	background: #161b22;
	border-radius: 6px;
	border: 1px solid #30363d;
}

.edge-meta {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid #30363d;
}

.edge-meta span {
	font-size: 11px;
	color: #8b949e;
}
</style>
