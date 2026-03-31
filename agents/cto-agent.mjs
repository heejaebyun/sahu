// CTO 에이전트 — 기술 + 제품 + 자동화 전략
// 매일 오전 회의에서 기술 관점 아이디어 제출

import { execSync } from "child_process";

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

  // 완료: GitHub Actions → 로컬 cron 확정 (결정 #7)
  // 완료: 상담 신청 폼 → 플로팅 버튼 + 바텀시트 구현 완료 (결정 #10)
  report.ideas = [
    {
      id: "cto-003",
      title: "Vercel Analytics → 성과 에이전트 연동",
      description: "Vercel Analytics API로 페이지별 방문수, 유입 경로 데이터를 성과 에이전트에 통합.",
      priority: "high",
      effort: "medium",
      expectedImpact: "데이터 기반 의사결정 가능 (현재 트래픽 추정치만 사용 중)",
    },
    {
      id: "cto-004",
      title: "세무사/법무사 DB 스크래핑",
      description: "대한세무사회, 대한법무사협회 사이트에서 지역별 전문가 목록 크롤링. Google Sheets에 저장.",
      priority: "low",
      effort: "high",
      expectedImpact: "매칭 서비스 기반 구축 (Phase 2 대비)",
    },
  ];

  report.requests = [
    { to: "마케팅", request: "UTM 파라미터 통일 규칙 확인 (kin, blog, brunch 등)" },
  ];

  return report;
}

if (process.argv[1]?.includes("cto-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
