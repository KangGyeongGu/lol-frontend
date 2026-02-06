export interface LoginRequest {
    authorizationCode: string;
}

export type LoginResult = 'OK' | 'SIGNUP_REQUIRED';

export interface UserSummary {
    userId: string;
    nickname: string;
    tier: string;
    score: number;
}

export interface LoginResponse {
    result: LoginResult;
    accessToken?: string;
    refreshToken?: string;
    signupToken?: string;
    user?: UserSummary;
}

export interface SignupRequest {
    signupToken: string;
    nickname: string;
    language: string;
}

export interface SignupResponse {
    accessToken: string;
    refreshToken: string;
    user: UserSummary;
}
