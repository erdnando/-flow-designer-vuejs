import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './stores';
import './style.css';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
