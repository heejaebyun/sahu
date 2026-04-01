import { google } from "googleapis";
import { NextResponse } from "next/server";
import { sendRefundConfirmation } from "@/lib/email";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.SAHU_ADMIN_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderNumber } = await request.json();

    if (!orderNumber) {
      return NextResponse.json({ error: "주문번호가 필요합니다." }, { status: 400 });
    }

    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "주문!A:I",
    });

    const rows = res.data.values || [];
    let rowIndex = -1;
    let email = "";

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === orderNumber) {
        rowIndex = i;
        email = rows[i][6];
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    // 상태 변경
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `주문!C${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [["환불완료"]] },
    });

    // 환불 확인 이메일
    if (email) {
      try {
        await sendRefundConfirmation({ to: email, orderNumber });
      } catch (emailErr) {
        console.error("환불 이메일 발송 실패:", emailErr);
      }
    }

    return NextResponse.json({ success: true, message: "환불이 처리되었습니다." });
  } catch (err) {
    console.error("환불 처리 오류:", err);
    return NextResponse.json({ error: "환불 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
