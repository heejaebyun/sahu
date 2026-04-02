#!/usr/bin/env node
// SAHU 텔레그램 봇 — 폴링 방식
// Usage: node scripts/telegram-bot.mjs
// 크론: * * * * * (매분 실행) 또는 상시 실행

import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync } from "fs";

const BOT_TOKEN = "8744395297:AAEMm9bXpCPJqPRgxBQS9wc9YDeNvNjowQo";
const CHAT_ID = "6490065259";
const BASE = "/Users/byunheejae/Desktop/sahu";
const OFFSET_FILE = `${BASE}/scripts/.telegram-offset`;
const LOG_FILE = `${BASE}/agents/board/telegram-log.md`;
const CLAUDE = (() => {
  try {
    return execSync("which claude 2>/dev/null", { encoding: "utf-8" }).trim();
  } catch {
    return "/Users/byunheejae/.local/bin/claude";
  }
})();

// 마지막 처리한 update_id 기록
function getOffset() {
  try {
    return parseInt(readFileSync(OFFSET_FILE, "utf-8").trim(), 10);
  } catch {
    return 0;
  }
}

function saveOffset(offset) {
  writeFileSync(OFFSET_FILE, String(offset), "utf-8");
}

// 대화 로그 저장
function logConversation(role, text) {
  const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const entry = `\n[${timestamp}] **${role}**: ${text}\n`;
  try {
    const existing = existsSync(LOG_FILE) ? readFileSync(LOG_FILE, "utf-8") : "# 텔레그램 대화 로그\n";
    writeFileSync(LOG_FILE, existing + entry, "utf-8");
  } catch {}
}

// 텔레그램 API 호출
async function telegramAPI(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// 텔레그램에 메시지 전송
async function sendMessage(text) {
  // 텔레그램 메시지 4096자 제한
  if (text.length > 4000) {
    const chunks = text.match(/[\s\S]{1,4000}/g);
    for (const chunk of chunks) {
      await telegramAPI("sendMessage", {
        chat_id: CHAT_ID,
        text: chunk,
        parse_mode: "HTML",
      });
    }
  } else {
    await telegramAPI("sendMessage", {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    });
  }
}

// Claude CLI로 응답 생성
function askClaude(userMessage) {
  // 컨텍스트 로드
  let context = "";
  try {
    const spec = readFileSync(`${BASE}/SPEC.md`, "utf-8").slice(0, 2000);
    const changelog = readFileSync(`${BASE}/agents/board/changelog.md`, "utf-8").slice(0, 1500);
    context = `\n=== 서비스 스펙 요약 ===\n${spec}\n=== 최근 변경 ===\n${changelog}\n`;
  } catch {}

  const prompt = `당신은 SAHU(사후) 서비스의 AI 어시스턴트입니다. 창업자가 텔레그램으로 질문합니다.

${context}

규칙:
- 직설적으로, 숫자와 근거로 답하세요
- 긍정 편향 금지
- 모르면 모른다고 하세요
- 한국어로 답하세요
- 간결하게 (텔레그램이므로 300자 이내 권장)

창업자 메시지: ${userMessage}`;

  const tmpFile = `/tmp/sahu-telegram-${Date.now()}.txt`;
  writeFileSync(tmpFile, prompt, "utf-8");

  try {
    const output = execSync(
      `cat "${tmpFile}" | "${CLAUDE}" --print --model sonnet --effort medium 2>/dev/null`,
      { encoding: "utf-8", timeout: 120000, cwd: BASE }
    );
    return output.trim();
  } catch (err) {
    return `[응답 생성 실패] ${err.message.slice(0, 100)}`;
  }
}

// 메인 루프
async function main() {
  const offset = getOffset();

  // 새 메시지 가져오기
  const updates = await telegramAPI("getUpdates", {
    offset: offset + 1,
    timeout: 30,
    allowed_updates: ["message"],
  });

  if (!updates.ok || !updates.result || updates.result.length === 0) {
    return;
  }

  for (const update of updates.result) {
    const msg = update.message;
    if (!msg || !msg.text) {
      saveOffset(update.update_id);
      continue;
    }

    // 본인 메시지만 처리
    if (String(msg.chat.id) !== CHAT_ID) {
      saveOffset(update.update_id);
      continue;
    }

    const userText = msg.text;
    console.log(`📩 메시지: ${userText}`);
    logConversation("창업자", userText);

    // 명령어 처리
    if (userText === "/start") {
      await sendMessage("🏢 SAHU 봇이 활성화되었습니다.\n\n메시지를 보내면 AI가 답변합니다.\n\n명령어:\n/status — 현재 상태\n/meeting — 회의 요약\n/todo — 할일 확인");
    } else if (userText === "/status") {
      let status = "📊 SAHU 현재 상태\n\n";
      try {
        const spec = readFileSync(`${BASE}/SPEC.md`, "utf-8");
        const match = spec.match(/## 현재 상태[\s\S]*$/);
        status += match ? match[0].slice(0, 1000) : "상태 정보를 찾을 수 없습니다.";
      } catch {
        status += "SPEC.md를 읽을 수 없습니다.";
      }
      await sendMessage(status);
    } else if (userText === "/meeting") {
      try {
        const files = execSync(`ls ${BASE}/agents/meetings/*.md 2>/dev/null | sort | tail -1`, { encoding: "utf-8" }).trim();
        if (files) {
          const meeting = readFileSync(files, "utf-8");
          // CEO 종합 부분만 추출
          const ceoMatch = meeting.match(/## (?:3라운드|CEO 종합)[\s\S]*/);
          await sendMessage(`📝 최근 회의 결론\n\n${(ceoMatch ? ceoMatch[0] : meeting).slice(0, 3500)}`);
        }
      } catch {
        await sendMessage("회의록을 찾을 수 없습니다.");
      }
    } else if (userText === "/todo") {
      try {
        const changelog = readFileSync(`${BASE}/agents/board/changelog.md`, "utf-8");
        await sendMessage(`📋 최근 변경사항\n\n${changelog.slice(0, 3000)}`);
      } catch {
        await sendMessage("변경사항을 찾을 수 없습니다.");
      }
    } else {
      // 일반 메시지 → Claude 응답
      await sendMessage("🤔 생각 중...");
      const response = askClaude(userText);
      await sendMessage(response);
      logConversation("소넷", response);
    }

    saveOffset(update.update_id);
  }
}

// 실행 모드: 상시 폴링
async function runLoop() {
  console.log("🤖 SAHU 텔레그램 봇 시작...\n");
  while (true) {
    try {
      await main();
    } catch (err) {
      console.error("폴링 에러:", err.message);
    }
    // 2초 대기 후 다시 폴링
    await new Promise((r) => setTimeout(r, 2000));
  }
}

runLoop();
