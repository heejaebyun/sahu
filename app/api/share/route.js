import { google } from "googleapis";
import { NextResponse } from "next/server";
import crypto from "crypto";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

export async function POST(request) {
  try {
    const { entries, familyMembers } = await request.json();

    if (!entries || Object.keys(entries).length === 0) {
      return NextResponse.json({ error: "공유할 데이터가 없습니다." }, { status: 400 });
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

    // "공유" 시트 확인/생성
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const shareSheet = spreadsheet.data.sheets.find((s) => s.properties.title === "공유");
    if (!shareSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "공유" } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "공유!A1:D1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["공유ID", "생성일시", "만료일시", "데이터"]],
        },
      });
    }

    const shareId = crypto.randomUUID().slice(0, 12);
    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30일

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "공유!A:D",
      valueInputOption: "RAW",
      requestBody: {
        values: [[shareId, now, expiresAt, JSON.stringify({ entries, familyMembers })]],
      },
    });

    return NextResponse.json({ success: true, shareId });
  } catch (err) {
    console.error("공유 링크 생성 오류:", err);
    return NextResponse.json({ error: "공유 링크 생성 실패" }, { status: 500 });
  }
}
