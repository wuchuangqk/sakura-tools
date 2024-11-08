import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from "pinia";
import 'virtual:svg-icons-register'
import { Tooltip, ConfigProvider, Modal, Button, Spin, Card, Slider, Flex, RadioButton, RadioGroup } from 'ant-design-vue';
import './style.scss'
import Icon from '@/renderer/components/Icon.vue'
import { router } from '@/renderer/router'

const app = createApp(App)
app.use(createPinia());
app.component('Tooltip', Tooltip)
  .component('ConfigProvider', ConfigProvider)
  .component('Modal', Modal)
  .component('Button', Button)
  .component('Icon', Icon)
  .component('Spin', Spin)
  .component('Card', Card)
  .component('Slider', Slider)
  .component('Flex', Flex)
  .component('RadioButton', RadioButton)
  .component('RadioGroup', RadioGroup)
app.use(router)
app.mount('#app')