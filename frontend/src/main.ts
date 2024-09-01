import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import "@fortawesome/fontawesome-free/css/all.css";
import 'halfmoon/css/halfmoon-variables.min.css'
import '@/styles/index.scss'
import {Backend} from "@/libs/backend";
import {i18n} from "@/libs/i18n";
import VueResizeText from 'vue-resize-text';
import EventBus from "@/libs/event-bus";
import VueInteractJs from "vue-interactjs";

Vue.config.productionTip = false
Vue.use(VueResizeText);
// @ts-ignore
Vue.use(VueInteractJs);

function initializeDocumentEvents() {
    window.onbeforeunload = function () {
       EventBus.$emit("closing");
    };
}

initializeDocumentEvents();

Backend.initAsync().then(() => {
    new Vue({
        router,
        store,
        i18n,
        render: h => h(App)
    }).$mount('#app');
});
