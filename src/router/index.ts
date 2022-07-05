import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from "@/store";
import LoadingView from "@/views/LoadingView.vue";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'loading',
    component: () => import('../views/LoadingView.vue')
  },
  {
    path: '/main',
    name: 'main',
    component: () => import('@/views/MainView.vue')
  },
  {
    path: '/editor',
    name: 'editor',
    component: () => import('@/views/EditorView.vue'),
    children: [
      {
        path: 'clan',
        name: 'editor-clan',
        component: () => import('@/views/editor/ChooseClanView.vue')
      },
      {
        path: 'predator-type',
        name: 'editor-predator-type',
        component: () => import('@/views/editor/ChoosePredatorTypeView.vue')
      },
      {
        path: 'attributes',
        name: 'editor-attributes',
        component: () => import('@/views/editor/ChooseAttributesView.vue')
      },
      {
        path: 'skills',
        name: 'editor-skills',
        component: () => import('@/views/editor/ChooseSkillsView.vue')
      },
      {
        path: 'disciplines',
        name: 'editor-disciplines',
        component: () => import('@/views/editor/ChooseDisciplinesView.vue')
      },
      {
        path: 'traits',
        name: 'editor-traits',
        component: () => import('@/views/editor/ChooseTraitsView.vue')
      }
    ]
  },
  {
    path: '/viewer',
    name: 'viewer',
    component: () => import('@/views/ViewerView.vue'),
    beforeEnter: (to, from, next) => {
      if (store.state.editingCharacter) {
        next();
      } else {
        next('/');
      }
    },
    children: [
      {
        path: 'profile',
        name: 'viewer-profile',
        component: () => import('@/views/viewer/ProfileView.vue')
      },
      {
        path: 'attributes',
        name: 'viewer-attributes',
        component: () => import('@/views/viewer/AttributesView.vue')
      },
      {
        path: 'skills',
        name: 'viewer-skills',
        component: () => import('@/views/viewer/SkillsView.vue')
      },
      {
        path: 'disciplines',
        name: 'viewer-disciplines',
        component: () => import('@/views/viewer/DisciplinesView.vue')
      },
      {
        path: 'bloodrituals',
        name: 'viewer-bloodrituals',
        component: () => import('@/views/viewer/BloodRitualsView.vue')
      },
      {
        path: 'traits',
        name: 'viewer-traits',
        component: () => import('@/views/viewer/TraitsView.vue')
      },
      {
        path: 'pdf',
        name: 'viewer-pdf',
        component: () => import('@/views/viewer/PdfView.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
