// CEO 에이전트 — SAHU 총괄 오케스트레이터
// Usage: node agents/ceo-agent.mjs
// 매일 오전 10시 실행: 각 에이전트 회의 → 종합 → 브리핑 생성

import { readFileSync, writeFileSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";
const DECISION_LOG = `${BASE}/agents/decision-log.json`;

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

// ── 메인 ──
// 참고: 일일 회의는 run-company.mjs가 오케스트레이션함.
// ceo-agent.mjs는 의사결정 유틸 함수만 export하는 모듈.
// 직접 실행 시에는 의사결정 로그 요약만 출력.

export { addDecision, suggestDecision, loadDecisionLog };

if (process.argv[1]?.includes("ceo-agent")) {
  const log = loadDecisionLog();
  console.log(`\n📊 의사결정 로그 요약`);
  console.log(`총 ${log.decisions.length}건\n`);
  for (const d of log.decisions.slice(-10)) {
    console.log(`  [${d.date}] ${d.question} → ${d.decision}`);
  }
  console.log();
}
