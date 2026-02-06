# League of Algo Logic (Frontend)

실시간 알고리즘 대전 플랫폼, **League of Algo Logic**의 프론트엔드 프로젝트입니다.  
고급스러운 사이버펑크(Cyberpunk) 테마를 바탕으로, 복잡한 게임 상태를 실시간으로 시각화하고 최적의 UX를 제공하는 것을 목표로 합니다.

---

## 🛠 Tech Stack

- **Core**: Vue 3 (Composition API), TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Vanilla SCSS (Design Tokens 기반)
- **Networking**: Axios (Interceptor를 통한 공통 처리)
- **Design Pattern**: 
  - **Thin Core Layer**: 가벼운 핵심 인프라 구축 후 기능을 수직적으로 구현
  - **Feature-First**: 도메인/기능 중심의 구조 설계
  - **SSOT (Single Source of Truth)**: OpenAPI Specification에 따른 타입 및 통신 규격 일치

---

## 📂 Directory Structure

```text
src/
├── api/             # API 통신 레이어
│   ├── core/        # Axios 인스턴스 및 인터셉터 설정
│   ├── dtos/        # OpenAPI 규격 기반 TypeScript 인터페이스
│   └── mock/        # 백엔드 미구동 시 사용되는 Mocking 시스템
├── assets/          # 정적 자원 (이미지, 디자인 토큰 등)
├── pages/           # 페이지 수준 컴포넌트
│   ├── auth/        # 로그인, 회원가입 관련
│   ├── main/        # 대시보드(허브), 대기실 목록
│   └── user/        # 마이페이지 관련
├── stores/          # Pinia 상태 관리 (Domain-driven)
├── widgets/         # 재사용 가능한 UI 모듈
├── styles/          # 전역 스타일 및 테마 정의
├── router/          # Vue Router 설정 및 네비게이션 가드
└── utils/           # 유틸리티 함수 (토큰 관리 등)
```

---

## ✨ Core Features

### 1. 인증 시스템 (Authentication)
- 카카오 OAuth2 기반 소셜 로그인 기능
- JWT(Access/Refresh Token) 기반의 보안 세션 관리
- 비로그인 사용자의 접근을 제어하는 라우터 가드

### 2. 배틀룸 관리 (Room Management)
- 실시간 방 목록 조회 및 필터링 (언어별, 게임 타입별)
- 정교한 UI의 배틀룸 생성 모달 및 참여 로직 구현
- 대기실 상태 동기화 인프라 구축

### 3. API Mocking 시스템
- 백엔드 서버 없이도 프론트엔드 기능을 독립적으로 개발/테스트할 수 있는 모킹 아키텍처
- `VITE_API_MOCK` 환경 변수를 통한 간편한 활성화/비활성화 제어
- 실제 네트워크 지연 시간을 시뮬레이션하여 현실적인 UX 테스트 가능

### 4. 사이버펑크 디자인 시스템
- 네온 액센트, 글래스모피즘(Glassmorphism), 다이나믹한 애니메이션 적용
- 디자인 토큰(`tokens.scss`)을 통한 일관된 색상 및 스타일 관리

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
# 로컬 개발 서버 실행
npm run dev
```

### Build
```bash
# 배포용 번들 생성
npm run build
```

---

## ⚙️ Environment Variables

`.env` 파일을 생성하여 아래 환경 변수들을 설정하십시오.

| 변수명 | 설명 | 비고 |
|:--- |:--- |:--- |
| `VITE_API_BASE_URL` | API 서버 기본 주소 | 기본값: `/api/v1` |
| `VITE_API_MOCK` | API 모킹 여부 | `true` 시 모킹 활성 |
| `VITE_KAKAO_CLIENT_ID` | 카카오 REST API 키 | - |
| `VITE_REDIRECT_URI` | 카카오 로그인 리다이렉트 URI | - |

---

## ⚖️ Design Strategy
본 프로젝트는 **SSOT** 원칙을 최우선으로 합니다. 모든 데이터 모델과 통신 규격은 `OPENAPI.yaml.md`에서 정의된 내용을 엄격히 따르며, 모든 UI 컴포넌트는 사용자의 몰입감을 극대화할 수 있는 **Premium Cyberpunk Aesthetics**를 지향합니다.
