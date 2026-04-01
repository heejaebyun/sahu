import { google } from "googleapis";
import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/email";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

function generateOrderNumber() {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const date = `${kst.getFullYear()}${String(kst.getMonth() + 1).padStart(2, "0")}${String(kst.getDate()).padStart(2, "0")}`;
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `SH-${date}-${seq}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, phone, depositorName, paymentMethod, formData } = body;

    if (!email || !phone || !depositorName || !paymentMethod || !formData) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
    }

    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // "주문" 시트 확인/생성
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const orderSheet = spreadsheet.data.sheets.find((s) => s.properties.title === "주문");
    if (!orderSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "주문" } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "주문!A1:I1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["주문번호", "주문일시", "상태", "결제수단", "입금자명", "연락처", "이메일", "JSON_Payload", "관리자메모"]],
        },
      });
    }

    const orderNumber = generateOrderNumber();
    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "주문!A:I",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          orderNumber,
          now,
          "대기중",
          paymentMethod,
          depositorName,
          phone,
          email,
          JSON.stringify(formData),
          "",
        ]],
      },
    });

    // 유저에게 주문 확인 이메일
    try {
      await sendOrderConfirmation({ to: email, orderNumber, depositorName, paymentMethod });
    } catch (emailErr) {
      console.error("주문 확인 이메일 발송 실패:", emailErr);
    }

    // 창업자에게 새 주문 알림 (전화번호 포함 — 계좌이체 시 수동 문자 발송용)
    try {
      const adminEmail = process.env.GMAIL_USER;
      if (adminEmail) {
        const { default: nodemailer } = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
        });
        await transporter.sendMail({
          from: adminEmail,
          to: adminEmail,
          subject: `🔔 새 주문: ${orderNumber} (${paymentMethod})`,
          html: `<h3>새 주문이 접수되었습니다</h3>
            <p><strong>주문번호:</strong> ${orderNumber}</p>
            <p><strong>입금자명:</strong> ${depositorName}</p>
            <p><strong>결제수단:</strong> ${paymentMethod}</p>
            <p><strong>연락처:</strong> ${phone}</p>
            <p><strong>이메일:</strong> ${email}</p>
            ${paymentMethod === "계좌이체" ? "<p style='color:red;font-weight:bold'>⚠️ 계좌이체 선택 — 이 전화번호로 계좌번호 문자를 보내주세요!</p>" : ""}
            <p>Google Sheets에서 확인: <a href='https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}'>열기</a></p>`,
        });
      }
    } catch (adminErr) {
      console.error("관리자 알림 발송 실패:", adminErr);
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (err) {
    console.error("주문 생성 오류:", err);
    return NextResponse.json({ error: "주문 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
