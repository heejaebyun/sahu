// 리서치 에이전트 — 필요 시 호출되는 조사 에이전트
// 다른 에이전트가 요청하면 조사 수행 후 결과 반환

import { writeFileSync, mkdirSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";
const RESEARCH_DIR = `${BASE}/agents/research`;
mkdirSync(RESEARCH_DIR, { recursive: true });

// 조사 주제 목록 (다른 에이전트 요청 기반)
const RESEARCH_QUEUE = [
  {
    id: "res-001",
    requestedBy: "마케팅",
    topic: "한국 내 사망 후 행정 가이드 경쟁 서비스 조사",
    status: "pending",
    result: null,
  },
  {
    id: "res-002",
    requestedBy: "전략",
    topic: "한국 장례식장 수 + 주요 프랜차이즈 장례식장 목록",
    status: "pending",
    result: null,
  },
  {
    id: "res-003",
    requestedBy: "비즈니스",
    topic: "세무사 상속세 신고 수수료 시장 가격",
    status: "pending",
    result: null,
  },
  {
    id: "res-004",
    requestedBy: "마케팅",
    topic: "사망 관련 네이버 검색 키워드 월간 검색량",
    status: "pending",
    result: null,
  },
];

export function generateReport() {
  return {
    agent: "리서치",
    date: new Date().toISOString().split("T")[0],
    queue: RESEARCH_QUEUE,
    completedCount: RESEARCH_QUEUE.filter(r => r.status === "completed").length,
    pendingCount: RESEARCH_QUEUE.filter(r => r.status === "pending").length,
    note: "리서치 에이전트는 웹 검색이 필요한 항목이 많아 Claude Code 세션에서 실행 시 가장 효과적. CEO 에이전트가 우선순위 결정 후 호출.",
  };
}

export function saveResearchResult(id, result) {
  const item = RESEARCH_QUEUE.find(r => r.id === id);
  if (!item) return;
  item.status = "completed";
  item.result = result;

  const filePath = `${RESEARCH_DIR}/${id}-${item.topic.slice(0, 20).replace(/\s/g, "_")}.json`;
  writeFileSync(filePath, JSON.stringify({
    ...item,
    completedAt: new Date().toISOString(),
  }, null, 2), "utf-8");
}

if (process.argv[1]?.includes("research-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
