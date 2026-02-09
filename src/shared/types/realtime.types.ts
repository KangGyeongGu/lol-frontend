/**
 * STOMP Event Envelope (CONVENTIONS.md 3.1절)
 * 모든 서버→클라이언트 이벤트의 공통 구조
 */
export interface StompEventMeta {
    eventId: string;
    serverTime: string;
}

export interface StompEventEnvelope {
    type: string;
    data: unknown;
    meta: StompEventMeta;
}

/**
 * STOMP Command Envelope (CONVENTIONS.md 3.2절)
 * 모든 클라이언트→서버 명령의 공통 구조
 */
export interface CommandMeta {
    commandId: string;
    clientTime: string;
}

export interface CommandEnvelope<T = unknown> {
    type: string;
    data: T;
    meta: CommandMeta;
}

/**
 * TIME_SYNC 이벤트 data (EVENTS.md 2.1절)
 * Topic: /user/queue/time
 */
export interface TimeSyncData {
    serverTime: string;
}
