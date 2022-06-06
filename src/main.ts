import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import "@fortawesome/fontawesome-free/css/all.css";
import 'halfmoon/css/halfmoon-variables.min.css'
import '@/styles/index.scss'
import {Backend} from "@/libs/backend";
import {i18n} from "@/libs/i18n";

Vue.config.productionTip = false


Backend.initAsync().then(() => {
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app');
});
