import { google } from "googleapis";
import { NextResponse } from "next/server";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("id");

    if (!shareId) {
      return NextResponse.json({ error: "공유 ID가 필요합니다." }, { status: 400 });
    }

    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "공유!A:D",
    });

    const rows = res.data.values || [];
    let found = null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === shareId) {
        found = rows[i];
        break;
      }
    }

    if (!found) {
      return NextResponse.json({ error: "공유 링크를 찾을 수 없습니다. 만료되었거나 올바르지 않은 링크입니다." }, { status: 404 });
    }

    // 만료 체크
    const expiresAt = new Date(found[2]);
    if (Date.now() > expiresAt.getTime()) {
      return NextResponse.json({ error: "공유 링크가 만료되었습니다. (30일)" }, { status: 410 });
    }

    const data = JSON.parse(found[3]);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("공유 조회 오류:", err);
    return NextResponse.json({ error: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}
