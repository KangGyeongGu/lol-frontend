import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const LoginPage = () => import('@/pages/auth/LoginPage.vue');
const SignupPage = () => import('@/pages/auth/SignupPage.vue');
const MainPage = () => import('@/pages/main/MainPage.vue');
const MyPage = () => import('@/pages/user/MyPage.vue');
const WaitingRoomPage = () => import('@/pages/room/WaitingRoomPage.vue');

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'LOGIN',
        component: LoginPage,
        meta: { public: true }
    },
    {
        path: '/signup',
        name: 'SIGNUP',
        component: SignupPage,
        meta: { public: true }
    },
    {
        path: '/main',
        name: 'MAIN',
        component: MainPage,
        meta: { authRequired: true }
    },
    {
        path: '/mypage',
        name: 'MY_PAGE',
        component: MyPage,
        meta: { authRequired: true }
    },
    {
        path: '/room/:roomId',
        name: 'WAITING_ROOM',
        component: WaitingRoomPage,
        meta: { authRequired: true }
    },
    {
        path: '/match/:roomId/:gameId',
        name: 'BAN_PICK_SHOP',
        component: () => import('@/pages/match/BanPickShopPage.vue'),
        meta: { authRequired: true }
    },
];

if (import.meta.env.DEV) {
    routes.push({
        path: '/dev/ban-pick-shop/:roomId?/:gameId?',
        name: 'DEV_BAN_PICK_SHOP',
        component: () => import('@/pages/match/BanPickShopPage.vue'),
        meta: { public: true }
    });
}

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta.authRequired && !authStore.isAuthenticated) {
        next({ name: 'LOGIN' });
    } else if (to.name === 'LOGIN' && authStore.isAuthenticated) {
        next({ name: 'MAIN' });
    } else {
        next();
    }
});

export default router;
