// 블로그 발행 리마인더 — 다음에 발행할 파일을 알려줌
// Usage: node scripts/publish-reminder.mjs
// 크론 등록 예시: 매일 오전 9시 실행

import { readFileSync, existsSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";
const STATUS_FILE = `${BASE}/scripts/blog-posts/publish-status.json`;

// 발행 순서 (검색량 높은 키워드 우선)
const PUBLISH_ORDER = [
  { file: "09-after-death-checklist.txt", title: "사망 후 해야할 일 총정리 체크리스트" },
  { file: "01-death-report.txt", title: "사망신고 방법 총정리" },
  { file: "02-inheritance-renounce.txt", title: "상속포기·한정승인 방법 총정리" },
  { file: "03-safe-inheritance.txt", title: "안심상속 원스톱서비스 신청 방법" },
  { file: "04-bank-accounts.txt", title: "사망 후 은행 계좌 정리 방법" },
  { file: "05-inheritance-tax.txt", title: "상속세 신고 방법" },
  { file: "10-insurance-lookup.txt", title: "사망 후 보험 조회 및 청구" },
  { file: "06-death-certificate.txt", title: "사망진단서 발급 방법" },
  { file: "07-survivor-pension.txt", title: "유족연금 신청 방법" },
  { file: "08-telecom-cancel.txt", title: "사망 후 통신 해지 방법" },
];

function loadStatus() {
  if (!existsSync(STATUS_FILE)) return { published: [] };
  return JSON.parse(readFileSync(STATUS_FILE, "utf-8"));
}

const status = loadStatus();
const remaining = PUBLISH_ORDER.filter(p => !status.published.includes(p.file));

console.log(`\n📝 블로그 발행 리마인더`);
console.log(`${"─".repeat(40)}`);
console.log(`발행 완료: ${status.published.length}/10편`);
console.log(`잔여: ${remaining.length}편\n`);

if (remaining.length === 0) {
  console.log("✅ 모든 블로그 글 발행 완료!");
} else {
  const next = remaining[0];
  console.log(`📌 오늘 발행할 글:`);
  console.log(`   제목: ${next.title}`);
  console.log(`   파일: scripts/blog-posts/${next.file}`);
  console.log(`   채널: 네이버 블로그 (복사-붙여넣기)\n`);

  if (remaining.length > 1) {
    console.log(`📋 이후 대기:`);
    for (const item of remaining.slice(1, 4)) {
      console.log(`   - ${item.title}`);
    }
    if (remaining.length > 4) console.log(`   ... 외 ${remaining.length - 4}편`);
  }
}

console.log();
