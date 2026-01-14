import {createRouter, createWebHistory, type RouteLocationNormalizedGeneric} from 'vue-router'
import {checkSession, setSession} from "@/libs/auth.ts";
import DataManager from "@/libs/data/data-manager.ts";
import CharacterStorage from "@/libs/io/character-storage.ts";

let firstRoute: RouteLocationNormalizedGeneric | null = null;

function _q(to: RouteLocationNormalizedGeneric): string {
  return `?r=${encodeURIComponent(btoa(to.fullPath))}`;
}

export function getRedirectQuery(): string {
  if (!firstRoute) return '';
  return _q(firstRoute);
}

const router = createRouter({
  history: createWebHistory((import.meta as any).env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/views/MainView.vue'),
      beforeEnter: async (to, from, next) => {
        const stk = to.query.stk as string;
        if (stk) {
          localStorage.setItem('vicar:session', stk);
        }

        const result = await checkSession();

        if (!firstRoute) firstRoute = to;
        if (result.status === 'not_found') {
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

      ]
    },
    {
      path: '/viewer/:characterId',
      name: 'viewer',
      component: () => import('@/views/ViewerView.vue'),
      beforeEnter: async (to, from, next) => {
        if (!firstRoute) firstRoute = to;
        const characterId = to.params.characterId as any as string;
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

      ]
    }
  ],
})

export default router
