// 리서치 에이전트 — 필요 시 호출되는 조사 에이전트
// 다른 에이전트가 요청하면 조사 수행 후 결과 반환
// 큐는 research-queue.json에서 관리 (하드코딩 X)

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";
const RESEARCH_DIR = `${BASE}/agents/research`;
const QUEUE_FILE = `${RESEARCH_DIR}/research-queue.json`;
mkdirSync(RESEARCH_DIR, { recursive: true });

function loadQueue() {
  if (!existsSync(QUEUE_FILE)) {
    // 초기 큐 생성
    const initial = [
      { id: "res-001", requestedBy: "마케팅", topic: "한국 내 사망 후 행정 가이드 경쟁 서비스 조사", status: "pending", result: null },
      { id: "res-002", requestedBy: "전략", topic: "한국 장례식장 수 + 주요 프랜차이즈 장례식장 목록", status: "pending", result: null },
      { id: "res-003", requestedBy: "비즈니스", topic: "세무사 상속세 신고 수수료 시장 가격", status: "pending", result: null },
      { id: "res-004", requestedBy: "마케팅", topic: "사망 관련 네이버 검색 키워드 월간 검색량", status: "pending", result: null },
    ];
    writeFileSync(QUEUE_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  return JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));
}

function saveQueue(queue) {
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), "utf-8");
}

export function addResearchItem(requestedBy, topic) {
  const queue = loadQueue();
  const id = `res-${String(queue.length + 1).padStart(3, "0")}`;
  queue.push({ id, requestedBy, topic, status: "pending", result: null });
  saveQueue(queue);
  return id;
}

export function generateReport() {
  const queue = loadQueue();
  return {
    agent: "리서치",
    date: new Date().toISOString().split("T")[0],
    queue: queue.filter(r => r.status === "pending"),
    completedCount: queue.filter(r => r.status === "completed").length,
    pendingCount: queue.filter(r => r.status === "pending").length,
    note: "리서치 에이전트는 웹 검색이 필요한 항목이 많아 Claude Code 세션에서 실행 시 가장 효과적.",
  };
}

export function saveResearchResult(id, result) {
  const queue = loadQueue();
  const item = queue.find(r => r.id === id);
  if (!item) return;
  item.status = "completed";
  item.result = result;
  item.completedAt = new Date().toISOString();
  saveQueue(queue);

  // 개별 결과 파일도 저장
  const filePath = `${RESEARCH_DIR}/${id}-${item.topic.slice(0, 20).replace(/\s/g, "_")}.json`;
  writeFileSync(filePath, JSON.stringify(item, null, 2), "utf-8");
}

if (process.argv[1]?.includes("research-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
