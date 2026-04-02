// 텔레그램 봇 알림

export async function sendTelegramAlert(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("텔레그램 환경변수 미설정 (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)");
    return;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("텔레그램 발송 실패:", err);
    }
  } catch (err) {
    console.error("텔레그램 발송 오류:", err);
  }
}
