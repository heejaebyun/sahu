import { google } from "googleapis";
import { NextResponse } from "next/server";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, deathDate, needs, detail } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
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

    // "상담신청" 시트 확인/생성
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const consultSheet = spreadsheet.data.sheets.find(s => s.properties.title === "상담신청");
    if (!consultSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "상담신청" } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "상담신청!A1:H1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["신청일시", "이름", "연락처", "사망일", "필요서비스", "상세내용", "상태", "운영팀메모"]],
        },
      });
    }

    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "상담신청!A:H",
      valueInputOption: "RAW",
      requestBody: {
        values: [[now, name, phone, deathDate || "", needs || "", detail || "", "신규", ""]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("상담신청 에러:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
