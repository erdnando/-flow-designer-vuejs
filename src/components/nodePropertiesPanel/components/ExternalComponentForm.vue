<template>
	<div class="external-component-section">
		<h4 class="section-title">🔧 Componente</h4>
		
		<label>
			Versión del Componente
			<select
				:value="componentVersion"
				@change="onComponentVersionChange"
			>
				<option 
					v-for="version in availableVersions"
					:key="version.value"
					:value="version.value"
				>
					{{ version.label }}
				</option>
			</select>
		</label>
		
		<div class="component-info">
			<span class="component-id">ID: {{ customTypeId }}</span>
			<span class="component-status" :class="componentStatus">
				{{ componentStatusText }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ComponentVersion, ComponentStatus } from '../types';

interface Props {
	customTypeId: string;
	componentVersion: string;
	availableVersions: ComponentVersion[];
	componentStatus: ComponentStatus;
	componentStatusText: string;
}

interface Emits {
	'component-version-change': [Event];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function onComponentVersionChange(event: Event) {
	emit('component-version-change', event);
}
</script>

<style scoped>
.external-component-section {
	margin-top: 20px;
	padding: 16px;
	background: #161b22;
	border-radius: 8px;
	border: 1px solid #30363d;
}

.section-title {
	color: #c9d1d9;
	font-size: 14px;
	font-weight: 600;
	margin: 0 0 16px 0;
	display: flex;
	align-items: center;
	gap: 8px;
}

label {
	display: block;
	margin-bottom: 16px;
	color: #c9d1d9;
	font-size: 12px;
	font-weight: 500;
}

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

select:focus {
	outline: none;
	border-color: #58a6ff;
}

.component-info {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid #30363d;
}

.component-id {
	font-size: 11px;
	color: #8b949e;
	font-family: 'Courier New', monospace;
}

.component-status {
	font-size: 11px;
	font-weight: 500;
	padding: 2px 6px;
	border-radius: 4px;
	width: fit-content;
}

.component-status.stable {
	background: #238636;
	color: #fff;
}

.component-status.beta {
	background: #d29922;
	color: #fff;
}

.component-status.deprecated {
	background: #da3633;
	color: #fff;
}

.component-status.unknown {
	background: #6e7681;
	color: #fff;
}
</style>
