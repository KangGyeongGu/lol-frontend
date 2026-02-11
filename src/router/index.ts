import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@/api/auth';
import type { ActiveGame, PageRoute } from '@/api/dtos/auth.dto';

const LoginPage = () => import('@/pages/auth/LoginPage.vue');
const SignupPage = () => import('@/pages/auth/SignupPage.vue');
const MainPage = () => import('@/pages/main/MainPage.vue');
const WaitingRoomPage = () => import('@/pages/room/WaitingRoomPage.vue');

// Active game check cache (5초간 유지)
let activeGameCache: ActiveGame | null | undefined = undefined;
let activeGameCacheTime = 0;
const CACHE_DURATION_MS = 5000;

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
    {
        path: '/match/:roomId/:gameId/play',
        name: 'IN_GAME',
        component: () => import('@/pages/match/InGamePage.vue'),
        meta: { authRequired: true }
    },
    {
        path: '/match/:roomId/:gameId/result',
        name: 'RESULT',
        component: () => import('@/pages/match/MatchResultPage.vue'),
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
    routes.push({
        path: '/dev/in-game/:roomId?/:gameId?',
        name: 'DEV_IN_GAME',
        component: () => import('@/pages/match/InGamePage.vue'),
        meta: { public: true }
    });
}

const router = createRouter({
    history: createWebHistory(),
    routes
});

/**
 * 캐시된 active game을 가져옵니다. 캐시가 없거나 만료된 경우 API를 호출합니다.
 */
async function getCachedActiveGame(): Promise<ActiveGame | null> {
    const now = Date.now();
    if (activeGameCache !== undefined && (now - activeGameCacheTime) < CACHE_DURATION_MS) {
        return activeGameCache;
    }

    try {
        const activeGame = await authApi.getActiveGame();
        activeGameCache = activeGame;
        activeGameCacheTime = now;
        return activeGame;
    } catch (error) {
        // API 호출 실패 시 캐시를 초기화하고 null 반환
        activeGameCache = null;
        activeGameCacheTime = now;
        return null;
    }
}

/**
 * Active game 캐시를 초기화합니다.
 */
export function clearActiveGameCache(): void {
    activeGameCache = undefined;
    activeGameCacheTime = 0;
}

/**
 * PageRoute를 라우터 이름으로 변환합니다.
 */
function pageRouteToRouteName(pageRoute: PageRoute, roomId: string, gameId: string) {
    switch (pageRoute) {
        case 'WAITING_ROOM':
            return { name: 'WAITING_ROOM', params: { roomId } };
        case 'BAN_PICK_SHOP':
            return { name: 'BAN_PICK_SHOP', params: { roomId, gameId } };
        case 'IN_GAME':
            return { name: 'IN_GAME', params: { roomId, gameId } };
    }
}

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    // 인증 필요한 페이지에 미인증 상태로 접근 시
    if (to.meta.authRequired && !authStore.isAuthenticated) {
        next({ name: 'LOGIN' });
        return;
    }

    // 로그인 페이지에 인증 상태로 접근 시
    if (to.name === 'LOGIN' && authStore.isAuthenticated) {
        next({ name: 'MAIN' });
        return;
    }

    // 인증된 사용자가 MAIN 또는 public 페이지로 이동 시 active game 체크
    if (authStore.isAuthenticated && (to.name === 'MAIN' || to.meta.public)) {
        try {
            const activeGame = await getCachedActiveGame();
            if (activeGame) {
                // Active game이 존재하면 해당 게임 페이지로 리디렉션
                const targetRoute = pageRouteToRouteName(
                    activeGame.pageRoute,
                    activeGame.roomId,
                    activeGame.gameId
                );
                // targetRoute가 undefined이면 리디렉션 불가 (원래 목적지로 이동)
                if (!targetRoute) {
                    next();
                    return;
                }
                // 현재 목적지가 이미 해당 게임 페이지인 경우 무한 루프 방지
                if (to.name === targetRoute.name &&
                    to.params.roomId === targetRoute.params.roomId &&
                    to.params.gameId === targetRoute.params.gameId) {
                    next();
                } else {
                    next(targetRoute);
                }
                return;
            }
        } catch (error) {
            // Active game 체크 실패 시 원래 목적지로 이동
            console.error('[Router] Active game check failed:', error);
        }
    }

    next();
});

export default router;
