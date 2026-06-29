import { NewsItem, ConvertResult, HistoryItem, BookmarkItem, ConvertStyle } from '../types';

export const CATEGORIES = ['전체', '경제', '과학·IT', '스포츠', '정치', '사회', '국제', '문화', '기타'];

export const STYLE_LIST = [
  { type: 'card' as ConvertStyle,       label: '카드뉴스', icon: 'view_carousel', sub: '핵심만 담은 슬라이드형' },
  { type: 'novel' as ConvertStyle,      label: '소설',     icon: 'auto_stories',  sub: '몰입감 있는 이야기체' },
  { type: 'fairy_tale' as ConvertStyle, label: '동화',     icon: 'child_care',    sub: '누구나 이해하는 쉬운 말' },
];

export const MOCK_NEWS: NewsItem[] = [
  { id: 1, title: '국회 본회의, 예산안 심의 최종 통과… 내년도 예산 확정', description: '여야 합의로 내년도 예산안이 국회 본회의를 통과했다. 총 규모는 658조원으로 올해 대비 5.2% 증가.', source: 'MBC뉴스', publishedAt: '2026-05-28T08:00:00', createdAt: '2026-05-28T08:00:00', url: 'https://example.com/1' },
  { id: 2, title: '삼성전자, 차세대 반도체 공정 세계 최초 양산 돌입', description: '삼성전자가 2나노 공정 기술을 세계 최초로 양산에 돌입하며 반도체 시장 주도권을 강화했다.', source: '한국경제', publishedAt: '2026-05-28T07:00:00', createdAt: '2026-05-28T07:00:00', url: 'https://example.com/2' },
  { id: 3, title: '손흥민, 시즌 15번째 골 폭발… 토트넘 3-1 완승', description: '손흥민이 후반전 두 골을 터뜨리며 팀 승리를 이끌었다. 이번 시즌 득점 선두권에 올라섰다.', source: '스포츠조선', publishedAt: '2026-05-28T05:00:00', createdAt: '2026-05-28T05:00:00', url: 'https://example.com/3' },
  { id: 4, title: 'G7 정상회의 개막… 글로벌 AI 규제 공조 방안 논의', description: 'G7 정상들이 인공지능 규제에 관한 국제 협약 체결을 위한 실무 협의를 시작했다.', source: '연합뉴스', publishedAt: '2026-05-28T04:00:00', createdAt: '2026-05-28T04:00:00', url: 'https://example.com/4' },
  { id: 5, title: '수도권 미세먼지 비상저감조치… 내일까지 자동차 2부제 시행', description: '환경부는 수도권 미세먼지 농도가 나쁨 수준을 이틀 연속 초과해 비상저감조치를 발령했다.', source: 'KBS', publishedAt: '2026-05-28T03:00:00', createdAt: '2026-05-28T03:00:00', url: 'https://example.com/5' },
  { id: 6, title: '코스피 2,700 돌파… 외국인 순매수에 상승세 지속', description: '외국인의 대규모 순매수에 힘입어 코스피 지수가 2,700선을 돌파하며 강세를 이어가고 있다.', source: '매일경제', publishedAt: '2026-05-28T02:00:00', createdAt: '2026-05-28T02:00:00', url: 'https://example.com/6' },
  { id: 7, title: 'AI 기술 혁신으로 바뀌는 미래 교육 현장, 학생·교사 모두가 달라진다', description: '인공지능(AI) 기술이 교육 현장에 빠르게 스며들면서 학습·수업 방식이 근본적으로 변화하고 있다.', source: '조선일보', publishedAt: '2026-05-28T01:00:00', createdAt: '2026-05-28T01:00:00', url: 'https://example.com/7' },
];

export const MOCK_CONVERT_RESULT: Record<ConvertStyle, ConvertResult> = {
  card: {
    resultId: 1, articleId: 7, title: 'AI 기술 혁신으로 바뀌는 미래 교육 현장', originalUrl: 'https://example.com/7',
    style: 'card', createdAt: '2026-05-28T10:00:00',
    convertedText: '1. AI 도입 현황\n전국 초중고 68%가 AI 학습 플랫폼 도입.\n\n2. 맞춤형 학습\nAI 튜터가 개인별 수준 분석·피드백 제공.\n\n3. 교사 역할 변화\n30명 일괄 수업 → 개별 맞춤 지도로 전환.\n\n4. 우려의 목소리\n창의·감성 교육 소홀 및 디지털 과의존 문제 제기.',
  },
  novel: {
    resultId: 2, articleId: 7, title: 'AI 기술 혁신으로 바뀌는 미래 교육 현장', originalUrl: 'https://example.com/7',
    style: 'novel', createdAt: '2026-05-28T10:00:00',
    convertedText: '2026년 봄, 서울의 한 중학교 3학년 교실. 선생님 박지수는 조용히 태블릿 화면을 바라본다. 화면에는 28명 학생 각각의 오늘 수업 이해도가 실시간으로 표시되고 있다.\n\n"민준이는 오늘 분수 개념에서 막혔군." 그녀는 생각하며 아이에게 다가선다. 불과 2년 전만 해도 이런 건 꿈도 꾸지 못했다.',
  },
  fairy_tale: {
    resultId: 3, articleId: 7, title: 'AI 기술 혁신으로 바뀌는 미래 교육 현장', originalUrl: 'https://example.com/7',
    style: 'fairy_tale', createdAt: '2026-05-28T10:00:00',
    convertedText: '옛날옛날에, 학교에는 선생님 한 분이 계셨어요. 선생님은 30명의 친구들을 모두 똑같이 가르쳐야 했답니다.\n\n그런데 어느 날, 마법 같은 AI 친구가 나타났어요! AI 친구는 각 어린이가 어떤 부분을 어려워하는지 금방 알아챘답니다.\n\n이제 학교가 더욱 즐거워졌답니다! 🌟',
  },
};

export const MOCK_HISTORY: HistoryItem[] = [
  { resultId: 1, title: 'AI 기술 혁신으로 바뀌는 미래 교육 현장', style: 'card', originalUrl: 'https://example.com/7', createdAt: '2026-05-28T10:00:00' },
  { resultId: 2, title: '코스피 2,700 돌파… 외국인 순매수에 상승세 지속', style: 'novel', originalUrl: 'https://example.com/6', createdAt: '2026-05-28T09:00:00' },
  { resultId: 3, title: 'G7 정상회의 개막… 글로벌 AI 규제 공조 방안 논의', style: 'fairy_tale', originalUrl: 'https://example.com/4', createdAt: '2026-05-28T08:00:00' },
];

export const MOCK_BOOKMARKS: BookmarkItem[] = [
  { bookmarkId: 1, resultId: 1, title: 'AI 기술 혁신으로 바뀌는 미래 교육 현장', style: 'card', originalUrl: 'https://example.com/7', savedAt: '2026-05-28T10:00:00' },
  { bookmarkId: 2, resultId: 2, title: '코스피 2,700 돌파… 외국인 순매수에 상승세 지속', style: 'novel', originalUrl: 'https://example.com/6', savedAt: '2026-05-27T09:00:00' },
];
