#!/usr/bin/env node
// SAHU 가상 회사 — 매일 오후 10시 실행
// 각 에이전트가 Claude CLI로 실제 사고하고 실행

import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";
const CLAUDE = "/Users/byunheejae/.vscode/extensions/anthropic.claude-code-2.1.86-darwin-arm64/resources/native-binary/claude";
const TODAY = new Date().toISOString().split("T")[0];
const MEETING_DIR = `${BASE}/agents/meetings`;
const BOARD_DIR = `${BASE}/agents/board`; // 에이전트 간 메시지 보드

mkdirSync(MEETING_DIR, { recursive: true });
mkdirSync(BOARD_DIR, { recursive: true });

function askClaude(prompt, maxTokens = 2000) {
  try {
    const escaped = prompt.replace(/'/g, "'\\''");
    const output = execSync(
      `echo '${escaped}' | "${CLAUDE}" --print --max-tokens ${maxTokens} --dangerously-skip-permissions 2>/dev/null`,
      { encoding: "utf-8", timeout: 120000, cwd: BASE }
    );
    return output.trim();
  } catch (err) {
    return `[에러] ${err.message.slice(0, 200)}`;
  }
}

function getContext() {
  // 스프레드시트 현황
  let sheetStats = "";
  try {
    sheetStats = execSync(`cd ${BASE} && node --input-type=module -e "
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
      const keywords = {};
      rows.forEach(r => { keywords[r[2]] = (keywords[r[2]] || 0) + 1; });
      console.log('총 질문: ' + rows.length);
      console.log('등급: A=' + grades.A + ' B=' + grades.B + ' C=' + grades.C + ' D=' + grades.D + ' 범위밖=' + grades.X);
      console.log('미채택: ' + unanswered);
      console.log('키워드별: ' + Object.entries(keywords).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+'('+v+')').join(', '));
    "`, { encoding: "utf-8", timeout: 30000 });
  } catch { sheetStats = "스프레드시트 데이터 조회 실패"; }

  // 의사결정 로그
  let decisions = "";
  try {
    const log = JSON.parse(readFileSync(`${BASE}/agents/decision-log.json`, "utf-8"));
    decisions = log.decisions.slice(-5).map(d => `${d.date}: ${d.question} → ${d.decision} (${d.reason})`).join("\n");
  } catch {}

  // 이전 회의록
  let lastMeeting = "";
  try {
    const files = execSync(`ls ${MEETING_DIR}/*.md 2>/dev/null | sort | tail -1`, { encoding: "utf-8" }).trim();
    if (files) lastMeeting = readFileSync(files, "utf-8").slice(0, 1000);
  } catch {}

  // 메시지 보드
  let boardMessages = "";
  try {
    const files = execSync(`ls ${BOARD_DIR}/*.md 2>/dev/null | sort | tail -10`, { encoding: "utf-8" }).trim();
    if (files) {
      for (const f of files.split("\n")) {
        boardMessages += readFileSync(f, "utf-8") + "\n---\n";
      }
    }
  } catch {}

  return { sheetStats, decisions, lastMeeting, boardMessages };
}

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  🏢 SAHU 일일 경영 회의`);
  console.log(`  📅 ${TODAY}`);
  console.log(`${"=".repeat(60)}\n`);

  // 1. 운영 에이전트 먼저 실행 (데이터 수집)
  console.log("⚙️ 운영: 일일 데이터 수집 실행...\n");
  try {
    const crawlResult = execSync(`cd ${BASE} && node scripts/daily-kin-crawl.mjs 2>&1 | tail -5`, {
      encoding: "utf-8", timeout: 120000,
    });
    console.log(crawlResult);
  } catch (err) {
    console.log(`크롤링 에러: ${err.message.slice(0, 100)}`);
  }

  // 1.5. 운영 에이전트: 상담 신청 체크
  console.log("📋 운영: 상담 신청 확인 중...\n");
  try {
    const consultResult = execSync(`cd ${BASE} && node agents/check-consult.mjs 2>&1`, {
      encoding: "utf-8", timeout: 120000,
    });
    console.log(consultResult);
  } catch (err) {
    console.log(`상담 체크 에러: ${err.message.slice(0, 100)}`);
  }

  // 2. 컨텍스트 수집
  const ctx = getContext();

  const companyContext = `
당신은 SAHU(사후) 회사의 팀원입니다.
SAHU는 사망 후 행정 처리 가이드 서비스(sahu.kr)를 운영합니다.

현재 현황:
${ctx.sheetStats}

최근 의사결정:
${ctx.decisions || "없음"}

이전 회의 요약:
${ctx.lastMeeting ? ctx.lastMeeting.slice(0, 500) : "첫 회의"}

에이전트 간 메시지:
${ctx.boardMessages ? ctx.boardMessages.slice(0, 500) : "없음"}

현재 단계: Phase 1 (트래픽 확보)
목표: 월 방문자 3,000명 달성
채널: sahu.kr(메인) + 네이버 블로그(blog.naver.com/sahu260328) + 브런치(신청중) + 지식인 답변
수익 모델: 세무사/법무사 매칭 (Phase 2에서 시작)
`;

  // 3. 각 에이전트 회의 발언
  const agents = [
    {
      name: "마케팅 팀장",
      prompt: `${companyContext}
당신은 마케팅 팀장입니다. 오늘의 데이터를 보고:
1. 콘텐츠/채널 현황 분석 (무엇이 잘 되고 있고, 무엇이 부족한지)
2. 이번 주에 해야 할 구체적 액션 1-2개 (실행 가능한 것만)
3. 다른 팀에 요청할 것이 있으면 1개

간결하게 한국어로 답변. 5줄 이내.`,
    },
    {
      name: "CTO",
      prompt: `${companyContext}
당신은 CTO입니다. 오늘의 현황을 보고:
1. 기술/자동화 현황 점검 (정상 동작 여부, 개선점)
2. 제품에 추가하면 좋을 기능 1개 (구체적으로)
3. 다른 팀에 요청할 것이 있으면 1개

간결하게 한국어로 답변. 5줄 이내.`,
    },
    {
      name: "전략 이사",
      prompt: `${companyContext}
당신은 전략 이사입니다. 전체 상황을 보고:
1. 현재 Phase 1 진행 상황 평가
2. 이번 주 가장 중요한 전략적 우선순위 1개
3. 리스크나 기회가 있으면 1개

간결하게 한국어로 답변. 5줄 이내.`,
    },
    {
      name: "비즈니스 디렉터",
      prompt: `${companyContext}
당신은 비즈니스 디렉터입니다. 사업 관점에서:
1. 수익화 준비 상황 점검
2. 이번 주 KPI 제안 (측정 가능한 숫자)
3. 파트너십이나 기회가 있으면 1개

간결하게 한국어로 답변. 5줄 이내.`,
    },
  ];

  const agentOutputs = {};

  for (const agent of agents) {
    console.log(`\n💬 ${agent.name} 발언 중...\n`);
    const response = askClaude(agent.prompt);
    agentOutputs[agent.name] = response;
    console.log(response);
    console.log(`\n${"─".repeat(40)}`);
  }

  // 4. CEO 종합
  console.log(`\n🏢 CEO 종합 판단 중...\n`);

  const ceoPrompt = `${companyContext}

오늘 회의에서 각 팀장의 발언:

마케팅: ${agentOutputs["마케팅 팀장"]}

CTO: ${agentOutputs["CTO"]}

전략: ${agentOutputs["전략 이사"]}

비즈니스: ${agentOutputs["비즈니스 디렉터"]}

당신은 CEO입니다. 위 발언을 종합하여:
1. 오늘의 결론 (가장 중요한 액션 1-2개)
2. 사용자(창업자)에게 전달할 사항 (수동으로 해야 할 것)
3. 내일까지 각 팀이 해야 할 것

간결하게 한국어로 답변. 10줄 이내.`;

  const ceoSummary = askClaude(ceoPrompt);
  console.log(ceoSummary);

  // 5. 회의록 저장
  const minutes = `# SAHU 일일 경영 회의 — ${TODAY}

## 참석자
마케팅 팀장, CTO, 전략 이사, 비즈니스 디렉터, CEO

## 데이터 현황
${ctx.sheetStats}

## 팀별 발언

### 마케팅 팀장
${agentOutputs["마케팅 팀장"]}

### CTO
${agentOutputs["CTO"]}

### 전략 이사
${agentOutputs["전략 이사"]}

### 비즈니스 디렉터
${agentOutputs["비즈니스 디렉터"]}

## CEO 종합
${ceoSummary}
`;

  writeFileSync(`${MEETING_DIR}/${TODAY}.md`, minutes, "utf-8");

  // 6. Google Sheets "회의록" 탭에 저장
  console.log(`\n📤 Google Sheets에 회의록 저장 중...`);
  try {
    const { google } = await import("googleapis");
    const auth = new google.auth.GoogleAuth({
      keyFile: `${BASE}/google-credentials.json`,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

    // "회의록" 시트 있는지 확인, 없으면 생성
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
          TODAY,
          agentOutputs["마케팅 팀장"],
          agentOutputs["CTO"],
          agentOutputs["전략 이사"],
          agentOutputs["비즈니스 디렉터"],
          ceoSummary,
        ]],
      },
    });
    console.log(`  ✅ 스프레드시트 "회의록" 탭에 저장 완료`);
  } catch (err) {
    console.log(`  ❌ 시트 저장 실패: ${err.message.slice(0, 100)}`);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  📝 회의록 저장: agents/meetings/${TODAY}.md`);
  console.log(`  📊 스프레드시트: 회의록 탭`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(console.error);
