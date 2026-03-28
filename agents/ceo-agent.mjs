// CEO 에이전트 — SAHU 총괄 오케스트레이터
// Usage: node agents/ceo-agent.mjs
// 매일 오전 10시 실행: 각 에이전트 회의 → 종합 → 브리핑 생성

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { generateAgenda } from "./agenda-engine.mjs";

const BASE = "/Users/byunheejae/Desktop/sahu";
const DECISION_LOG = `${BASE}/agents/decision-log.json`;
const BRIEFING_DIR = `${BASE}/agents/briefings`;

execSync(`mkdir -p ${BRIEFING_DIR}`);

const today = new Date().toISOString().split("T")[0];
const dayOfWeek = new Date().getDay();
const dayName = ["일","월","화","수","목","금","토"][dayOfWeek];

// ── 의사결정 로그 ──

function loadDecisionLog() {
  return JSON.parse(readFileSync(DECISION_LOG, "utf-8"));
}

function getDecisionPattern(category) {
  const log = loadDecisionLog();
  return log.patterns[category] || "패턴 없음 (데이터 부족)";
}

function suggestDecision(question, category, options) {
  const pattern = getDecisionPattern(category);
  const log = loadDecisionLog();
  const similar = log.decisions.filter(d => d.category === category);

  // 자동 의사결정: 같은 카테고리 결정 10개 이상이면 패턴 기반 제안
  let autoSuggestion = null;
  let canAutoDecide = false;

  if (similar.length >= 10) {
    canAutoDecide = true;
    autoSuggestion = `과거 ${similar.length}건의 ${category} 결정 패턴 기반 자동 제안 가능`;
  }

  return {
    question, category, options, pattern,
    pastDecisions: similar.length,
    autoSuggestion,
    canAutoDecide,
    requiresUserDecision: !canAutoDecide,
  };
}

function addDecision(question, category, options, decision, reason, decidedBy = "user") {
  const log = loadDecisionLog();
  log.decisions.push({
    id: log.decisions.length + 1,
    date: today, category, question, options, decision, reason, decidedBy,
  });

  const catDecisions = log.decisions.filter(d => d.category === category);
  if (catDecisions.length >= 5) {
    const reasons = catDecisions.slice(-5).map(d => d.reason).join(". ");
    log.patterns[category] = `최근 경향: ${reasons.slice(0, 200)}`;
  }

  writeFileSync(DECISION_LOG, JSON.stringify(log, null, 2), "utf-8");
}

// ── 에이전트 회의 ──

async function collectAgentReports() {
  const reports = {};

  const agents = [
    { name: "마케팅", file: "agents/marketing-agent.mjs" },
    { name: "CTO", file: "agents/cto-agent.mjs" },
    { name: "전략", file: "agents/strategy-agent.mjs" },
    { name: "비즈니스", file: "agents/business-agent.mjs" },
    { name: "운영", file: "agents/ops-agent.mjs" },
    { name: "리서치", file: "agents/research-agent.mjs" },
  ];

  for (const agent of agents) {
    try {
      const mod = await import(`${BASE}/${agent.file}`);
      reports[agent.name] = mod.generateReport();
    } catch (err) {
      reports[agent.name] = { agent: agent.name, error: err.message.slice(0, 100) };
    }
  }

  return reports;
}

// ── 운영 실행 ──

function runOps() {
  const results = [];

  function run(name, script) {
    try {
      const output = execSync(`cd ${BASE} && node ${script}`, {
        timeout: 120000, encoding: "utf-8",
      });
      const lastLines = output.trim().split("\n").slice(-3).join("\n");
      results.push({ name, status: "success", summary: lastLines });
    } catch (err) {
      results.push({ name, status: "error", summary: err.message.slice(0, 150) });
    }
  }

  // 매일
  run("지식인 크롤링", "scripts/daily-kin-crawl.mjs");

  // 월, 목
  if ([1, 4].includes(dayOfWeek)) {
    run("성과 측정", "scripts/measure-performance.mjs");
  }

  return results;
}

// ── 종합 브리핑 ──

function synthesize(agentReports, opsResults) {
  // 모든 에이전트의 아이디어 수집 + 우선순위 정렬
  const allIdeas = [];
  for (const [name, report] of Object.entries(agentReports)) {
    if (report.ideas) {
      for (const idea of report.ideas) {
        allIdeas.push({ from: name, ...idea });
      }
    }
  }
  allIdeas.sort((a, b) => {
    const pri = { high: 0, medium: 1, low: 2 };
    return (pri[a.priority] || 2) - (pri[b.priority] || 2);
  });

  // 에이전트 간 요청 정리
  const crossRequests = [];
  for (const [name, report] of Object.entries(agentReports)) {
    if (report.requests) {
      for (const req of report.requests) {
        crossRequests.push({ from: name, ...req });
      }
    }
  }

  // CEO 판단: 오늘의 최우선 과제
  const topPriority = allIdeas.filter(i => i.priority === "high").slice(0, 3);

  return { allIdeas, crossRequests, topPriority };
}

// ── 메인 ──

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  🏢 SAHU CEO 에이전트 — 일일 경영 브리핑`);
  console.log(`  📅 ${today} (${dayName}요일) 오전 회의`);
  console.log(`${"=".repeat(60)}\n`);

  // 1. 운영 에이전트 실행
  console.log(`🔧 운영 에이전트 실행 중...\n`);
  const opsResults = runOps();

  for (const r of opsResults) {
    const icon = r.status === "success" ? "✅" : "❌";
    console.log(`  ${icon} ${r.name}`);
    console.log(`     ${r.summary}\n`);
  }

  // 2. 안건 엔진으로 데이터 기반 안건 생성
  console.log(`${"─".repeat(60)}`);
  console.log(`📋 안건 엔진 — 데이터 기반 회의 안건 생성\n`);
  const agenda = generateAgenda();

  if (agenda.urgentItems.length > 0) {
    console.log(`🚨 긴급 사항:`);
    for (const item of agenda.urgentItems) {
      console.log(`  [${item.source}] ${item.issue}`);
    }
    console.log();
  }

  for (const [agent, items] of Object.entries(agenda.agentAgendas)) {
    if (items.length === 0) continue;
    console.log(`  [${agent}]`);
    for (const item of items) {
      const icon = item.type === "opportunity" ? "💰" : item.type === "warning" ? "⚠️" : item.type === "milestone" ? "🎯" : "📌";
      console.log(`    ${icon} ${item.topic} → ${item.action}`);
    }
  }

  // 3. 각 에이전트 보고서 수집
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📊 에이전트 회의 — 아이디어 수집\n`);
  const agentReports = await collectAgentReports();

  // 3. CEO 종합
  const synthesis = synthesize(agentReports, opsResults);

  // 4. 출력: 최우선 과제
  console.log(`🎯 오늘의 최우선 과제 (CEO 선정):`);
  for (const idea of synthesis.topPriority) {
    console.log(`  [${idea.from}] ${idea.title}`);
    console.log(`    → ${idea.description.slice(0, 100)}`);
    console.log();
  }

  // 5. 출력: 전체 아이디어
  console.log(`${"─".repeat(60)}`);
  console.log(`💡 전체 아이디어 (${synthesis.allIdeas.length}건):\n`);
  for (const idea of synthesis.allIdeas) {
    const pri = idea.priority === "high" ? "🔴" : idea.priority === "medium" ? "🟡" : "⚪";
    console.log(`  ${pri} [${idea.from}] ${idea.title}`);
  }

  // 6. 출력: 에이전트 간 요청
  if (synthesis.crossRequests.length > 0) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`🔄 에이전트 간 요청:\n`);
    for (const req of synthesis.crossRequests) {
      console.log(`  ${req.from} → ${req.to}: ${req.request}`);
    }
  }

  // 7. 출력: 사용자 수동 작업
  console.log(`\n${"─".repeat(60)}`);
  console.log(`👤 사용자 액션 필요:\n`);

  const manualActions = [
    "🔴 네이버 블로그 글 1개 발행 (하루 1개 루틴)",
    "🟡 지식인 A/B등급 질문에 답변 2-3개",
    "🟡 브런치 작가 승인 확인",
    "⚪ GitHub Settings → Secrets에 GOOGLE_CREDENTIALS_JSON 등록",
  ];
  for (const a of manualActions) {
    console.log(`  ${a}`);
  }

  // 8. 의사결정 필요 사항
  console.log(`\n${"─".repeat(60)}`);
  console.log(`🔔 의사결정 필요:\n`);
  const decision = suggestDecision(
    "sahu.kr에 세무사/법무사 상담 신청 폼 추가 시점",
    "monetization",
    ["지금 바로", "월 방문자 1,000명 달성 후", "월 방문자 5,000명 달성 후"]
  );
  console.log(`  ❓ ${decision.question}`);
  console.log(`     옵션: ${decision.options.join(" / ")}`);
  console.log(`     과거 패턴: ${decision.pattern}`);
  if (decision.canAutoDecide) {
    console.log(`     🤖 자동 결정 가능 (과거 데이터 충분)`);
  }

  // 9. 브리핑 저장
  const briefing = {
    date: today,
    opsResults,
    agentReports,
    synthesis,
    manualActions,
  };

  const briefingPath = `${BRIEFING_DIR}/${today}.json`;
  writeFileSync(briefingPath, JSON.stringify(briefing, null, 2), "utf-8");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  브리핑 저장: ${briefingPath}`);
  console.log(`${"=".repeat(60)}\n`);
}

export { addDecision, suggestDecision, loadDecisionLog };
main().catch(console.error);
