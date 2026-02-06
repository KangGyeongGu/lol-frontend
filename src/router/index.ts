import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

// FE_ROUTING_RULES: "Lazy Loading을 기본으로 한다."
const LoginPage = () => import('@/pages/auth/LoginPage.vue');
const SignupPage = () => import('@/pages/auth/SignupPage.vue');
const MainPage = () => import('@/pages/main/MainPage.vue');
const MyPage = () => import('@/pages/user/MyPage.vue');

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
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.authRequired && !authStore.isAuthenticated) {
        next({ name: 'LOGIN' });
    } else if (to.name === 'LOGIN' && authStore.isAuthenticated) {
        // If already logged in, go to MAIN
        next({ name: 'MAIN' });
    } else {
        next();
    }
});

export default router;
