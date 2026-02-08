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
 * TIME_SYNC 이벤트 data (EVENTS.md 2.1절)
 * Topic: /user/queue/time
 */
export interface TimeSyncData {
    serverTime: string;
}
