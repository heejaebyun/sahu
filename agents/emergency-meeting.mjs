#!/usr/bin/env node
// 긴급 회의 — 프로덕트 점검 안건

import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";
const CLAUDE = "/Users/byunheejae/.vscode/extensions/anthropic.claude-code-2.1.86-darwin-arm64/resources/native-binary/claude";
const TODAY = new Date().toISOString().split("T")[0];
const MEETING_DIR = `${BASE}/agents/meetings`;
mkdirSync(MEETING_DIR, { recursive: true });

function askClaude(prompt) {
  const tmpFile = `/tmp/sahu-prompt-${Date.now()}.txt`;
  writeFileSync(tmpFile, prompt, "utf-8");
  try {
    const output = execSync(
      `cat "${tmpFile}" | "${CLAUDE}" --print 2>/dev/null`,
      { encoding: "utf-8", timeout: 120000, cwd: BASE }
    );
    return output.trim();
  } catch (err) {
    return `[에러] ${err.message.slice(0, 200)}`;
  }
}

const CONTEXT = `당신은 SAHU(사후) 회사의 팀원입니다.
SAHU는 사망 후 행정 처리 가이드 서비스(sahu.kr)를 운영합니다.
현재 Phase 1 (트래픽 확보 단계), 매출 0원, 트래픽 거의 0명.
프로덕트: 사망일 입력 → 시간순 체크리스트 + 기한 자동 계산 + SEO 가이드 페이지
채널: sahu.kr + 네이버 블로그(1개 발행) + 브런치(신청중) + 지식인(차단됨)

오늘 긴급 안건:
1. 프로덕트 UX 문제 — 체크리스트가 실제로 쓸만한가? 모바일 최적화?
2. 체크리스트 완료 후 다음 단계 없음 (세무사 연결 등)
3. 재방문 이유 없음 (한번 보고 끝)
4. 공유 기능 없음 (유가족끼리 체크리스트 공유)
5. 사용자 피드백 수집 경로 없음
6. SEO 외 성장 채널 부재
7. 프로덕트를 어떻게 키워나갈 것인가`;

const agents = [
  {
    name: "마케팅 팀장",
    prompt: `${CONTEXT}\n\n당신은 마케팅 팀장입니다. 위 7개 안건에 대해 마케팅 관점에서 의견을 내세요.\n특히 3번(재방문), 6번(성장 채널)에 집중.\n구체적 액션 포함. 한국어. 10줄 이내.`,
  },
  {
    name: "CTO",
    prompt: `${CONTEXT}\n\n당신은 CTO입니다. 위 7개 안건에 대해 기술/제품 관점에서 의견을 내세요.\n특히 1번(UX), 4번(공유 기능), 5번(피드백 수집)에 집중.\n구체적 구현 방안 포함. 한국어. 10줄 이내.`,
  },
  {
    name: "전략 이사",
    prompt: `${CONTEXT}\n\n당신은 전략 이사입니다. 위 7개 안건에 대해 전략 관점에서 의견을 내세요.\n특히 2번(다음 단계), 7번(프로덕트 성장)에 집중.\n경쟁사 대비 차별화 전략 포함. 한국어. 10줄 이내.`,
  },
  {
    name: "비즈니스 디렉터",
    prompt: `${CONTEXT}\n\n당신은 비즈니스 디렉터입니다. 위 7개 안건에 대해 사업/수익화 관점에서 의견을 내세요.\n특히 2번(세무사 연결), 7번(프로덕트 성장)에 집중.\n현실적으로 실행 가능한 수익화 방안. 한국어. 10줄 이내.`,
  },
];

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  🚨 SAHU 긴급 경영 회의 — 프로덕트 점검`);
  console.log(`  📅 ${TODAY}`);
  console.log(`${"=".repeat(60)}\n`);

  const outputs = {};

  for (const agent of agents) {
    console.log(`💬 ${agent.name} 발언 중...\n`);
    const response = askClaude(agent.prompt);
    outputs[agent.name] = response;
    console.log(response);
    console.log(`\n${"─".repeat(50)}\n`);
  }

  // CEO 종합
  console.log(`🏢 CEO 종합 판단 중...\n`);

  const ceoPrompt = `${CONTEXT}

오늘 긴급 회의에서 각 팀의 발언:

마케팅: ${outputs["마케팅 팀장"]}

CTO: ${outputs["CTO"]}

전략: ${outputs["전략 이사"]}

비즈니스: ${outputs["비즈니스 디렉터"]}

당신은 CEO입니다. 위 발언을 종합하여:
1. 프로덕트에서 당장 고쳐야 할 것 (이번 주)
2. 성장을 위해 추가해야 할 기능 (이번 달)
3. 전체 방향성 재정립
4. 창업자에게 전달할 핵심 메시지

한국어. 15줄 이내. 구체적으로.`;

  const ceoSummary = askClaude(ceoPrompt);
  outputs["CEO"] = ceoSummary;
  console.log(ceoSummary);

  // 회의록 저장
  const minutes = `# SAHU 긴급 경영 회의 — 프로덕트 점검
## ${TODAY}

## 안건
1. 프로덕트 UX 문제
2. 체크리스트 완료 후 다음 단계 없음
3. 재방문 이유 없음
4. 공유 기능 없음
5. 사용자 피드백 수집 경로 없음
6. SEO 외 성장 채널 부재
7. 프로덕트 성장 전략

## 마케팅 팀장
${outputs["마케팅 팀장"]}

## CTO
${outputs["CTO"]}

## 전략 이사
${outputs["전략 이사"]}

## 비즈니스 디렉터
${outputs["비즈니스 디렉터"]}

## CEO 종합
${outputs["CEO"]}
`;

  writeFileSync(`${MEETING_DIR}/${TODAY}-emergency.md`, minutes, "utf-8");

  // Google Sheets 저장
  try {
    const { google } = await import("googleapis");
    const auth = new google.auth.GoogleAuth({
      keyFile: `${BASE}/google-credentials.json`,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const meetingSheet = spreadsheet.data.sheets.find(s => s.properties.title === "회의록");
    if (!meetingSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "회의록" } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "회의록!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["날짜", "마케팅", "CTO", "전략", "비즈니스", "CEO 종합"]],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "회의록!A:F",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          `${TODAY} (긴급)`,
          outputs["마케팅 팀장"],
          outputs["CTO"],
          outputs["전략 이사"],
          outputs["비즈니스 디렉터"],
          outputs["CEO"],
        ]],
      },
    });
    console.log(`\n✅ 스프레드시트 "회의록" 탭 저장 완료`);
  } catch (err) {
    console.log(`\n❌ 시트 저장 실패: ${err.message.slice(0, 100)}`);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  📝 회의록: agents/meetings/${TODAY}-emergency.md`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(console.error);
