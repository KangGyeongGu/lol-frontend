import type { AxiosRequestConfig } from 'axios';

export type MockHandler = (config: AxiosRequestConfig) => any;

export interface MockRegistry {
    [method: string]: {
        [url: string]: MockHandler | any;
    };
}

export const mockRegistry: MockRegistry = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
    PATCH: {}
};

/**
 * Mock 핸들러 등록
 */
export function registerMock(method: string, url: string, handler: MockHandler | any) {
    const m = method.toUpperCase() as keyof MockRegistry;
    if (mockRegistry[m]) {
        mockRegistry[m][url] = handler;
    }
}

/**
 * 요청에 맞는 Mock 핸들러 탐색
 */
export function findMock(config: AxiosRequestConfig) {
    const method = (config.method?.toUpperCase() || 'GET') as keyof MockRegistry;
    const url = config.url || '';

    const methodRegistry = mockRegistry[method];
    if (!methodRegistry) return null;

    // Exact match
    const handler = methodRegistry[url];
    if (handler) return handler;

    // 패턴 매칭 (예: /rooms/{roomId}) - 단순 구현
    for (const [pattern, h] of Object.entries(methodRegistry)) {
        const regex = new RegExp(`^${pattern.replace(/\{[^}]+\}/g, '[^/]+')}$`);
        if (regex.test(url)) {
            return h;
        }
    }

    return null;
}
