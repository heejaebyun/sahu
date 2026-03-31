# 변경 로그

## 2026-03-29 (창업자 + Claude Code)

### 코드 수정
1. **DatePicker useEffect deps 수정** (`app/page.js`) — `onChange`, `value` dependency 누락 → 추가. React strict mode 경고 해소.
2. **globals.css transition 범위 축소** — `*, *::before, *::after` 전체 transition → `a, button, input, select, textarea, .link-card`만. 페이지 로드 깜빡임 및 스크롤 성능 개선.
3. **상담 완료 상태 localStorage 연동** (`app/page.js`) — `consultSubmitted` state + `sahu-consult-done` localStorage 키 추가. 새로고침해도 상담 완료 상태 유지.

### 인프라 수정
4. **run-company.mjs에 변경 로그 연동** — 회의 전 `agents/board/changelog.md`를 읽어서 에이전트 프롬프트에 포함. 에이전트들이 최신 변경사항을 알고 회의하도록 개선.

### 에이전트 점검 및 수정
5. **cto-agent.mjs import 오류 수정** — `import { execSync } from "fs"` → `"child_process"`로 수정.
6. **이미 해결된 아이디어/요청 제거** — CTO: GitHub Actions(결정#7), 상담폼(결정#10) 제거. 비즈니스: 상담폼 기술검토 요청 제거. 운영: GitHub Actions 아이디어 제거. CEO: 지식IN 답변(결정#8), GitHub secrets 수동작업 제거.
7. **ceo-agent.mjs 역할 정리** — run-company.mjs와 중복되던 크롤링/회의/브리핑 로직 제거. 의사결정 유틸 함수(addDecision, suggestDecision, loadDecisionLog)만 export하는 모듈로 축소.
8. **리서치 큐 파일 기반 전환** — 하드코딩 RESEARCH_QUEUE → `agents/research/research-queue.json`에서 읽고 쓰도록 변경. `addResearchItem()` 함수 추가로 외부에서 동적으로 조사 항목 추가 가능.

### 회의 프로세스 개선
10. **run-company.mjs에 SPEC.md 주입** — 모든 에이전트가 회의 전 스펙 문서를 읽고 현재 구현된 기능을 파악하도록 변경. 이미 구현된 기능을 다시 제안하면 평가 감점 규칙 추가.

### 문서
9. **SPEC.md 생성** — 서비스 전체 스펙 문서 작성. 페이지 구조, API, 데이터 모델, 자동화 파이프라인, 에이전트 시스템, Google Sheets 구조, SEO, 확정 결정, 현재 상태 포함.

### 문서 (추가)
15. **ROADMAP.md에 피보팅 전략 추가** — 트리거 조건(50명/0건/0건), 피보팅 3순위(생애행정 확장 → 세무사 매칭 특화 → AI 운영 키트 SaaS), 보존 자산 목록 포함.
14. **ROADMAP.md 생성** — Phase 1(트래픽 확보) → Phase 2(수익화 검증) → Phase 3(스케일업) 전체 로드맵. 마일스톤별 담당/기한/측정지표/성공기준 포함. 수익 시뮬레이션 포함.

### 에이전트 역량 강화 (3/30)
26. **에이전트 웹 검색/리서치 활성화** — `run-company.mjs`, `hr-agent.mjs`, `check-consult.mjs`에 `--allowedTools "WebSearch,WebFetch"` 추가. 에이전트들이 회의 시 직접 웹 검색, URL 읽기, 논문 확인 후 답변하도록 변경. 학습 데이터만으로 답하면 감점 규칙 추가.

### 버그 수정 (3/30)
23. **CLI 경로 수정** — `run-company.mjs`, `hr-agent.mjs`, `check-consult.mjs` 3개 파일. `which claude` 우선 → VS Code 확장 → `/Users/byunheejae/.local/bin/claude` 폴백 순서.
24. **publish-status.json 업데이트** — 02-inheritance-renounce 발행 반영. 발행 완료 3편.
25. **크롤링 이상값 방지** — `daily-kin-crawl.mjs`에 키워드 화이트리스트 검증 추가. KEYWORDS 배열에 없는 키워드는 저장 안 함.

### 확정 결정 추가
22. **카페 시딩도 안 함 (결정 #2 범위 확대)** — 카페 운영뿐 아니라 타 카페 정보글 게시도 안 함. 카페 관련 제안 일체 금지.

### 창업자 실행 완료 (추가)
27. **블로그 4편째 발행 완료 (3/31)** — 04-bank-accounts (은행계좌 정리). 잔여 대기: 5편.
28. **네이버 서치어드바이저 수동 색인 요청 완료 (3/31)** — 가이드 6개 URL 개별 수집 요청. 1~3일 내 색인 예상.
21. **블로그 3편째 발행 완료 (3/30)** — 02-inheritance-renounce (상속포기 방법 & 기한 총정리). 잔여 대기: 6편.

### 에이전트 추가 (2)
20. **사업개발 에이전트 신설** (`agents/bizdev-agent.mjs`) — 신규 사업 기회 발굴/검증 담당. 기존 자산에 국한하지 않고 탐색. "경쟁자 0개" 주장 시 근거 필수 규칙 적용. run-company.mjs 회의 + HR 평가 대상 추가.

### 회의 구조 변경
19. **3라운드 회의 체계 도입** (`run-company.mjs`) — 기존: 각자 독백 → CEO 종합. 변경: 1라운드(각자 발언) → 2라운드(전원 발언 공유 후 상호 반박/동의/질문) → 3라운드(CEO가 1+2 종합, 반박된 제안은 제외). Google Sheets 회의록 탭도 브랜딩+2라운드 컬럼 추가.

### 에이전트 추가
18. **브랜딩 에이전트 신설** (`agents/branding-agent.mjs`) — 브랜드 아이덴티티, UX, 톤앤매너, 첫인상, 랜딩 전략 담당. `run-company.mjs` 회의에 6번째 에이전트로 참석. HR 평가 대상에도 추가.

### 가이드 연결 (자체 + 외부)
17. **체크리스트 항목별 가이드 연결** — 자체 가이드 있는 항목(사망신고, 안심상속, 은행계좌, 상속포기)은 내부 링크, 없는 항목은 정부 공식 사이트로 연결. 사망진단서→정부24, 장례→e하늘, 상속세→국세청, 부동산→등기소+위택스+법률구조공단, 자동차→자동차365, 유족연금→국민연금공단+정부24, 숨은보험→내보험찾아줌+금감원.

### 정부 서비스 바로가기 연결
16. **체크리스트에 정부 서비스 바로가기 링크 추가** (`lib/checklist-data.js` + `app/page.js`)
    - 사망신고 → 정부24
    - 장례 → e하늘 장사정보시스템 (장례식장 검색)
    - 가족관계증명서 → 대법원 전자가족관계등록시스템
    - 안심상속 → 정부24 안심상속 원스톱
    - 숨은보험 → 내보험찾아줌 + 금감원 파인
    - 유족연금 → 국민연금공단
    - 상속포기 → 대한법률구조공단 (무료 법률 상담)
    - 상속세 → 국세청 홈택스
    - 부동산 등기 → 대법원 인터넷등기소 + 위택스
    - 자동차 → 자동차민원 대국민포털
    - UI: 항목 펼치면 "바로가기" 섹션에 외부 링크 표시
    - 목적: 무료 정보 제공으로 신뢰도 구축 (미끼 역할)

### 에이전트 과제 구현
12. **발행 리마인더 스크립트 생성** (`scripts/publish-reminder.mjs`) — 검색량 순으로 발행 순서 정렬, `publish-status.json`으로 발행 상태 추적. 이미 발행한 09, 01번 반영 완료.
13. **크롤링 키워드 3개 확장** (`scripts/daily-kin-crawl.mjs`) — "장례 후 절차", "사망 후 부동산", "사망 후 자동차 명의변경" 추가. 기존 12개 → 15개.

### 창업자 실행 완료
11. **블로그 2편 발행 완료 (3/29)** — 09-after-death-checklist ("사망 후 해야할 일" 종합 체크리스트) + 01-death-report (사망신고 방법). 잔여 대기: 7편.

### 참고
- `google-credentials.json`은 이미 `.gitignore` 처리 확인 완료.
- CTO가 제기한 CLI 하드코딩 이슈는 이미 `run-company.mjs` line 11에서 자동 감지 로직으로 수정됨.
