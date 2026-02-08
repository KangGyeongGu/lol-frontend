import type { UserSummary, UserProfile } from '@/api/dtos/auth.dto';

// ViewModel 타입 정의
export interface UserViewModel {
    userId: string;
    nickname: string;
    tier: string;
    score: number;
}

export interface UserProfileViewModel {
    userId: string;
    nickname: string;
    language: string;
    tier: string;
    score: number;
    exp: number;
    coin: number;
}

// DTO → ViewModel 변환 함수
export function toUserViewModel(dto: UserSummary): UserViewModel {
    return { ...dto };
}

export function toUserProfileViewModel(dto: UserProfile): UserProfileViewModel {
    return { ...dto };
}
