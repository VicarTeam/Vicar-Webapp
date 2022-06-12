import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

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
