<script setup lang="ts">
import NotificationContainer from './components/NotificationContainer.vue'
</script>

<template>
	<router-view />
	<NotificationContainer />
</template>

<style>
html,
body,
#app {
	width: 100vw;
	height: 100vh;
	min-width: 0;
	min-height: 0;
	margin: 0;
	padding: 0;
	overflow: hidden;
	background: #23272e;
}
</style>

<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}
.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
