# SAHU (사후) — 서비스 스펙 문서

> 최종 업데이트: 2026-03-29

## 서비스 개요
사망 후 행정 처리 가이드. 사망일 입력 시 31개 할일의 D-day를 자동 계산하고, 절차별 상세 가이드를 제공한다.

- **URL**: https://sahu.kr
- **기술 스택**: Next.js 16 (App Router) + React 19
- **배포**: Vercel (자동 배포)
- **DB**: Google Sheets (googleapis)
- **도메인**: sahu.kr

---

## 페이지 구조

### 1. 메인 체크리스트 (`/`)
- **타입**: Client Component (`use client`)
- **기능**:
  - 사망일 선택 (년/월/일 드롭다운)
  - 21개 체크리스트 항목 표시, 6개 카테고리로 분류
  - D-day 자동 계산 (일부 항목은 월말 기준 계산: `deadlineFromMonthEnd`)
  - 기한 초과 항목 빨간색, 14일 이내 항목 노란색 알림
  - 체크박스로 완료 표시 + 진행률 바
  - 항목 펼치면 상세 정보 (어디서, 필요 서류, 참고사항)
  - 공유 버튼 (Web Share API, 미지원 시 클립보드 복사)
  - 초기화 버튼 (confirm 후 localStorage 삭제)
- **데이터 저장**: `localStorage` (`sahu-data` 키에 deathDate + checkedItems)
- **하단 링크**: 구독 해지 가이드, 절차별 상세 가이드

### 2. 전문가 상담 신청 (메인 페이지 내 모달)
- **트리거**: 체크리스트 화면 우하단 플로팅 버튼 (💬 전문가 상담)
- **UI**: 바텀시트 모달
- **입력 필드**: 이름(필수), 연락처(필수), 필요 서비스(선택), 상세 내용(선택)
- **서비스 옵션**: 상속세 신고, 상속포기/한정승인, 부동산 상속등기, 재산 조회/정리, 기타
- **제출**: `POST /api/consult` → Google Sheets "상담신청" 시트에 저장
- **상태 관리**: 제출 완료 시 `localStorage`에 `sahu-consult-done` 저장 → 새로고침해도 버튼 숨김

### 3. 가이드 허브 (`/guides`)
- **타입**: Server Component
- 4개 가이드로 연결하는 카드 목록

### 4. 사망신고 가이드 (`/guides/death-report`)
- 사망신고란, 기한(1개월, 과태료 5만원), 신고의무자 순위
- 필요 서류 (사망진단서, 신고인 신분증)
- 신고 장소 3곳
- 신고 후 할 일, FAQ

### 5. 상속포기/한정승인 가이드 (`/guides/inheritance-renounce`)
- 상속포기 vs 한정승인 비교표
- 3개월 기한 (연장 불가)
- 판단 기준 (채무/자산 비율)
- 필요 서류, 절차 5단계
- 주의사항 (취소 불가, 가족 영향)

### 6. 안심상속 원스톱 가이드 (`/guides/safe-inheritance`)
- 서비스 개요 (고인 재산/부채 일괄 조회)
- 기한 (사망월 말일로부터 1년)
- 신청 방법 (오프라인: 주민센터, 온라인: 정부24)
- 조회 항목 6개, 결과 수령 기간 (7일/20일)

### 7. 은행계좌 정리 가이드 (`/guides/bank-accounts`)
- 절차 순서 (안심상속 → 합의 → 서류 → 은행 방문)
- 필요 서류, 단독상속인/공동상속인 케이스
- 주의사항 (사전 인출 = 횡령, 자동이체 해지, 대출은 상속 채무)

### 8. 구독/계정 해지 가이드 (`/subscriptions`)
- **타입**: Client Component (`use client`)
- 6개 카테고리, 40+개 서비스
  - 통신 (SKT, KT, LG U+)
  - 영상/음악 (넷플릭스, 유튜브 프리미엄, 멜론, 스포티파이 등)
  - 쇼핑/배달 (쿠팡 와우, 네이버 플러스, 배민)
  - 금융/보험 (카드 자동결제)
  - SNS/디지털 (카카오톡, 네이버, 구글, 인스타/페이스북)
  - 공과금 (전기/가스/수도, 관리비)
- 각 서비스: 해지 방법, 전화번호, 필요 서류, 특이사항
- 카테고리별 체크박스 진행 추적

---

## API

### `POST /api/consult`
- **입력**: `{ name, phone, deathDate?, needs?, detail? }`
- **검증**: name, phone 필수
- **인증**: `GOOGLE_CREDENTIALS_JSON` 환경변수
- **동작**: Google Sheets "상담신청" 시트에 행 추가 (시트 없으면 자동 생성)
- **응답**: `{ success: true }` 또는 `{ error: "메시지" }`

---

## 데이터 모델

### CHECKLIST (lib/checklist-data.js)
```
{
  id: string,
  category: "immediate" | "week1" | "month1" | "month3" | "month6" | "after",
  title: string,
  description: string,
  where: string,
  documents: string[],
  tips: string[],
  deadline: number (사망일로부터 일수),
  deadlineFromMonthEnd: boolean,
  critical: boolean
}
```
- **카테고리 6개**: 즉시, 1주 이내, 1개월 이내, 3개월 이내, 6개월 이내, 이후

### SUBSCRIPTIONS (lib/subscription-data.js)
```
{
  category: string,
  services: [{
    name: string,
    phone: string,
    method: string,
    documents: string,
    note: string
  }]
}
```

---

## 자동화 파이프라인

### 크론 스케줄 (로컬 crontab)
| 시간 | 스크립트 | 설명 |
|------|----------|------|
| 매일 22:00 | `agents/run-company.mjs` | 에이전트 경영 회의 |
| 매일 23:00 | `scripts/daily-kin-crawl.mjs` | 네이버 지식IN 크롤링 |
| 금요일 | `agents/hr-agent.mjs` | 에이전트 주간 평가 (run-company.mjs에서 호출) |

### 수동 실행 스크립트
| 스크립트 | 설명 |
|----------|------|
| `scripts/generate-blog-posts.mjs` | 블로그 10편 생성 (월요일 또는 수동) |
| `scripts/generate-brunch-posts.mjs` | 브런치 5편 생성 |
| `scripts/measure-performance.mjs` | 성과 측정 → Google Sheets |
| `scripts/crawl-kin.mjs` | 지식IN 수동 크롤링 |
| `scripts/enrich-kin.mjs` | 크롤링 데이터 품질 스코어링 |
| `scripts/fix-templates.mjs` | 답변 템플릿 수정 (줄바꿈, UTM) |
| `scripts/upload-to-sheets.mjs` | TSV → Google Sheets 업로드 |
| `scripts/publish-reminder.mjs` | 블로그 발행 리마인더 (다음 발행 파일 안내) |

### 지식IN 크롤링 상세
- **키워드**: 15개 (사망 후 해야할 일, 사망신고 방법, 상속포기 방법/기한, 장례 후 절차, 사망 후 부동산, 사망 후 자동차 명의변경 등)
- **품질 스코어링**: 0-10점 (범위 내 +3, 내용 길이 +2, 미채택 +2, 답변 적음 +1, 실행형 질문 +2)
- **등급**: A(7+), B(5-6), C(3-4), D(0-2), X(범위 밖)
- **출력**: Google Sheets 메인 시트에 등급/점수/키워드/제목/내용/링크/채택/답변수/템플릿/날짜

---

## 에이전트 시스템

### 오케스트레이터: `run-company.mjs`
매일 22시 실행. Claude CLI (Opus, effort max)로 5개 에이전트 순차 발언 → CEO 종합.

**실행 순서**:
1. 지식IN 크롤링 실행
2. 상담 신청 체크 (`check-consult.mjs`)
3. 컨텍스트 수집 (Google Sheets, 의사결정 로그, 이전 회의록, 변경 로그, 보드 메시지)
4. 에이전트 5명 순차 발언 (운영 → 리서치/수익화 → 마케팅 → CTO → 전략)
5. CEO 종합 판단
6. 회의록 저장 (`agents/meetings/{DATE}.md` + Google Sheets "회의록" 탭)
7. 오늘 할일 생성 → Google Sheets "오늘할일" 탭
8. 금요일이면 HR 평가 실행

### 에이전트 목록
| 에이전트 | 파일 | 역할 |
|----------|------|------|
| 운영 | ops-agent.mjs | 자동화 실행, 숫자 보고 |
| 리서치/수익화 | research-agent.mjs + business-agent.mjs | 시장조사, 수익모델, KPI |
| 마케팅 | marketing-agent.mjs | 콘텐츠/SEO/채널 전략 |
| CTO | cto-agent.mjs | 기술/프로덕트/자동화 |
| 전략 | strategy-agent.mjs | 시장분석, Phase 전환, 포지셔닝 |
| CEO | ceo-agent.mjs | 의사결정 유틸 (addDecision, suggestDecision) |
| HR | hr-agent.mjs | 금요일 에이전트 평가 + 조직 진단 |
| Agenda Engine | agenda-engine.mjs | 데이터 기반 회의 안건 생성 |
| 상담 체커 | check-consult.mjs | 신규 상담 → Claude로 해결방안 생성 |

### 산출물 디렉토리
| 경로 | 내용 |
|------|------|
| `agents/meetings/{DATE}.md` | 일일 회의록 |
| `agents/briefings/{DATE}.json` | CEO 브리핑 |
| `agents/evaluations/{DATE}.md` | HR 주간 평가 |
| `agents/board/changelog.md` | 코드 변경 로그 (회의 전 읽힘) |
| `agents/research/research-queue.json` | 리서치 큐 (파일 기반) |
| `agents/COMPANY-STATUS.md` | 회사 현황 (확정 결정 포함) |
| `agents/decision-log.json` | 의사결정 이력 |

---

## Google Sheets 구조

**Spreadsheet ID**: `1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw`

| 시트명 | 용도 | 컬럼 |
|--------|------|------|
| 시트1 | 지식IN 크롤링 데이터 | 등급, 점수, 키워드, 제목, 내용, 링크, 채택, 답변수, 사유, 템플릿, 날짜 |
| 성과측정 | 주간 성과 지표 | 날짜, 총질문, 답변가능, 템플릿준비, A/B/C/D/X 등급, 미채택 |
| 상담신청 | 유저 상담 요청 | 신청일시, 이름, 연락처, 사망일, 필요서비스, 상세내용, 상태, 운영팀메모 |
| 회의록 | 에이전트 회의 기록 | 날짜, 운영, 리서치/수익화, 마케팅, CTO, 전략, CEO 종합 |
| 오늘할일 | 일일 할일 | 날짜, 구분, 할일, 우선순위, 기한, 완료여부 |
| HR평가 | 에이전트 평가 | 날짜, 마케팅, CTO, 전략, 운영, 리서치/수익화, CEO, 조직진단 |

---

## SEO

- `robots.js` — 전체 허용, sitemap 링크
- `sitemap.js` — 6개 URL (/, /guides, /guides/*, /subscriptions)
- OpenGraph + Twitter Card 메타데이터
- Google 사이트 인증, Naver 사이트 인증
- Vercel Analytics (`@vercel/analytics`) 설치됨

---

## 확정 결정 (변경 불가)

1. 블로그: 네이버 + 브런치 병행
2. 네이버 카페 운영 안 함
3. 채널별 톤 분리 (네이버=정보, 브런치=에세이)
4. AI 80% 운영, 파운더는 최종 결정만
5. 수익: 전문가 매칭 → B2B → 보험 제휴 순
6. 카카오 공유 안 함 → URL 복사
7. GitHub Actions 안 씀 → 로컬 cron
8. 네이버 지식IN 답변 일시 중단
9. 콘텐츠 자동생성 + 수동 발행
10. 상담폼 = 플로팅 버튼 + 바텀시트

---

## 현재 상태 (2026-03-29)

- **Phase**: 1 (트래픽 확보)
- **목표**: 월 5,000 방문자 또는 주 5건 상담
- **트래픽**: ~0 (SEO 인덱싱 중)
- **매출**: 0원
- **지식IN 수집**: 189건 (A=0, B=66, C=110, D=9, X=3)
- **블로그**: 2편 발행 (09-체크리스트, 01-사망신고), 8편 대기
- **브런치**: 작가 승인 대기
- **상담 신청**: 0건
