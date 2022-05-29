import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'halfmoon/css/halfmoon-variables.min.css'
import '@/styles/index.scss'
import {Backend} from "@/libs/backend";

Vue.config.productionTip = false

Backend.initAsync().then(() => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app'); 
});
