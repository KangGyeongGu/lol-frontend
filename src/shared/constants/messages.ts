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

  // 매치 관련 메시지 (밴/픽/상점)
  MATCH: {
    PHASE_BAN: '알고리즘 밴',
    PHASE_PICK: '알고리즘 픽',
    PHASE_SHOP: '아이템 / 스펠 구매',
    BAN_INSTRUCTION: '밴할 알고리즘을 선택하세요',
    PICK_INSTRUCTION: '픽할 알고리즘을 선택하세요',
    SHOP_INSTRUCTION: '아이템과 스펠을 구매하세요',
    SELECT: '선택',
    PURCHASE: '구매하기',
    ITEMS_LABEL: '아이템',
    SPELLS_LABEL: '스펠',
    SELECTED_ITEMS: '선택된 아이템',
    SELECTED_SPELLS: '선택된 스펠',
    TOTAL_COST: '총 비용:',
    WAITING_FOR_PLAYER: 'WAITING FOR PLAYER...',
  },

  // 인게임 관련 메시지 (문제/에디터/인벤토리/채점)
  IN_GAME: {
    // ProblemPanel
    PROBLEM_DESCRIPTION: '문제 설명',
    PROBLEM_EXAMPLES: '예시',
    EXAMPLE_PREFIX: '예시',
    INPUT_LABEL: '입력:',
    OUTPUT_LABEL: '출력:',

    // EditorPanel
    JUDGING: '채점 중',
    EARLY_TERMINATE: '조기종료',

    // InventoryPanel
    ITEMS: '아이템',
    SPELLS: '스펠',
    ITEM_EMPTY: '아이템 없음',
    SPELL_EMPTY: '스펠 없음',

    // ResultDrawer
    JUDGE_RESULT: '채점 결과',
    TEST_CASE_PREFIX: '테스트케이스',
    STATUS_PENDING: '채점중',
    STATUS_SUCCESS: '성공',
    STATUS_FAILURE: '실패',
    CHALLENGE_TITLE: 'Challenge Result',
  },

  // 결과 페이지 관련 메시지
  RESULT: {
    MATCH_SUMMARY: '경기 결과',
    SUBMISSION: '제출',
    SPEED: '속도',
    MEMORY: '메모리',
    RETRY: '다시 도전하기',
    GO_MAIN: '메인으로 돌아가기',
  },

  // 마이페이지 관련 메시지
  MY_PAGE: {
    // 메인 탭
    TAB_INFO: '내정보',
    TAB_HISTORY: '대전기록',

    // 프로필 헤더 통계 라벨
    STATS_COIN: 'COIN',
    STATS_RATING: 'RATING',
    STATS_TOTAL_GAMES: 'TOTAL GAMES',
    STATS_TOTAL_WIN: 'TOTAL WIN',
    STATS_AVG_RANK: 'AVERAGE RANK',

    // 계정 정보 섹션
    ACCOUNT_INFO: '계정 정보',
    LABEL_SOCIAL_LOGIN: '소셜 로그인',
    LABEL_NICKNAME: '닉네임',
    LABEL_EMAIL: '연동 이메일',
    LABEL_LANGUAGE: '주 언어',
    LABEL_JOIN_DATE: '가입일',
    BTN_CHANGE: '변경',
    BTN_EDIT: '수정',
    BTN_WITHDRAW: '회원탈퇴',
    BTN_LOGOUT: '로그아웃',
    CERTIFIED: '인증됨',

    // 티어/통계 서브탭
    SUBTAB_TIER: '티어',
    SUBTAB_STAT: '통계',

    // 티어 뷰
    TIER_BADGE: '티어 배지',
    NEXT_TIER: 'Next Tier',
    WIN_RATE: 'Win Rate',
    SOLVED_RATE: 'Solved Rate',

    // 통계 뷰 (레이더 차트)
    STAT_GRAPH: 'DP',
    STAT_GREEDY: 'Greedy',
    STAT_BACKTRACKING: 'Backtracking',
    STAT_DFS: 'DFS',
    STAT_BFS: 'BFS',
    STAT_DIJKSTRA: 'Dijkstra',

    // 대전기록 섹션
    MATCH_STATUS_WIN: 'WIN',
    MATCH_STATUS_LOSE: 'LOSE',
    MATCH_STATUS_DRAW: 'DRAW',
    MATCH_DIFFICULTY: '난이도',
    MATCH_PLAYERS: '플레이어',
    MATCH_VIEW_RESULT: '결과 보기',

    // 빈 상태
    EMPTY_MATCH_HISTORY: '아직 대전 기록이 없습니다.',
    LOADING: '로딩 중...',
  },
} as const;
