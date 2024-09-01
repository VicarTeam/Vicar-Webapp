import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from "@/store";
import CharacterStorage from "@/libs/io/character-storage";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'main',
    component: () => import('@/views/MainView.vue'),
    beforeEnter: (to, from, next) => {
      if (!localStorage.getItem('vicar:session')) {
        next('/login');
      } else {
        next();
      }
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => null,
    beforeEnter: async (to, from, next) => {
      window.location.href = process.env.VUE_APP_API_URL + '/auth/login';
    },
  },
  {
    path: '/logged-in',
    name: 'logged-in',
    component: () => null,
    beforeEnter: async (to, from, next) => {
      const session = to.query.session as string;
      if (session) {
        localStorage.setItem('vicar:session', session);
      } else {
        alert('Failed to log in');
      }
      next('/');
    },
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
    path: '/viewer/:characterId',
    name: 'viewer',
    component: () => import('@/views/ViewerView.vue'),
    beforeEnter: async (to, from, next) => {
      const characterId = to.params.characterId;
      const res = await CharacterStorage.preloadCharacter(characterId);
      if (res === true) {
        next();
        return;
      }

      if (res === 'not_authed') {
        next('/login');
        return;
      }

      next('/');
    },
    children: [
      {
        path: 'profile',
        name: 'viewer-profile',
        component: () => import('@/views/viewer/ProfileView.vue')
      },
      {
        path: 'inventory',
        name: 'viewer-inventory',
        component: () => import('@/views/viewer/InventoryView.vue')
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
  },
  {
    path: '/homebrew/discipline-editor/:disciplineId',
    name: 'homebrew-discipline-editor',
    props: true,
    component: () => import('@/views/homebrew/DisciplineEditorView.vue')
  },
  {
    path: '/homebrew/clan-editor/:clanId',
    name: 'homebrew-clan-editor',
    props: true,
    component: () => import('@/views/homebrew/ClanEditorView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
