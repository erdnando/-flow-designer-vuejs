<template>
	<!-- Estado colapsado -->
	<div v-if="collapsed" class="collapsed-top">
		<button class="collapse-btn" @click.stop="onToggleCollapse">
			<span v-html="COLLAPSE_ICON_LEFT"></span>
		</button>
	</div>
	
	<!-- Estado expandido -->
	<div v-else class="panel-header" @click="onHeaderClick" :tabindex="-1">
		<span class="panel-title">{{ title }}</span>
		<button class="collapse-btn" @click.stop="onToggleCollapse">
			<span v-html="COLLAPSE_ICON_RIGHT"></span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { COLLAPSE_ICON_LEFT, COLLAPSE_ICON_RIGHT } from '../constants';

interface Props {
	collapsed: boolean;
	title: string;
}

interface Emits {
	'toggle-collapse': [];
	'header-click': [];
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function onToggleCollapse() {
	emit('toggle-collapse');
}

function onHeaderClick() {
	emit('header-click');
}
</script>

<style scoped>
.panel-header {
	background: #1a1d23;
	padding: 16px 20px;
	border-bottom: 1px solid #33373e;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: background-color 0.2s;
}

.panel-header:hover {
	background: #1f242c;
}

.panel-title {
	font-weight: 600;
	color: #fff;
	font-size: 14px;
}

.collapse-btn {
	background: none;
	border: none;
	color: #8b949e;
	cursor: pointer;
	padding: 4px;
	border-radius: 4px;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.collapse-btn:hover {
	background: #33373e;
	color: #fff;
}

.collapsed-top {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 32px;
	height: 100%;
}

.collapsed-top .collapse-btn {
	transform: rotate(180deg);
}
</style>
