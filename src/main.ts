import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from "pinia";
import 'virtual:svg-icons-register'
import { Tooltip, ConfigProvider, Modal, Button } from 'ant-design-vue';
import './style.scss'
import Icon from '@/components/Icon.vue'

const app = createApp(App)
app.use(createPinia());
app.component('Tooltip', Tooltip)
app.component('ConfigProvider', ConfigProvider)
app.component('Modal', Modal)
app.component('Button', Button)
app.component('Icon', Icon)
app.mount('#app')