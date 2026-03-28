// CTO 에이전트 — 기술 + 제품 + 자동화 전략
// 매일 오전 회의에서 기술 관점 아이디어 제출

import { execSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";

export function generateReport() {
  const today = new Date().toISOString().split("T")[0];

  const report = {
    agent: "CTO",
    date: today,
    currentStatus: {
      배포: "Vercel (자동 배포)",
      도메인: "sahu.kr",
      자동화: {
        지식인_크롤링: "완료 (daily-kin-crawl.mjs)",
        성과측정: "완료 (measure-performance.mjs)",
        블로그_생성: "완료 (generate-blog-posts.mjs)",
        브런치_생성: "완료 (generate-brunch-posts.mjs)",
        GitHub_Actions: "설정 필요 (workflow 파일 생성됨, secrets 미등록)",
      },
    },
    ideas: [],
    requests: [],
  };

  report.ideas = [
    {
      id: "cto-001",
      title: "GitHub Actions secrets 등록 + 자동화 활성화",
      description: "GOOGLE_CREDENTIALS_JSON secret 등록하면 매일 자동 크롤링 시작. CEO 에이전트도 cron으로 매일 실행 가능.",
      priority: "high",
      effort: "low",
      expectedImpact: "완전 자동 운영 시작",
    },
    {
      id: "cto-002",
      title: "상담 신청 폼 추가 (sahu.kr)",
      description: "체크리스트 하단에 '전문가 상담 신청' 폼 추가. 이름, 연락처, 고인 사망일, 필요 서비스 선택. Formspree 또는 Google Forms 연동.",
      priority: "medium",
      effort: "medium",
      expectedImpact: "리드 수집 시작 → 세무사 매칭 수익화 기반",
    },
    {
      id: "cto-003",
      title: "Vercel Analytics → 성과 에이전트 연동",
      description: "Vercel Analytics API로 페이지별 방문수, 유입 경로 데이터를 성과 에이전트에 통합.",
      priority: "medium",
      effort: "medium",
      expectedImpact: "데이터 기반 의사결정 가능",
    },
    {
      id: "cto-004",
      title: "세무사/법무사 DB 스크래핑",
      description: "대한세무사회, 대한법무사협회 사이트에서 지역별 전문가 목록 크롤링. Google Sheets에 저장.",
      priority: "low",
      effort: "high",
      expectedImpact: "매칭 서비스 기반 구축",
    },
    {
      id: "cto-005",
      title: "카카오톡 알림 연동",
      description: "CEO 에이전트 브리핑을 카카오톡으로 발송. 카카오 알림톡 또는 Slack webhook 활용.",
      priority: "low",
      effort: "medium",
      expectedImpact: "브리핑 자동 수신",
    },
  ];

  report.requests = [
    { to: "비즈니스", request: "상담 신청 폼 추가 시점 결정 (트래픽 기준)"},
    { to: "마케팅", request: "UTM 파라미터 통일 규칙 확인 (kin, blog, brunch 등)" },
  ];

  return report;
}

if (process.argv[1]?.includes("cto-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
