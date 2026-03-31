// 운영 에이전트 — 상담 신청 확인 + 해결방안 작성
// CEO 에이전트 또는 cron에서 호출

import { google } from "googleapis";

const BASE = "/Users/byunheejae/Desktop/sahu";
const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || `${BASE}/google-credentials.json`;

// Claude CLI로 해결방안 생성
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const CLAUDE = (() => {
  try {
    const whichResult = execSync('which claude 2>/dev/null', { encoding: "utf-8" }).trim();
    if (whichResult) return whichResult;
  } catch {}
  try {
    return execSync('ls -t /Users/byunheejae/.vscode/extensions/anthropic.claude-code-*-darwin-arm64/resources/native-binary/claude 2>/dev/null | head -1', { encoding: "utf-8" }).trim();
  } catch {}
  return "/Users/byunheejae/.local/bin/claude";
})();

function askClaude(prompt) {
  const tmpFile = `/tmp/sahu-consult-${Date.now()}.txt`;
  writeFileSync(tmpFile, prompt, "utf-8");
  try {
    return execSync(
      `cat "${tmpFile}" | "${CLAUDE}" --print --model opus --effort max --allowedTools "WebSearch,WebFetch" 2>/dev/null`,
      { encoding: "utf-8", timeout: 300000, cwd: BASE }
    ).trim();
  } catch {
    return "[해결방안 생성 실패]";
  }
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // 상담신청 시트 확인
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const consultSheet = spreadsheet.data.sheets.find(s => s.properties.title === "상담신청");
  if (!consultSheet) {
    console.log("상담신청 시트 없음. 아직 신청이 없습니다.");
    return;
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "상담신청!A:H",
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) {
    console.log("상담 신청 0건.");
    return;
  }

  let newCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const [date, name, phone, deathDate, needs, detail, status, memo] = rows[i];

    // "신규" 상태인 것만 처리
    if (status !== "신규") continue;

    newCount++;
    console.log(`\n📋 신규 상담 #${i}: ${name} (${needs || "미선택"})`);

    // Claude로 해결방안 생성
    const solution = askClaude(`당신은 사망 후 행정 처리 전문 상담사입니다.
아래 상담 신청을 보고 해결방안을 작성하세요.

이름: ${name}
사망일: ${deathDate || "미입력"}
필요 서비스: ${needs || "미선택"}
상세 내용: ${detail || "없음"}

해결방안을 작성하세요:
1. 이 사람이 지금 해야 할 것 (우선순위 순)
2. 연결해줄 전문가 유형 (세무사/법무사/둘다)
3. 주의사항

간결하게 5줄 이내. 한국어.`);

    console.log(`  → ${solution.slice(0, 100)}...`);

    // 상태를 "확인완료"로, 메모에 해결방안 작성
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `상담신청!G${i + 1}:H${i + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["확인완료", solution]],
      },
    });
  }

  console.log(`\n총 ${newCount}건 신규 상담 처리 완료.`);
}

main().catch(console.error);
