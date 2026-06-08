import Vue from 'vue'
import VueRouter, {Route, RouteConfig} from 'vue-router'
import CharacterStorage from "@/libs/io/character-storage";
import {checkSession, setSession} from "@/libs/auth";
import DataManager from "@/libs/data/data-manager";

Vue.use(VueRouter)

let firstRoute: Route | null = null;

function _q(to: Route): string {
  return `?r=${encodeURIComponent(btoa(to.fullPath))}`;
}

export function getRedirectQuery(): string {
  if (!firstRoute) return '';
  return _q(firstRoute);
}

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'main',
    component: () => import('@/views/MainView.vue'),
    beforeEnter: async (to, from, next) => {
      console.warn('Main route beforeEnter', to, from);
      const stk = to.query.stk as string;
      if (stk) {
        localStorage.setItem('vicar:session', stk);
      }

      const result = await checkSession();

      if (!firstRoute) firstRoute = to;
      if (result.status === 'not_found') {
        console.warn('No session, redirecting to login');
        next('/login');
      } else {
        if (!await DataManager.loadLogin(false)) {
          next('/login');
          return;
        }
        next();
      }
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/logged-in',
    name: 'logged-in',
    component: () => null,
    beforeEnter: async (to, from, next) => {
      const accessToken = to.query.s_atk as string;
      const refreshToken = to.query.s_rtk as string;
      const exp = parseInt(to.query.s_exp as string, 10);
      if (accessToken && refreshToken && exp && !isNaN(exp)) {
        await setSession({
          accessToken,
          refreshToken,
          exp
        });
      } else {
        alert('Failed to log in');
      }
      const r = to.query.r as string;
      if (r) {
        const redirectPath = atob(decodeURIComponent(r));
        next(redirectPath);
        return;
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
      },
      {
        path: 'auspice',
        name: 'editor-auspice',
        component: () => import('@/views/editor/w5/ChooseAuspiceView.vue')
      },
      {
        path: 'tribe',
        name: 'editor-tribe',
        component: () => import('@/views/editor/w5/ChooseTribeView.vue')
      },
      {
        path: 'renown',
        name: 'editor-renown',
        component: () => import('@/views/editor/w5/ChooseRenownView.vue')
      },
      {
        path: 'gifts',
        name: 'editor-gifts',
        component: () => import('@/views/editor/w5/ChooseGiftsView.vue')
      },
      {
        path: 'identity',
        name: 'editor-identity',
        component: () => import('@/views/editor/m20/ChooseIdentityView.vue')
      },
      {
        path: 'tradition',
        name: 'editor-tradition',
        component: () => import('@/views/editor/m20/ChooseTraditionView.vue')
      },
      {
        path: 'm20-attributes',
        name: 'editor-m20-attributes',
        component: () => import('@/views/editor/m20/ChooseAttributesView.vue')
      },
      {
        path: 'm20-abilities',
        name: 'editor-m20-abilities',
        component: () => import('@/views/editor/m20/ChooseAbilitiesView.vue')
      },
      {
        path: 'm20-finishing-touches',
        name: 'editor-m20-finishing-touches',
        component: () => import('@/views/editor/m20/ChooseFinishingTouchesView.vue')
      },
      {
        path: 'creed',
        name: 'editor-creed',
        component: () => import('@/views/editor/h5/ChooseCreedView.vue')
      },
      {
        path: 'edges',
        name: 'editor-edges',
        component: () => import('@/views/editor/h5/ChooseEdgesView.vue')
      }
    ]
  },
  {
    path: '/viewer/:characterId',
    name: 'viewer',
    component: () => import('@/views/ViewerView.vue'),
    beforeEnter: async (to, from, next) => {
      if (!firstRoute) firstRoute = to;
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
        path: 'gifts',
        name: 'viewer-gifts',
        component: () => import('@/views/viewer/GiftsView.vue')
      },
      {
        path: 'tradition',
        name: 'viewer-tradition',
        component: () => import('@/views/viewer/TraditionView.vue')
      },
      {
        path: 'edges',
        name: 'viewer-edges',
        component: () => import('@/views/viewer/EdgesView.vue')
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
  base: (import.meta as any).env.BASE_URL,
  routes
})

export default router
