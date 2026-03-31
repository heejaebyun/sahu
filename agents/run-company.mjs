#!/usr/bin/env node
// SAHU 가상 회사 — 매일 오후 10시 실행
// 각 에이전트가 Claude CLI로 실제 사고하고 실행

import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";

const BASE = "/Users/byunheejae/Desktop/sahu";
// Claude CLI 경로 자동 감지
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
const TODAY = new Date().toISOString().split("T")[0];
const MEETING_DIR = `${BASE}/agents/meetings`;
const BOARD_DIR = `${BASE}/agents/board`; // 에이전트 간 메시지 보드

mkdirSync(MEETING_DIR, { recursive: true });
mkdirSync(BOARD_DIR, { recursive: true });

function askClaude(prompt) {
  const tmpFile = `/tmp/sahu-meeting-${Date.now()}.txt`;
  writeFileSync(tmpFile, prompt, "utf-8");
  try {
    const output = execSync(
      `cat "${tmpFile}" | "${CLAUDE}" --print --model opus --effort max --allowedTools "WebSearch,WebFetch" 2>/dev/null`,
      { encoding: "utf-8", timeout: 300000, cwd: BASE }
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

  // 회사 현황 문서 읽기
  let companyStatus = "";
  try {
    companyStatus = readFileSync(`${BASE}/agents/COMPANY-STATUS.md`, "utf-8");
  } catch {
    companyStatus = "현황 문서 없음";
  }

  // 서비스 스펙 문서 읽기 (구현 완료/미구현/예정 사항)
  let specDoc = "";
  try {
    if (existsSync(`${BASE}/SPEC.md`)) {
      specDoc = readFileSync(`${BASE}/SPEC.md`, "utf-8");
    }
  } catch {}

  // 변경 로그 읽기 (창업자/개발자가 수정한 내역)
  let changeLog = "";
  try {
    const changeLogPath = `${BASE}/agents/board/changelog.md`;
    if (existsSync(changeLogPath)) {
      changeLog = readFileSync(changeLogPath, "utf-8");
    }
  } catch {}

  const companyContext = `
당신은 SAHU(사후) 회사의 팀원입니다.

=== 서비스 스펙 문서 (현재 구현된 기능 목록 — 반드시 숙지) ===
${specDoc}
=== 스펙 문서 끝 ===

=== 회사 현황 문서 (반드시 숙지 후 발언) ===
${companyStatus}
=== 현황 문서 끝 ===

${changeLog ? `=== 최근 코드/서비스 변경 내역 (회의 전 필독) ===\n${changeLog}\n=== 변경 내역 끝 ===\n` : ""}
${ctx.boardMessages ? `=== 에이전트 간 메시지 ===\n${ctx.boardMessages}\n=== 메시지 끝 ===\n` : ""}
오늘의 실시간 데이터:
${ctx.sheetStats}

이전 회의 요약:
${ctx.lastMeeting ? ctx.lastMeeting.slice(0, 500) : "첫 회의"}

중요 규칙:
1. 스펙 문서에 이미 구현된 기능을 다시 제안하지 마세요. 이미 있는 것을 모르고 제안하면 평가에 감점됩니다.
2. 확정된 의사결정을 다시 제안하지 마세요.
3. 변경 내역에 이미 수정된 것을 다시 제안하지 마세요.
4. 제안할 때는 반드시 스펙 문서를 확인하고, 현재 없는 기능만 제안하세요.
5. 현재 상태(as-is)를 정확히 파악한 후 미래(to-be)를 논하세요.
6. 긍정적으로 답하지 마세요. "가능합니다", "좋은 방향입니다" 금지. 직설적으로 답하고 근거를 제시하세요.
7. 모르면 "모릅니다"라고 하세요. 검증 안 된 내용을 사실처럼 말하면 평가에 감점됩니다.
8. "많다/적다/크다" 같은 모호한 표현 금지. 반드시 구체적 숫자로 표현하세요.
9. 학습 데이터로만 답하지 마세요. WebSearch, WebFetch 도구로 직접 검색하고 최신 데이터를 확인한 후 답하세요. 논문, 기사, 공식 사이트를 직접 읽고 근거를 가져오세요.
`;

  // 3. 각 에이전트 회의 발언
  const TARGET = "한 달 이내에 실 이용자 5,000명 달성";

  const agents = [
    {
      name: "운영 담당",
      prompt: `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 운영 담당입니다. 회의 시작 전 현황 데이터를 먼저 보고하세요:
1. 현황 숫자 보고: 크롤링 실행 횟수, 상담 신청 건수, 자동화 정상 동작 여부, 에러 건수
2. 5,000명 달성을 위해 운영에서 이번 주 해야 할 구체적 액션 2개 (자동화 확대, 크론 최적화 등)
3. 다른 팀에 필요한 것 1개

숫자 기반으로 보고. 한국어. 5줄 이내.`,
    },
    {
      name: "리서치·수익화 담당",
      prompt: `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 리서치·수익화 담당입니다. 데이터와 수익 모델을 동시에 책임집니다.
1. 데이터 브리핑: 경쟁 서비스 현황, 키워드 검색량 트렌드, 세무사 수수료 시세 등 팀 의사결정에 필요한 데이터 1-2개
2. 수익화 준비: 세무사/법무사 제휴 모델 진행 상황, 건당 수수료 구조, 예상 전환율
3. 5,000명 유입을 위한 데이터 기반 채널 추천 1개 (검색량·경쟁도 근거 포함)

숫자와 근거 필수. 한국어. 7줄 이내.`,
    },
    {
      name: "마케팅 팀장",
      prompt: `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 마케팅 팀장입니다. 5,000명 목표를 기준으로:

주의: 반드시 현황 문서의 "확정된 의사결정"을 준수하세요. 금지된 채널(네이버 카페 등)은 절대 제안하지 마세요.

1. 허용된 채널별 현황: 네이버 블로그, 브런치, 지식인, sahu.kr 오가닉 검색의 현재 유입 수치와 개선점
2. 5,000명 달성 채널별 분배 플랜: 허용된 채널에서만 구체적 숫자로 배분
3. 이번 주 실행 액션 2개 (실행 후 성과 측정 방법까지 포함)

수치 근거 필수. 한국어. 7줄 이내.`,
    },
    {
      name: "CTO",
      prompt: `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 CTO입니다. 회의 전 프로덕트 현황을 파악한 상태로:
1. 프로덕트 현황: 현재 기능 목록, 에러/장애 여부, 모바일 UX 상태
2. 5,000명 유입·리텐션을 위해 이번 주 구현할 기능 1-2개 (공수 포함)
3. 자동화 파이프라인 개선점 1개

구체적 구현 방법과 일정 포함. 한국어. 7줄 이내.`,
    },
    {
      name: "전략 이사",
      prompt: `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 전략 이사입니다. 시장 데이터와 경쟁 환경 기반으로:
1. 목표 대비 현재 위치 평가 (숫자 기반)
2. 5,000명 달성 4주 로드맵: 주차별 목표와 핵심 전략
3. 경쟁사 대비 우리의 차별점과 가장 빠른 유저 확보 전략 1개
4. 각 팀에 지시할 구체적 액션 (담당자·기한 명시)

감이 아닌 근거 기반. 한국어. 10줄 이내.`,
    },
    {
      name: "사업개발 담당",
      prompt: `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 사업개발 담당입니다. 신규 사업 기회를 발굴하고 검증합니다.
기존 보유 자산(크롤링, 콘텐츠 생성 등)에 국한하지 마세요. AI 에이전트가 자율적으로 운영할 수 있는 모든 사업을 탐색합니다.

1. 현재 SAHU 사업과 시너지 있는 신규 수익원 1개 (구체적 숫자 포함)
2. SAHU와 무관하지만 에이전트 시스템으로 자동 운영 가능한 사업 기회 1개
3. 각 아이템: 경쟁자 현황, 법적 리스크, 돈 내는 사람의 인센티브, 월 100만원까지 소요 시간

검증 안 된 내용을 사실처럼 말하면 감점. "경쟁자 0개"라고 하려면 근거 필수.
한국어. 7줄 이내.`,
    },
    {
      name: "브랜딩 담당",
      prompt: `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 브랜딩 담당입니다. 브랜드 아이덴티티, UX, 톤앤매너, 첫인상을 책임집니다.
1. 현재 sahu.kr 첫 진입 경험 평가: 유저가 3초 안에 "이 서비스가 뭔지, 믿을 수 있는지" 판단 가능한가?
2. 브랜드 신뢰도 요소 점검: 현재 빠져 있는 신뢰 요소가 있는가? (소개, 실적, 추천, 보증 등)
3. 톤앤매너: 유가족 대상 서비스로서 현재 톤이 적절한가?
4. 5,000명 유입 시 첫인상에서 이탈하지 않도록 개선할 점 1-2개

구체적 근거 포함. 한국어. 7줄 이내.`,
    },
  ];

  const agentOutputs = {};

  // ── 1라운드: 각자 발언 ──
  console.log(`\n${"━".repeat(60)}`);
  console.log(`  📢 1라운드 — 각 에이전트 발언`);
  console.log(`${"━".repeat(60)}`);

  for (const agent of agents) {
    console.log(`\n💬 ${agent.name} 발언 중...\n`);
    const response = askClaude(agent.prompt);
    agentOutputs[agent.name] = response;
    console.log(response);
    console.log(`\n${"─".repeat(40)}`);
  }

  // ── 2라운드: 상호 반박/동의/질문 ──
  console.log(`\n${"━".repeat(60)}`);
  console.log(`  🔄 2라운드 — 상호 토론`);
  console.log(`${"━".repeat(60)}`);

  const allRound1 = Object.entries(agentOutputs)
    .map(([name, output]) => `[${name}]\n${output}`)
    .join("\n\n");

  const round2Outputs = {};

  for (const agent of agents) {
    console.log(`\n💬 ${agent.name} 토론 중...\n`);
    const round2Prompt = `${companyContext}

회사 최우선 목표: ${TARGET}

당신은 ${agent.name}입니다. 1라운드에서 전체 팀의 발언을 들었습니다.

=== 1라운드 전체 발언 ===
${allRound1}
=== 끝 ===

당신의 1라운드 발언:
${agentOutputs[agent.name]}

이제 2라운드입니다. 다른 에이전트의 발언을 읽고:
1. 동의하지 않는 점이 있으면 반박하세요 (근거 필수)
2. 다른 에이전트에게 질문할 것이 있으면 하세요
3. 자기 발언을 수정/보완할 것이 있으면 하세요
4. 이미 구현된 것을 제안한 에이전트가 있으면 지적하세요

토론이니까 솔직하게. 한국어. 5줄 이내.`;

    const response = askClaude(round2Prompt);
    round2Outputs[agent.name] = response;
    console.log(response);
    console.log(`\n${"─".repeat(40)}`);
  }

  // ── 3라운드: CEO 종합 ──
  console.log(`\n${"━".repeat(60)}`);
  console.log(`  🏢 3라운드 — CEO 종합 판단`);
  console.log(`${"━".repeat(60)}\n`);

  const ceoPrompt = `${companyContext}

회사 최우선 목표: 한 달 이내에 실 이용자 5,000명 달성

=== 1라운드: 각 팀 발언 ===
${allRound1}

=== 2라운드: 상호 토론 ===
${Object.entries(round2Outputs).map(([name, output]) => `[${name}]\n${output}`).join("\n\n")}

당신은 CEO입니다. 1라운드 발언 + 2라운드 토론을 종합하세요.
2라운드에서 반박된 제안은 반영하지 마세요. 합의된 사항 위주로 결론 내리세요.

1. 이번 주 최우선 실행 과제 (최대 3개)
2. 각 과제별: [결정사항] / [담당자] / [기한]
3. 창업자에게 전달: 수동으로 해야 할 것 (있으면)
4. 5,000명 달성 진척도와 이번 주 목표 숫자
5. 2라운드에서 나온 핵심 쟁점과 결론

결론 없는 회의는 허용하지 않습니다. 반드시 확정된 의사결정을 내리세요.
한국어. 15줄 이내.`;

  const ceoSummary = askClaude(ceoPrompt);
  console.log(ceoSummary);

  // 5. 회의록 저장
  const minutes = `# SAHU 일일 경영 회의 — ${TODAY}

## 참석자
운영 담당, 리서치·수익화 담당, 마케팅 팀장, CTO, 전략 이사, 사업개발 담당, 브랜딩 담당, CEO

## 핵심 목표
한 달 이내에 실 이용자 5,000명 달성

## 데이터 현황
${ctx.sheetStats}

## 1라운드 — 팀별 발언

### 운영 담당
${agentOutputs["운영 담당"]}

### 리서치·수익화 담당
${agentOutputs["리서치·수익화 담당"]}

### 마케팅 팀장
${agentOutputs["마케팅 팀장"]}

### CTO
${agentOutputs["CTO"]}

### 전략 이사
${agentOutputs["전략 이사"]}

### 사업개발 담당
${agentOutputs["사업개발 담당"]}

### 브랜딩 담당
${agentOutputs["브랜딩 담당"]}

## 2라운드 — 상호 토론

### 운영 담당
${round2Outputs["운영 담당"]}

### 리서치·수익화 담당
${round2Outputs["리서치·수익화 담당"]}

### 마케팅 팀장
${round2Outputs["마케팅 팀장"]}

### CTO
${round2Outputs["CTO"]}

### 전략 이사
${round2Outputs["전략 이사"]}

### 사업개발 담당
${round2Outputs["사업개발 담당"]}

### 브랜딩 담당
${round2Outputs["브랜딩 담당"]}

## 3라운드 — CEO 종합
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
        range: "회의록!A1:I1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["날짜", "운영", "리서치·수익화", "마케팅", "CTO", "전략", "브랜딩", "2라운드 토론", "CEO 종합"]],
        },
      });
    }

    const round2Summary = Object.entries(round2Outputs)
      .map(([name, output]) => `[${name}] ${output}`)
      .join("\n\n");

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "회의록!A:I",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          TODAY,
          agentOutputs["운영 담당"],
          agentOutputs["리서치·수익화 담당"],
          agentOutputs["마케팅 팀장"],
          agentOutputs["CTO"],
          agentOutputs["전략 이사"],
          agentOutputs["브랜딩 담당"],
          round2Summary,
          ceoSummary,
        ]],
      },
    });
    console.log(`  ✅ 스프레드시트 "회의록" 탭에 저장 완료`);
  } catch (err) {
    console.log(`  ❌ 시트 저장 실패: ${err.message.slice(0, 100)}`);
  }

  // 7. 오늘 할일 생성 (창업자 + 에이전트)
  console.log(`\n📋 오늘 할일 정리 중...\n`);
  const todoPrompt = `아래는 오늘 SAHU 경영 회의 CEO 결론입니다.

${ceoSummary}

위 결론을 바탕으로 두 가지로 분류하세요:

[창업자 할일] — 사람이 직접 해야 하는 것 (블로그 수동 발행, 카페 가입, 외부 서비스 확인 등)
[에이전트 할일] — 코드/자동화로 처리할 수 있는 것 (기능 구현, 스크립트 수정, 시트 생성 등)

형식 (각 줄에 하나씩, | 구분, 머리말/꼬리말 없이 데이터만):
구분(창업자/에이전트) | 할일내용 | 우선순위(상/중/하) | 기한

한국어. 최대 8개.`;

  const todoResult = askClaude(todoPrompt);
  console.log(todoResult);

  // Google Sheets "오늘할일" 탭에 저장
  try {
    const { google: gTodo } = await import("googleapis");
    const todoAuth = new gTodo.auth.GoogleAuth({
      keyFile: `${BASE}/google-credentials.json`,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const todoSheets = gTodo.sheets({ version: "v4", auth: todoAuth });
    const TODO_SHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

    const todoSpreadsheet = await todoSheets.spreadsheets.get({ spreadsheetId: TODO_SHEET_ID });
    const todoSheet = todoSpreadsheet.data.sheets.find(s => s.properties.title === "오늘할일");
    if (!todoSheet) {
      await todoSheets.spreadsheets.batchUpdate({
        spreadsheetId: TODO_SHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "오늘할일" } } }],
        },
      });
      await todoSheets.spreadsheets.values.update({
        spreadsheetId: TODO_SHEET_ID,
        range: "오늘할일!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["날짜", "구분", "할일", "우선순위", "기한", "완료여부"]],
        },
      });
    }

    const todoLines = todoResult.split("\n").filter(l => l.includes("|") && !l.includes("---") && !l.includes("구분"));
    const todoRows = todoLines.map(line => {
      const parts = line.split("|").map(p => p.trim());
      return [TODAY, parts[0] || "", parts[1] || "", parts[2] || "", parts[3] || "", ""];
    });

    if (todoRows.length > 0) {
      await todoSheets.spreadsheets.values.append({
        spreadsheetId: TODO_SHEET_ID,
        range: "오늘할일!A:F",
        valueInputOption: "RAW",
        requestBody: { values: todoRows },
      });
      console.log(`\n✅ "오늘할일" 탭에 ${todoRows.length}건 저장`);
    }
  } catch (err) {
    console.log(`\n❌ 할일 저장 실패: ${err.message.slice(0, 100)}`);
  }

  // 9. 금요일이면 HR 평가 실행
  const dayOfWeek = new Date().getDay(); // 0=일, 5=금
  if (dayOfWeek === 5) {
    console.log(`\n👔 금요일 — HR 에이전트 주간 평가 실행...\n`);
    try {
      const hrResult = execSync(`cd ${BASE} && node agents/hr-agent.mjs 2>&1`, {
        encoding: "utf-8", timeout: 600000,
      });
      console.log(hrResult);
    } catch (err) {
      console.log(`HR 평가 에러: ${err.message.slice(0, 200)}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  📝 회의록 저장: agents/meetings/${TODAY}.md`);
  console.log(`  📊 스프레드시트: 회의록 탭 + 오늘할일 탭`);
  if (dayOfWeek === 5) console.log(`  👔 HR 평가: agents/evaluations/${TODAY}.md`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(console.error);
