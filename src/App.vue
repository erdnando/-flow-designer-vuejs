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
	width: 100vw !important;
	height: 100vh !important;
	min-width: 0 !important;
	min-height: 0 !important;
	max-width: none !important; /* Sobrescribir el max-width del style.css */
	margin: 0 !important;
	padding: 0 !important; /* Sobrescribir el padding del style.css */
	overflow: hidden;
	background: #23272e;
	text-align: left !important; /* Sobrescribir el text-align del style.css */
}

/* Asegurar que el body también use toda la altura disponible */
body {
	display: flex !important;
	place-items: stretch !important; /* Cambiar de center a stretch */
	min-height: 100vh !important;
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
