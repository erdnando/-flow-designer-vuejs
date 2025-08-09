<template>
	<div class="project-form">
		<label>
			Nombre del flujo
			<textarea
				:value="projectProps.name"
				@input="onNameInput"
				:disabled="disabled"
				rows="1"
				class="flow-title-input auto-resize"
				ref="titleTextarea"
			/>
		</label>
		
		<label>
			Descripción
			<textarea
				:value="projectProps.description"
				@input="onDescriptionInput"
				:disabled="disabled"
				rows="3"
				class="flow-description-input auto-resize"
				ref="descriptionTextarea"
			/>
		</label>
		
		<label>
			Estatus
			<select
				:value="projectProps.status"
				@change="onStatusChange"
				:disabled="disabled"
			>
				<option
					v-for="status in PROJECT_STATUS_OPTIONS"
					:key="status.value"
					:value="status.value"
				>
					{{ status.label }}
				</option>
			</select>
		</label>
		
		<label>
			Propietario
			<input
				:value="projectProps.owner"
				@input="onOwnerInput"
				:disabled="disabled"
			/>
		</label>
		
		<div class="project-meta">
			<span>Creado: {{ projectProps?.createdAt || '' }}</span>
			<span>Actualizado: {{ projectProps?.updatedAt || '' }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PROJECT_STATUS_OPTIONS } from '../constants';
import type { ProjectProperties } from '../types';

interface Props {
	projectProps: ProjectProperties;
	disabled: boolean;
}

interface Emits {
	'update-project-prop': [string, any];
	'auto-resize': [Event];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const titleTextarea = ref<HTMLTextAreaElement | null>(null);
const descriptionTextarea = ref<HTMLTextAreaElement | null>(null);

function onNameInput(e: Event) {
	const value = (e.target as HTMLTextAreaElement).value;
	emit('update-project-prop', 'name', value);
	emit('auto-resize', e);
}

function onDescriptionInput(e: Event) {
	const value = (e.target as HTMLTextAreaElement).value;
	emit('update-project-prop', 'description', value);
	emit('auto-resize', e);
}

function onStatusChange(e: Event) {
	const value = (e.target as HTMLSelectElement).value;
	emit('update-project-prop', 'status', value);
}

function onOwnerInput(e: Event) {
	const value = (e.target as HTMLInputElement).value;
	emit('update-project-prop', 'owner', value);
}

defineExpose({
	titleTextarea,
	descriptionTextarea
});
</script>

<style scoped>
.project-form {
	padding: 20px;
}

label {
	display: block;
	margin-bottom: 16px;
	color: #c9d1d9;
	font-size: 12px;
	font-weight: 500;
}

input,
textarea,
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
textarea:focus,
select:focus {
	outline: none;
	border-color: #58a6ff;
}

textarea {
	resize: none;
	font-family: inherit;
	line-height: 1.4;
}

.auto-resize {
	overflow: hidden;
}

.project-meta {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid #30363d;
}

.project-meta span {
	font-size: 11px;
	color: #8b949e;
}

input:disabled,
textarea:disabled,
select:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
