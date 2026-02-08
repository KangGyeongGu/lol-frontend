/**
 * 애플리케이션 전역 메시지 상수
 * 모든 UI 문구는 이 파일에서 관리합니다.
 */
export const MESSAGES = {
  // 공통 버튼 라벨
  COMMON: {
    CANCEL: '취소',
    CONFIRM: '확인',
    BACK: '뒤로가기',
    LOGOUT: '로그아웃',
    MYPAGE: '마이페이지',
    SEND: '전송',
    CREATE: '생성',
    JOIN: 'JOIN',
    LEAVE: '나가기',
    READY: '준비 완료',
    READY_CANCEL: '준비 해제',
    START_GAME: '게임 시작',
  },

  // 게임 타입/모드 라벨
  GAME: {
    RANKED: '랭크전',
    NORMAL: '일반전',
    RANKED_GAME: '랭크 게임',
    NORMAL_GAME: '일반 게임',
  },

  // 방 상태 라벨
  ROOM_STATUS: {
    READY: 'READY',
    HOST: 'HOST',
    IN_GAME: 'IN GAME',
    FULL: 'FULL',
    WAITING: 'WAITING',
    WAITING_PLAYER: 'Waiting for player...',
  },

  // 필터 및 폼 라벨
  FILTER: {
    LANGUAGE: 'Language:',
    TYPE: 'Type:',
    STATUS: 'Status:',
    FILTERS: 'FILTERS',
    ALL: 'ALL',
    ALL_ROOMS: 'ALL ROOMS',
    AVAILABLE: 'AVAILABLE',
    IN_GAME: 'IN-GAME',
    TITLE: 'TITLE',
    HOST: 'HOST',
  },

  // 페이지 헤더 및 네비게이션
  PAGE: {
    BATTLE_ROOMS: 'Battle Rooms',
    CREATE_ROOM: 'Create Room',
    REFRESH_ROOMS: 'Refresh Rooms',
  },

  // 빈 상태 메시지
  EMPTY_STATE: {
    NO_ROOMS: '현재 대기 중인 방이 없습니다.',
    NO_RESULTS: '검색 결과와 일치하는 방이 없습니다.',
  },

  // 인증 관련 메시지
  AUTH: {
    LOGIN_FAILED: '로그인 처리에 실패했습니다.',
    SIGNUP_FAILED: '회원가입에 실패했습니다.',
  },

  // 방 관련 메시지
  ROOM: {
    FETCH_FAILED: '방 정보를 불러오는데 실패했습니다.',
    JOIN_FAILED: '방 참가에 실패했습니다.',
    NEW_ROOM_TITLE: '새 게임 생성',
    ROOM_NAME_LABEL: '방 이름',
    ROOM_NAME_PLACEHOLDER: '배틀룸 이름을 입력하세요...',
    PARTICIPANTS_LABEL: '참가 인원',
    LANGUAGE_LABEL: '사용 언어',
    CREATE_ROOM_BTN: '배틀룸 생성',
    ROOM_SETTINGS: '방 설정',
    GAME_TYPE_LABEL: '게임 유형:',
    MAX_PLAYERS_LABEL: '최대 인원:',
    TIME_LIMIT_LABEL: '제한 시간:',
    LANGUAGE_SETTING_LABEL: '언어:',
  },
} as const;
