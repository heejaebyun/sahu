// 매일 전날 올라온 지식인 질문을 크롤링하여 구글 스프레드시트에 추가
// Usage: node scripts/daily-kin-crawl.mjs

import { google } from "googleapis";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || "/Users/byunheejae/Desktop/sahu/google-credentials.json";

const KEYWORDS = [
  "사망 후 해야할 일",
  "사망신고 방법",
  "상속포기 방법",
  "상속포기 기한",
  "안심상속 원스톱",
  "사망 후 은행 계좌",
  "사망 후 보험",
  "사망 후 통신 해지",
  "사망 후 구독 해지",
  "상속세 신고",
  "사망진단서 발급",
  "유족연금 신청",
];

const ANSWER_TEMPLATES = {
  "사망": `안녕하세요. 사망 후 행정 절차가 복잡하고 막막하실 텐데, 단계별로 정리된 가이드가 있어 공유드립니다.

사망신고 → 안심상속 조회 → 은행/보험 정리 → 상속 결정 → 세금 신고 순서로 진행하시면 됩니다.

각 절차별 기한, 필요 서류, 방문처가 정리된 체크리스트입니다:
https://sahu.kr?utm_source=kin

기한을 놓치면 과태료나 가산세가 발생할 수 있으니 꼭 확인해보세요.`,
  "사망신고": `사망신고는 사망사실을 안 날부터 1개월 이내에 주민센터에서 하시면 됩니다.

필요 서류: 사망진단서 1통 + 신고인 신분증
신고 장소: 사망지/신고인 주소지/고인 주소지 주민센터 중 택1

사망신고와 함께 '안심상속 원스톱서비스'도 바로 신청하세요.

상세 절차: https://sahu.kr/guides/death-report?utm_source=kin`,
  "상속포기": `상속포기는 상속개시 있음을 안 날부터 3개월 이내에 가정법원에 신청해야 합니다.

기한이 지나면 단순승인(모든 빚 포함 상속)으로 간주되니 주의하세요.

필요 서류: 심판청구서, 사망진단서, 가족관계증명서, 기본증명서, 주민등록등본

상속포기 vs 한정승인 비교: https://sahu.kr/guides/inheritance-renounce?utm_source=kin`,
  "안심상속": `안심상속 원스톱서비스는 주민센터 또는 정부24에서 신청 가능합니다.

고인의 금융, 부동산, 자동차, 세금, 연금을 한번에 조회할 수 있습니다.

기한: 사망일이 속한 달의 말일부터 1년 이내

상세 안내: https://sahu.kr/guides/safe-inheritance?utm_source=kin`,
  "은행": `고인의 은행 계좌 정리는 안심상속 원스톱서비스 결과를 받은 후 진행하는 것이 효율적입니다.

필요 서류: 사망진단서, 가족관계증명서, 상속인 전원 인감증명서, 상속협의서

상세 절차: https://sahu.kr/guides/bank-accounts?utm_source=kin`,
  "보험": `고인의 보험 조회는 '내보험찾아줌'에서 생명/손해보험 통합 조회가 가능합니다.

단, 망인 조회는 안심상속 원스톱서비스 접수가 선행되어야 합니다.

전체 절차: https://sahu.kr?utm_source=kin`,
  "통신": `고인의 통신 서비스 해지는 각 통신사 대리점 또는 고객센터에서 가능합니다.

필요 서류: 사망진단서, 가족관계증명서, 신청인 신분증

구독/계정 해지 가이드: https://sahu.kr/subscriptions?utm_source=kin`,
  "구독": `고인의 구독 서비스 정리는 카드 명세서와 휴대폰 앱 목록을 확인하면 파악할 수 있습니다.

주요 서비스별 해지 방법: https://sahu.kr/subscriptions?utm_source=kin`,
  "상속세": `상속세는 사망일이 속한 달의 말일부터 6개월 이내에 신고·납부해야 합니다.

기한 내 신고 시 3% 세액공제, 미신고 시 20~40% 가산세가 부과됩니다.

전체 절차: https://sahu.kr?utm_source=kin`,
  "사망진단서": `사망진단서는 사망한 병원에서 발급받습니다.

최소 10통 이상 발급받으세요. 은행, 보험사, 관공서마다 원본을 요구합니다.

사망진단서 발급 후 절차: https://sahu.kr/guides/death-report?utm_source=kin`,
  "유족연금": `유족연금은 국민연금공단 지사 또는 온라인(nps.or.kr)에서 신청 가능합니다.

필요 서류: 사망진단서, 가족관계증명서, 신청인 신분증, 통장 사본

전체 사망 후 절차: https://sahu.kr?utm_source=kin`,
};

function getTemplate(keyword) {
  for (const [key, template] of Object.entries(ANSWER_TEMPLATES)) {
    if (keyword.includes(key)) return template;
  }
  return ANSWER_TEMPLATES["사망"];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

async function fetchQuestions(keyword) {
  const encoded = encodeURIComponent(keyword);
  // period=1d: 1일 이내 질문만
  const url = `https://kin.naver.com/search/list.naver?query=${encoded}&period=1d&section=kin`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
  });
  const html = await res.text();

  const results = [];
  // Extract links
  const regex = /"(https?:\/\/kin\.naver\.com\/qna\/detail\.naver[^"]+)"/g;
  let match;
  const seen = new Set();

  while ((match = regex.exec(html)) !== null) {
    const link = match[1].replace(/&amp;/g, "&");
    if (seen.has(link)) continue;
    seen.add(link);
    results.push({ keyword, link });
  }

  return results;
}

async function fetchDetail(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });
    const html = await res.text();

    let title = "";
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      title = titleMatch[1].replace(" : 지식iN", "").replace(/\s+/g, " ").trim();
    }

    let content = "";
    const contentMatch = html.match(/class="c-heading__content"[^>]*>([\s\S]*?)<\/div>/);
    if (contentMatch) {
      content = contentMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    }

    const hasAccepted = html.includes("채택된 답변") || html.includes("질문자 채택");
    let answerCount = 0;
    const answerMatch = html.match(/답변\s*(\d+)/);
    if (answerMatch) answerCount = parseInt(answerMatch[1]);

    return { title, content: content.slice(0, 200), hasAccepted, answerCount };
  } catch {
    return { title: "", content: "", hasAccepted: false, answerCount: 0 };
  }
}

// SAHU가 답변할 수 있는 범위 키워드
const SAHU_SCOPE_KEYWORDS = [
  "사망", "돌아가", "장례", "사망신고", "사망진단서",
  "상속", "상속포기", "한정승인", "상속세", "상속인",
  "안심상속", "원스톱",
  "유족연금", "국민연금", "사망보험", "보험금 청구",
  "고인", "망인", "유가족",
  "은행 계좌", "계좌 해지", "계좌 정리",
  "통신 해지", "구독 해지", "명의변경",
  "세금 신고", "재산 조회", "부동산 상속",
];

// 범위 밖 (비슷한 키워드지만 SAHU 범위 아님)
const OUT_OF_SCOPE = [
  "이혼", "양육권", "위자료", "재혼",
  "교통사고 합의", "산재", "산업재해",
  "반려동물", "펫로스",
];

function isInScope(title, content) {
  const text = (title + " " + content).toLowerCase();
  if (OUT_OF_SCOPE.some(k => text.includes(k))) return false;
  return SAHU_SCOPE_KEYWORDS.some(k => text.includes(k));
}

function qualityScore(detail, keyword) {
  let score = 0;
  let reasons = [];
  const text = (detail.title + " " + detail.content).toLowerCase();

  const answerable = isInScope(detail.title, detail.content);
  if (!answerable) {
    return { score: 0, grade: "X", reasons: "범위 밖", answerable: false };
  }

  reasons.push("범위 내");
  score += 3;

  if (detail.content.length > 50) { score += 2; reasons.push("상세 질문"); }
  if (!detail.hasAccepted) { score += 2; reasons.push("미채택"); }
  if (detail.answerCount <= 2) { score += 1; reasons.push("답변 적음"); }
  if (text.includes("어떻게") || text.includes("방법") || text.includes("해야") || text.includes("필요") || text.includes("기한") || text.includes("절차")) {
    score += 2; reasons.push("행동 질문");
  }

  let grade = score >= 7 ? "A" : score >= 5 ? "B" : score >= 3 ? "C" : "D";
  return { score, grade, reasons: reasons.join(", "), answerable: true };
}

async function main() {
  const yesterday = getYesterday();
  console.log(`=== 일간 지식인 크롤링 (${yesterday} 질문) ===\n`);

  const allResults = [];

  for (const keyword of KEYWORDS) {
    try {
      const questions = await fetchQuestions(keyword);
      console.log(`[${keyword}] ${questions.length}개`);
      allResults.push(...questions);
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`[${keyword}] 에러: ${err.message}`);
    }
  }

  // Deduplicate
  const seen = new Set();
  const unique = allResults.filter(r => {
    if (seen.has(r.link)) return false;
    seen.add(r.link);
    return true;
  });

  if (unique.length === 0) {
    console.log("\n새 질문 없음. 종료.");
    return;
  }

  console.log(`\n${unique.length}개 신규 질문 상세 크롤링...\n`);

  // Enrich
  const enriched = [];
  for (const q of unique) {
    const detail = await fetchDetail(q.link);
    const quality = qualityScore(detail, q.keyword);
    enriched.push([
      quality.grade,
      quality.score,
      q.keyword,
      detail.title || "[제목 추출 실패]",
      detail.content || "",
      q.link,
      detail.hasAccepted ? "Y" : "N",
      detail.answerCount,
      quality.reasons,
      quality.answerable ? getTemplate(q.keyword) : "",
      yesterday,
    ]);
    await new Promise(r => setTimeout(r, 300));
  }

  // Sort by grade
  enriched.sort((a, b) => a[0].localeCompare(b[0]));

  // Upload to Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Check if header has "수집일" column, if not add it
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "A1:K1",
  });
  const header = headerRes.data.values?.[0] || [];
  if (!header.includes("수집일")) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "K1",
      valueInputOption: "RAW",
      requestBody: { values: [["수집일"]] },
    });
  }

  // Get existing links to avoid duplicates
  const existingRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "F:F",
  });
  const existingLinks = new Set(
    (existingRes.data.values || []).map(r => r[0]).filter(Boolean)
  );

  const newRows = enriched.filter(row => !existingLinks.has(row[5]));

  if (newRows.length === 0) {
    console.log("중복 제거 후 새 질문 없음. 종료.");
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "A:K",
    valueInputOption: "RAW",
    requestBody: { values: newRows },
  });

  console.log(`${newRows.length}개 신규 질문 스프레드시트에 추가 완료`);
  console.log(`A등급: ${newRows.filter(r => r[0] === "A").length}`);
  console.log(`B등급: ${newRows.filter(r => r[0] === "B").length}`);
  console.log(`C등급: ${newRows.filter(r => r[0] === "C").length}`);
  console.log(`D등급: ${newRows.filter(r => r[0] === "D").length}`);
}

main().catch(console.error);
