import { google } from "googleapis";
import { NextResponse } from "next/server";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

export async function POST(request) {
  try {
    const { page, rating, utm } = await request.json();

    if (!page || !rating) {
      return NextResponse.json({ error: "필수 데이터 누락" }, { status: 400 });
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

    // "피드백" 시트 확인/생성
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const feedbackSheet = spreadsheet.data.sheets.find((s) => s.properties.title === "피드백");
    if (!feedbackSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "피드백" } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "피드백!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["일시", "페이지", "평가", "UTM_source", "UTM_medium", "UTM_campaign"]],
        },
      });
    }

    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "피드백!A:F",
      valueInputOption: "RAW",
      requestBody: {
        values: [[now, page, rating, utm?.source || "", utm?.medium || "", utm?.campaign || ""]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("피드백 저장 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
