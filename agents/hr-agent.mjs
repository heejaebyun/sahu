// HR 에이전트 — 에이전트 개별 평가 + 조직 진단
// CEO 에이전트 회의 후 실행

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { execSync } from "child_process";

const BASE = "/Users/byunheejae/Desktop/sahu";
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
const EVAL_DIR = `${BASE}/agents/evaluations`;
const MEETING_DIR = `${BASE}/agents/meetings`;
const TODAY = new Date().toISOString().split("T")[0];

mkdirSync(EVAL_DIR, { recursive: true });

function askClaude(prompt) {
  const tmpFile = `/tmp/sahu-hr-${Date.now()}.txt`;
  writeFileSync(tmpFile, prompt, "utf-8");
  try {
    return execSync(
      `cat "${tmpFile}" | "${CLAUDE}" --print --model opus --effort max --allowedTools "WebSearch,WebFetch" 2>/dev/null`,
      { encoding: "utf-8", timeout: 300000, cwd: BASE }
    ).trim();
  } catch (err) {
    return `[에러] ${err.message.slice(0, 200)}`;
  }
}

function getRecentMeetings() {
  try {
    const files = readdirSync(MEETING_DIR).filter(f => f.endsWith(".md")).sort().slice(-3);
    return files.map(f => readFileSync(`${MEETING_DIR}/${f}`, "utf-8")).join("\n\n---\n\n");
  } catch {
    return "회의록 없음";
  }
}

function getPreviousEval() {
  try {
    const files = readdirSync(EVAL_DIR).filter(f => f.endsWith(".md")).sort();
    if (files.length === 0) return "이전 평가 없음 (첫 평가)";
    const last = readFileSync(`${EVAL_DIR}/${files[files.length - 1]}`, "utf-8");
    return last.slice(0, 1500);
  } catch {
    return "이전 평가 없음";
  }
}

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  👔 SAHU HR 에이전트 — 주간 에이전트 평가`);
  console.log(`  📅 ${TODAY}`);
  console.log(`${"=".repeat(60)}\n`);

  const meetings = getRecentMeetings();
  const prevEval = getPreviousEval();

  // 회사 현황 문서 읽기
  let companyStatus = "";
  try {
    companyStatus = readFileSync(`${BASE}/agents/COMPANY-STATUS.md`, "utf-8");
  } catch {
    companyStatus = "현황 문서 없음";
  }

  const agents = [
    {
      name: "마케팅 팀장",
      role: "콘텐츠 전략, SEO, 채널 관리, 키워드 분석",
      deliverables: "블로그 글 생성, 지식인 크롤링 데이터 분석, 채널별 전략 제안",
    },
    {
      name: "CTO",
      role: "기술 인프라, 제품 기능, 자동화 파이프라인",
      deliverables: "sahu.kr 기능 구현, API 개발, 자동화 스크립트, 성능 모니터링",
    },
    {
      name: "전략 이사",
      role: "시장 분석, 경쟁 환경, Phase 전환 판단, 포지셔닝",
      deliverables: "전략 방향 제안, Phase 전환 기준 설정, 차별화 전략",
    },
    {
      name: "운영 담당",
      role: "일일 자동화 실행, 상담 신청 처리, 크론 관리, 현황 데이터 보고",
      deliverables: "크롤링 실행, 성과 측정, 상담 신청 확인, 숫자 기반 현황 보고",
    },
    {
      name: "리서치·수익화 담당",
      role: "시장 조사, 경쟁사 분석, 데이터 수집, 수익 모델 설계, 파트너십",
      deliverables: "경쟁 서비스 조사, 키워드 검색량 분석, 세무사 수수료 시세, 제휴 모델 설계, KPI 트래킹",
    },
    {
      name: "사업개발 담당",
      role: "신규 사업 기회 발굴, 검증, 실행 가능성 평가, 경쟁자 분석",
      deliverables: "신규 수익원 제안, 사업 아이템 검증, 시장 규모 분석, 법적 리스크 확인",
    },
    {
      name: "브랜딩 담당",
      role: "브랜드 아이덴티티, UX, 톤앤매너, 첫인상, 랜딩 전략",
      deliverables: "브랜드 신뢰도 점검, 톤앤매너 가이드, 랜딩 페이지 제안, 이탈률 개선",
    },
    {
      name: "CEO",
      role: "종합 판단, 의사결정, 팀 방향 설정, 창업자 보고",
      deliverables: "회의 종합 결론, 액션 아이템 도출, 팀별 지시, 창업자 전달사항",
    },
  ];

  // 회의록에서 특정 에이전트의 발언 섹션 추출
  function extractAgentSection(meetingText, agentName) {
    const escaped = agentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp("### " + escaped + "\\n([\\s\\S]*?)(?=\\n###|\\n## |$)", "g");
    const match = pattern.exec(meetingText);
    if (match) return match[1].trim();

    // "## CEO 종합" 같은 특수 섹션도 체크
    if (agentName === "CEO") {
      const ceoPattern = /\n## CEO 종합\n([\s\S]*?)(?=\n## |$)/g;
      const ceoMatch = ceoPattern.exec(meetingText);
      if (ceoMatch) return ceoMatch[1].trim();
    }

    return `[${agentName}의 발언이 회의록에서 발견되지 않음]`;
  }

  const evaluations = {};

  for (const agent of agents) {
    console.log(`📋 ${agent.name} 평가 중...\n`);

    // 해당 에이전트의 발언만 추출
    const agentSection = extractAgentSection(meetings, agent.name);

    const evalResult = askClaude(`당신은 SAHU 회사의 HR 담당입니다. 아래 에이전트를 평가하세요.

=== 회사 현황 문서 ===
${companyStatus.slice(0, 3000)}
=== 현황 문서 끝 ===

에이전트: ${agent.name}
역할: ${agent.role}
기대 산출물: ${agent.deliverables}

이 에이전트의 최근 회의 발언:
${agentSection.slice(0, 2000)}

이전 평가:
${prevEval.slice(0, 500)}

아래 항목으로 평가하세요:
1. 업무 수행도 (A/B/C/D) — 자기 역할에 맞는 일을 하고 있는가?
2. 기여도 — 회의에서 실질적이고 실행 가능한 제안을 했는가?
3. 개선점 — 구체적으로 뭘 더 잘할 수 있는가?
4. 액션플랜 — 다음 주에 이 에이전트가 구체적으로 해야 할 것 2-3개 (실행 가능하고 측정 가능한 것)
5. 권고사항 — 역할이나 업무 방식에서 바뀌어야 할 것이 있으면 1개

한국어. 각 항목 1-2줄. 간결하게.`);

    evaluations[agent.name] = evalResult;
    console.log(evalResult);
    console.log(`\n${"─".repeat(40)}\n`);
  }

  // CEO와 대화: 조직 진단 + 추가 에이전트 필요성
  console.log(`🏢 CEO와 조직 진단 대화...\n`);

  const orgDiagnosis = askClaude(`당신은 SAHU 회사의 HR 담당이고, CEO와 조직 진단 대화를 하고 있습니다.

현재 에이전트 조직:
- 마케팅 팀장: 콘텐츠/SEO/채널, 수치 기반 채널별 유입 플랜
- CTO: 기술/제품/자동화, 프로덕트 현황 파악 후 발언
- 전략 이사: 시장/방향/포지셔닝, 경쟁사 데이터 기반 판단
- 운영 담당: 일일 실행/크론/상담 처리, 숫자 기반 현황 보고
- 리서치·수익화 담당: 조사/데이터 수집 + 수익 모델/파트너십/KPI (구 비즈니스+리서치 통합)
- CEO: 종합 판단, 결정사항/담당자/기한 확정
- HR: 평가/조직 진단 (본인)

각 에이전트 평가 결과:
${Object.entries(evaluations).map(([name, eval_]) => `${name}: ${eval_.slice(0, 200)}`).join("\n\n")}

회사 현황 (COMPANY-STATUS.md 참조):
${companyStatus.slice(0, 1500)}

CEO에게 보고할 내용:
1. 조직 전체 건강도 (A/B/C/D)
2. 가장 잘하는 에이전트 & 가장 개선 필요한 에이전트
3. 현재 조직에 빠진 역할이 있는가? 새 에이전트가 필요한가?
4. 조직 운영 개선 권고사항 1-2개

한국어. 10줄 이내. 구체적으로.`);

  console.log(orgDiagnosis);

  // 평가서 저장
  const evalReport = `# SAHU HR 평가 보고서 — ${TODAY}

## 개별 에이전트 평가

${Object.entries(evaluations).map(([name, eval_]) => `### ${name}\n${eval_}`).join("\n\n")}

## 조직 진단 (CEO 보고)
${orgDiagnosis}
`;

  writeFileSync(`${EVAL_DIR}/${TODAY}.md`, evalReport, "utf-8");

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
    const hrSheet = spreadsheet.data.sheets.find(s => s.properties.title === "HR평가");
    if (!hrSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "HR평가" } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "HR평가!A1:H1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["날짜", "마케팅", "CTO", "전략", "운영", "리서치·수익화", "CEO", "조직진단"]],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "HR평가!A:H",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          TODAY,
          evaluations["마케팅 팀장"],
          evaluations["CTO"],
          evaluations["전략 이사"],
          evaluations["운영 담당"],
          evaluations["리서치·수익화 담당"],
          evaluations["CEO"],
          orgDiagnosis,
        ]],
      },
    });
    console.log(`\n✅ 스프레드시트 "HR평가" 탭 저장 완료`);
  } catch (err) {
    console.log(`\n❌ 시트 저장 실패: ${err.message.slice(0, 100)}`);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  📝 평가서: agents/evaluations/${TODAY}.md`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(console.error);
