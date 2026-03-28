// 운영 에이전트 — 일일 실행 담당 (크롤링, 성과 측정, 콘텐츠 생성)
// 비즈니스 에이전트가 "뭘 할지" 결정하면, 운영 에이전트가 "실행"

import { execSync } from "child_process";

const BASE = "/Users/byunheejae/Desktop/sahu";

function run(label, cmd) {
  try {
    console.log(`[운영] ${label} 실행 중...`);
    const output = execSync(cmd, { encoding: "utf-8", timeout: 120000 });
    return { task: label, status: "success", output: output.trim().split("\n").slice(-3).join("\n") };
  } catch (err) {
    return { task: label, status: "error", message: err.message.slice(0, 200) };
  }
}

export function runDailyOps() {
  const results = [];

  // 매일 실행
  results.push(run("지식인 크롤링", `cd ${BASE} && node scripts/daily-kin-crawl.mjs`));

  // 월, 목 실행
  const dow = new Date().getDay();
  if ([1, 4].includes(dow)) {
    results.push(run("성과 측정", `cd ${BASE} && node scripts/measure-performance.mjs`));
  }

  // 월요일 실행
  if (dow === 1) {
    results.push(run("블로그 콘텐츠 생성", `cd ${BASE} && node scripts/generate-blog-posts.mjs`));
    results.push(run("브런치 콘텐츠 생성", `cd ${BASE} && node scripts/generate-brunch-posts.mjs`));
  }

  return {
    agent: "운영",
    date: new Date().toISOString().split("T")[0],
    results,
    manualTasks: [
      { task: "네이버 블로그 글 발행", frequency: "매일 1개", owner: "user" },
      { task: "지식인 답변 등록", frequency: "매일 2-3개", owner: "user" },
      { task: "브런치 글 발행", frequency: "승인 후 주 1개", owner: "user" },
    ],
  };
}

export function generateReport() {
  return {
    agent: "운영",
    date: new Date().toISOString().split("T")[0],
    currentStatus: {
      자동화_완료: ["지식인 크롤링", "성과 측정", "블로그 콘텐츠 생성", "브런치 콘텐츠 생성"],
      자동화_대기: ["GitHub Actions cron (secrets 미등록)"],
      수동_필요: ["블로그 발행", "지식인 답변", "브런치 발행"],
    },
    ideas: [
      {
        id: "ops-001",
        title: "GitHub Actions 활성화",
        description: "GOOGLE_CREDENTIALS_JSON secret 등록하면 크롤링 완전 자동화",
        priority: "high",
        effort: "low",
      },
    ],
    requests: [
      { to: "CEO", request: "GitHub secrets 등록은 user 수동 작업 필요 — 리마인드 요청" },
    ],
  };
}

if (process.argv[1]?.includes("ops-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
