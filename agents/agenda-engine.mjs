// 안건 엔진 — 데이터 기반으로 매일 새로운 회의 안건 생성
// CEO 에이전트가 호출하여 각 에이전트에게 안건 배포

import { readFileSync, existsSync, readdirSync } from "fs";
import { execSync } from "child_process";

const BASE = "/Users/byunheejae/Desktop/sahu";
const BRIEFING_DIR = `${BASE}/agents/briefings`;
const DECISION_LOG = `${BASE}/agents/decision-log.json`;

// ── 데이터 수집 ──

function getSpreadsheetStats() {
  try {
    const output = execSync(`cd ${BASE} && node --input-type=module -e "
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
      const dates = [...new Set(rows.map(r => r[10]).filter(Boolean))];
      const keywords = {};
      rows.forEach(r => { keywords[r[2]] = (keywords[r[2]] || 0) + 1; });
      const topKeywords = Object.entries(keywords).sort((a,b) => b[1]-a[1]).slice(0,5);
      console.log(JSON.stringify({ total: rows.length, grades, unanswered, dates, topKeywords }));
    "`, { encoding: "utf-8", timeout: 30000 });
    return JSON.parse(output.trim());
  } catch {
    return null;
  }
}

function getPerformanceHistory() {
  try {
    const output = execSync(`cd ${BASE} && node --input-type=module -e "
      import { google } from 'googleapis';
      const auth = new google.auth.GoogleAuth({
        keyFile: '${BASE}/google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: '1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw',
        range: '성과측정!A:J',
      });
      const rows = (res.data.values || []).slice(1);
      console.log(JSON.stringify(rows.slice(-7)));
    "`, { encoding: "utf-8", timeout: 30000 });
    return JSON.parse(output.trim());
  } catch {
    return [];
  }
}

function getBlogPublishStatus() {
  const blogDir = `${BASE}/scripts/blog-posts`;
  const brunchDir = `${BASE}/scripts/brunch-posts`;
  let blogCount = 0, brunchCount = 0;
  try {
    blogCount = readdirSync(blogDir).filter(f => f.endsWith(".txt")).length;
  } catch {}
  try {
    brunchCount = readdirSync(brunchDir).filter(f => f.endsWith(".txt")).length;
  } catch {}
  return { blogPending: blogCount, brunchPending: brunchCount };
}

function getLastBriefing() {
  if (!existsSync(BRIEFING_DIR)) return null;
  const files = readdirSync(BRIEFING_DIR).filter(f => f.endsWith(".json")).sort();
  if (files.length < 2) return null; // 오늘 거 제외하고 직전 것
  const lastFile = files[files.length - 2];
  try {
    return JSON.parse(readFileSync(`${BRIEFING_DIR}/${lastFile}`, "utf-8"));
  } catch {
    return null;
  }
}

function getDecisionLog() {
  try {
    return JSON.parse(readFileSync(DECISION_LOG, "utf-8"));
  } catch {
    return { decisions: [], patterns: {} };
  }
}

function daysSince(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

// ── 안건 생성 ──

export function generateAgenda() {
  const today = new Date().toISOString().split("T")[0];
  const stats = getSpreadsheetStats();
  const perfHistory = getPerformanceHistory();
  const blogStatus = getBlogPublishStatus();
  const lastBriefing = getLastBriefing();
  const decisions = getDecisionLog();

  const agenda = {
    date: today,
    dataSnapshot: { stats, perfHistory: perfHistory?.length || 0, blogStatus },
    agentAgendas: {
      마케팅: [],
      CTO: [],
      전략: [],
      비즈니스: [],
      운영: [],
      리서치: [],
    },
    urgentItems: [],
  };

  // ── 마케팅 안건 ──

  if (blogStatus.blogPending > 0) {
    agenda.agentAgendas.마케팅.push({
      topic: `블로그 글 ${blogStatus.blogPending}개 미발행`,
      type: "reminder",
      action: "하루 1개 발행 루틴 리마인드",
    });
  }

  if (stats) {
    // 미채택 질문 많으면 답변 기회 강조
    if (stats.unanswered > 10) {
      agenda.agentAgendas.마케팅.push({
        topic: `미채택 질문 ${stats.unanswered}개 — 답변 기회`,
        type: "opportunity",
        action: "A/B등급 미채택 질문 우선 답변",
      });
    }

    // 새로운 키워드 트렌드
    if (stats.topKeywords) {
      const topKw = stats.topKeywords[0];
      agenda.agentAgendas.마케팅.push({
        topic: `가장 많은 질문 키워드: "${topKw[0]}" (${topKw[1]}건)`,
        type: "insight",
        action: "해당 키워드 블로그 글 우선 발행 또는 추가 콘텐츠 제작 검토",
      });
    }

    // 수집 일수 기반 제안
    if (stats.dates && stats.dates.length >= 7) {
      const daily = Math.round(stats.total / stats.dates.length);
      agenda.agentAgendas.마케팅.push({
        topic: `일평균 ${daily}개 질문 수집 중 (총 ${stats.total}개, ${stats.dates.length}일)`,
        type: "report",
        action: daily < 10 ? "키워드 추가 검토" : "현재 키워드 유지",
      });
    }
  }

  // ── CTO 안건 ──

  // GitHub Actions 미등록 체크 (로컬 cron이면 불필요하므로 제거)
  agenda.agentAgendas.CTO.push({
    topic: "자동화 현황 점검",
    type: "status",
    action: "cron 실행 로그 확인 (/tmp/sahu-*.log)",
  });

  // 성과 데이터 추이
  if (perfHistory && perfHistory.length >= 2) {
    const latest = perfHistory[perfHistory.length - 1];
    const prev = perfHistory[perfHistory.length - 2];
    const totalDiff = (parseInt(latest[1]) || 0) - (parseInt(prev[1]) || 0);
    agenda.agentAgendas.CTO.push({
      topic: `질문 수집 추이: ${totalDiff >= 0 ? "+" : ""}${totalDiff}개 (전회 대비)`,
      type: totalDiff > 0 ? "growth" : "warning",
      action: totalDiff <= 0 ? "크롤링 스크립트 점검 필요" : "정상 운영 중",
    });
  }

  // sahu.kr 기능 제안 (Phase 기반)
  const phase = decisions.decisions.filter(d => d.category === "monetization").length;
  if (phase === 0) {
    agenda.agentAgendas.CTO.push({
      topic: "상담 신청 폼 준비",
      type: "planning",
      action: "트래픽 목표 달성 전에 폼 미리 구현해두면 즉시 전환 가능",
    });
  }

  // ── 전략 안건 ──

  // Phase 확인
  if (stats && stats.total > 0) {
    agenda.agentAgendas.전략.push({
      topic: `현재 Phase 1 (트래픽 확보) — 수집 데이터 ${stats.total}건`,
      type: "status",
      action: "월 방문자 3,000명 또는 상담 문의 주 5건 달성 시 Phase 2 전환",
    });
  }

  // 경쟁자 모니터링 필요성
  const lastDecisionDate = decisions.decisions.length > 0
    ? decisions.decisions[decisions.decisions.length - 1].date
    : null;
  if (!lastDecisionDate || daysSince(lastDecisionDate) > 7) {
    agenda.agentAgendas.전략.push({
      topic: "경쟁 환경 점검 필요",
      type: "reminder",
      action: "리서치 에이전트에 경쟁 서비스 조사 요청",
    });
  }

  // ── 비즈니스 안건 ──

  agenda.agentAgendas.비즈니스.push({
    topic: "KPI 트래킹",
    type: "report",
    action: `주간 목표 — 블로그 7개 발행, 지식인 답변 5개, 사이트 방문 100명`,
  });

  // 수익화 타이밍
  if (stats && stats.total > 500) {
    agenda.agentAgendas.비즈니스.push({
      topic: "데이터 500건 돌파 — 수익화 검토 시점",
      type: "milestone",
      action: "세무사 매칭 파일럿 준비 시작 검토",
    });
  }

  // ── 운영 안건 ──

  // 크론 로그 체크
  agenda.agentAgendas.운영.push({
    topic: "일일 자동화 실행 현황",
    type: "status",
    action: "지식인 크롤링 + CEO 브리핑 cron 정상 실행 확인",
  });

  // ── 리서치 안건 ──

  // 미완료 리서치 체크
  agenda.agentAgendas.리서치.push({
    topic: "대기 중인 조사 항목",
    type: "queue",
    action: "경쟁 서비스, 장례식장 목록, 세무사 수수료, 검색량 조사",
  });

  // ── 긴급 사항 ──

  // 크론 로그에 에러가 있는지 체크
  try {
    const crawlLog = execSync("tail -5 /tmp/sahu-crawl.log 2>/dev/null || echo 'no log'", { encoding: "utf-8" });
    if (crawlLog.includes("에러") || crawlLog.includes("Error")) {
      agenda.urgentItems.push({
        source: "운영",
        issue: "지식인 크롤링 에러 감지",
        detail: crawlLog.trim().slice(-100),
      });
    }
  } catch {}

  try {
    const ceoLog = execSync("tail -5 /tmp/sahu-ceo.log 2>/dev/null || echo 'no log'", { encoding: "utf-8" });
    if (ceoLog.includes("에러") || ceoLog.includes("Error")) {
      agenda.urgentItems.push({
        source: "CEO",
        issue: "CEO 브리핑 에러 감지",
        detail: ceoLog.trim().slice(-100),
      });
    }
  } catch {}

  return agenda;
}

if (process.argv[1]?.includes("agenda-engine")) {
  const agenda = generateAgenda();

  console.log(`\n📋 오늘의 회의 안건 (${agenda.date})\n`);

  if (agenda.urgentItems.length > 0) {
    console.log("🚨 긴급:");
    for (const item of agenda.urgentItems) {
      console.log(`  [${item.source}] ${item.issue}`);
    }
    console.log();
  }

  for (const [agent, items] of Object.entries(agenda.agentAgendas)) {
    if (items.length === 0) continue;
    console.log(`[${agent}]`);
    for (const item of items) {
      const icon = item.type === "opportunity" ? "💰" : item.type === "warning" ? "⚠️" : item.type === "milestone" ? "🎯" : "📌";
      console.log(`  ${icon} ${item.topic}`);
      console.log(`    → ${item.action}`);
    }
    console.log();
  }
}
