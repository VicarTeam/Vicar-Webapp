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
import {SettingsData} from "@/libs/io/settings";
import VueSocketIO from "vue-socket.io-extended";
import VicarPlayClient from "@/libs/vicarplay/vicar-play";

VicarPlayClient.init();

Vue.config.productionTip = false
Vue.use(VueSocketIO, VicarPlayClient.socket);
Vue.use(VueResizeText);
// @ts-ignore
Vue.use(VueInteractJs);

function initializeDocumentEvents() {
    if (process.env.NODE_ENV !== 'development') {
        document.onkeydown = function (e) {
            return (e.which || e.keyCode) != 116;
        };
    }

    document.addEventListener('contextmenu', e => {
        if (!SettingsData.isDevMode()) {
            e.preventDefault();
            return false;
        }
    }, {capture: true})

    document.addEventListener('selectstart', e => {
        if (!SettingsData.isDevMode()) {
            e.preventDefault();
            return false;
        }
    }, {capture: true})

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
