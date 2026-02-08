# League of Algo Logic (Frontend)

실시간 알고리즘 대전 플랫폼 **League of Algo Logic**의 프론트엔드.

## Tech Stack

| Category | Stack |
|---|---|
| Core | Vue 3 (Composition API), TypeScript 5.9 |
| Build | Vite 7.2 |
| State | Pinia 3 |
| Realtime | STOMP over WebSocket (`@stomp/stompjs`) |
| HTTP | Axios |
| Style | SCSS (Design Tokens, CSS Variables) |

## Directory Structure

```
src/
├── api/                  # REST 클라이언트 및 DTO
│   ├── core/             #   Axios 인스턴스, 인터셉터
│   └── dtos/             #   요청/응답 인터페이스
├── entities/             # DTO → ViewModel 변환
├── stores/               # Pinia 스토어
├── realtime/             # STOMP 클라이언트, EventDispatcher
├── shared/               # 공용 모듈
│   ├── composables/      #   useServerClock 등
│   ├── constants/        #   UI 메시지 상수
│   ├── types/            #   공용 타입
│   ├── ui/               #   BaseBadge, BaseButton
│   └── utils/            #   토큰 유틸리티
├── features/             # 도메인 기능 단위 (chat 등)
├── pages/                # 라우트 단위 페이지
│   ├── auth/             #   LoginPage, SignupPage
│   ├── main/             #   MainPage (방 목록, 허브)
│   ├── room/             #   WaitingRoomPage (대기실)
│   ├── match/            #   BanPickShopPage (밴/픽/상점)
│   └── user/             #   MyPage
├── widgets/              # 페이지 횡단 위젯 (모달, 목록)
├── router/               # Vue Router 설정, 가드
├── styles/               # 전역 스타일, 디자인 토큰
└── assets/               # 이미지, 정적 자원
```

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | LoginPage | 카카오 OAuth2 로그인 |
| `/signup` | SignupPage | 닉네임 설정 후 회원가입 |
| `/main` | MainPage | 방 목록 조회/필터, 방 생성, 글로벌 채팅 |
| `/mypage` | MyPage | 전적/통계 조회 |
| `/room/:roomId` | WaitingRoomPage | 대기실 (준비/시작, 로비 채팅) |
| `/match/:roomId/:gameId` | BanPickShopPage | 밴 → 픽 → 상점 단계 진행 |

## Features

### Authentication
- 카카오 OAuth2 소셜 로그인
- JWT Access/Refresh Token (localStorage)
- 라우터 가드로 비인증 접근 차단

### Room
- 방 목록 실시간 조회 및 필터링 (언어, 게임 타입, 상태)
- 방 생성/참가/퇴장/강퇴
- 대기실 로비 STOMP 구독 (`/topic/rooms/{roomId}/lobby`)

### Match (Ban/Pick/Shop)
- BAN → PICK → SHOP 3단계 phase navigator
- 서버 시간 동기화 기반 타이머 (`useServerClock`)
- 알고리즘 카탈로그에서 밴/픽 선택
- 아이템/스펠 장바구니 구매

### Realtime
- STOMP WebSocket 싱글턴 (`StompClient`)
- `EventDispatcher`가 토픽별 메시지를 Pinia 스토어로 라우팅
- 유저 큐 구독: 에러, 시간 동기화, 인벤토리
- `ROOM_GAME_STARTED` 이벤트로 대기실 → 매치 페이지 전환

### Design Tokens
- `tokens.scss`에서 색상, 폰트, 간격, 반경 등 정의
- `--gu` (Global Unit) 기반 반응형 스케일링
- 16:9 비율 컨테이너 레이아웃

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 (localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | API 베이스 경로 (기본: `/api/v1`) |
| `VITE_KAKAO_CLIENT_ID` | 카카오 REST API 키 |
| `VITE_REDIRECT_URI` | 카카오 로그인 리다이렉트 URI |

## Proxy

개발 서버에서 아래 경로를 백엔드(`localhost:8080`)로 프록시합니다.

| Path | Target | Note |
|---|---|---|
| `/api` | `http://localhost:8080` | REST API |
| `/ws` | `http://localhost:8080` | WebSocket |
