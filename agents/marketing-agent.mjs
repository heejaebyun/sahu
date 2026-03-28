// 마케팅 에이전트 — 콘텐츠 + 채널 + SEO 전략
// 매일 오전 회의에서 마케팅 관점 아이디어 제출

import { readFileSync } from "fs";
import { execSync } from "child_process";

const BASE = "/Users/byunheejae/Desktop/sahu";

function getSpreadsheetStats() {
  try {
    const output = execSync(`cd ${BASE} && node -e "
      import { google } from 'googleapis';
      const auth = new google.auth.GoogleAuth({
        keyFile: '${BASE}/google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: '1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw',
        range: 'A:K',
      });
      const rows = (res.data.values || []).slice(1);
      const grades = { A: 0, B: 0, C: 0, D: 0, X: 0 };
      rows.forEach(r => { grades[r[0]] = (grades[r[0]] || 0) + 1; });
      const unanswered = rows.filter(r => r[0] !== 'X' && r[6] === 'N').length;
      console.log(JSON.stringify({ total: rows.length, grades, unanswered }));
    "`, { encoding: "utf-8", timeout: 30000 });
    return JSON.parse(output.trim());
  } catch {
    return null;
  }
}

export function generateReport() {
  const stats = getSpreadsheetStats();
  const today = new Date().toISOString().split("T")[0];

  const report = {
    agent: "마케팅",
    date: today,
    currentStatus: {},
    ideas: [],
    requests: [],
  };

  if (stats) {
    report.currentStatus = {
      지식인_수집_질문: stats.total,
      등급_분포: stats.grades,
      미채택_답변기회: stats.unanswered,
    };
  }

  // 마케팅 아이디어 (단계별)
  report.ideas = [
    {
      id: "mkt-001",
      title: "네이버 블로그 발행 루틴 확립",
      description: "하루 1개씩 10일간 발행 → 이후 주 2회로 전환. 발행 3주 후 키워드별 순위 체크.",
      priority: "high",
      effort: "low",
      expectedImpact: "네이버 검색 유입 시작 (2-4주 후)",
    },
    {
      id: "mkt-002",
      title: "지식인 답변 재개",
      description: "비정상 접근 차단 해제 후 링크 없이 답변 먼저 시작. 신뢰도 쌓은 후 sahu.kr 링크 추가.",
      priority: "high",
      effort: "medium",
      expectedImpact: "직접 유입 + 백링크",
    },
    {
      id: "mkt-003",
      title: "검색 키워드 확장",
      description: "현재 12개 키워드 외에 '장례 후 해야할 일', '부모님 돌아가시면', '사망 후 연금' 등 롱테일 키워드 추가.",
      priority: "medium",
      effort: "low",
      expectedImpact: "크롤링 범위 확대, 신규 콘텐츠 주제 발굴",
    },
    {
      id: "mkt-004",
      title: "네이버 플레이스/지도 등록",
      description: "사후(SAHU)를 온라인 서비스로 네이버 플레이스에 등록 가능한지 확인.",
      priority: "low",
      effort: "low",
      expectedImpact: "브랜드 검색 시 노출 강화",
    },
  ];

  // 다른 에이전트에게 요청
  report.requests = [
    { to: "CTO", request: "sahu.kr 방문자 추적 (Vercel Analytics 데이터 접근) 방법 확인" },
    { to: "리서치", request: "경쟁 서비스 조사 — 한국에 유사 서비스 있는지 확인" },
  ];

  return report;
}

// 직접 실행 시
if (process.argv[1]?.includes("marketing-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
