export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface SuccessEnvelope<T> {
    data: T;
    meta?: {
        serverTime: string;
    };
}

export interface ErrorEnvelope {
    error: ApiError;
    meta: {
        requestId: string;
        serverTime: string;
    };
}
