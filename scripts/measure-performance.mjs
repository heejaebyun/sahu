// 성과 측정 에이전트: 지식인 답변 UTM 유입 + 검색 노출 현황 측정
// Usage: node scripts/measure-performance.mjs
// 주기: 주 1회 (GitHub Actions 또는 수동)

import { google } from "googleapis";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || "/Users/byunheejae/Desktop/sahu/google-credentials.json";

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  console.log("=== SAHU 성과 측정 ===\n");

  // 1. 지식인 크롤링 현황
  const dataRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "A:K",
  });
  const rows = dataRes.data.values || [];
  const dataRows = rows.slice(1); // 헤더 제외

  const total = dataRows.length;
  const grades = { A: 0, B: 0, C: 0, D: 0, X: 0 };
  const answerable = dataRows.filter(r => r[0] !== "X");
  const withTemplate = dataRows.filter(r => r[9] && r[9].trim().length > 0);
  const dates = new Set(dataRows.map(r => r[10]).filter(Boolean));

  dataRows.forEach(r => {
    const g = r[0] || "X";
    grades[g] = (grades[g] || 0) + 1;
  });

  console.log(`총 수집 질문: ${total}개`);
  console.log(`답변 가능(범위 내): ${answerable.length}개`);
  console.log(`답변 템플릿 준비: ${withTemplate.length}개`);
  console.log(`수집 일수: ${dates.size}일`);
  console.log(`\n등급 분포:`);
  Object.entries(grades).forEach(([g, c]) => {
    if (c > 0) console.log(`  ${g}등급: ${c}개`);
  });

  // 2. 키워드별 분포
  const keywordCounts = {};
  dataRows.forEach(r => {
    const kw = r[2] || "기타";
    keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
  });

  console.log(`\n키워드별 질문 수:`);
  Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([kw, c]) => console.log(`  ${kw}: ${c}개`));

  // 3. 미채택 질문 (답변 기회)
  const unanswered = dataRows.filter(r => r[0] !== "X" && r[6] === "N");
  console.log(`\n미채택 질문 (답변 기회): ${unanswered.length}개`);
  const topOpportunities = unanswered
    .sort((a, b) => (parseInt(b[1]) || 0) - (parseInt(a[1]) || 0))
    .slice(0, 5);

  if (topOpportunities.length > 0) {
    console.log(`\nTop 5 답변 기회:`);
    topOpportunities.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r[0]}] ${r[3]} (${r[5]})`);
    });
  }

  // 4. 성과 요약을 새 시트에 기록
  const today = new Date().toISOString().split("T")[0];
  const summaryRow = [
    today,
    total,
    answerable.length,
    withTemplate.length,
    grades.A || 0,
    grades.B || 0,
    grades.C || 0,
    grades.D || 0,
    grades.X || 0,
    unanswered.length,
  ];

  // "성과측정" 시트가 있는지 확인, 없으면 생성
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const perfSheet = spreadsheet.data.sheets.find(s => s.properties.title === "성과측정");

  if (!perfSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: "성과측정" } } }],
      },
    });
    // 헤더 추가
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "성과측정!A1:J1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["날짜", "총질문", "답변가능", "템플릿준비", "A등급", "B등급", "C등급", "D등급", "범위밖", "미채택"]],
      },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "성과측정!A:J",
    valueInputOption: "RAW",
    requestBody: { values: [summaryRow] },
  });

  console.log(`\n성과 데이터 '성과측정' 시트에 기록 완료 (${today})`);
}

main().catch(console.error);
