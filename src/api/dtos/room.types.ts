export interface RoomSummary {
    roomId: string; // UUID
    hostId: string;
    hostNickname: string;
    title: string;
    gameMode: 'SPEED' | 'OPTIMIZATION'; // TBD
    status: 'WAITING' | 'PLAYING';
    currentPlayers: number;
    maxPlayers: number;
    language?: string;
    roomType: 'RANK' | 'NORMAL';
}

export interface CreateRoomRequest {
    title: string;
    gameMode: string;
}

export interface JoinRoomResponse {
    roomId: string;
    token?: string; // If room access token needed
}
