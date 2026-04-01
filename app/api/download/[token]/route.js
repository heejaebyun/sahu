import { google } from "googleapis";
import { NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { AgreementDocument } from "@/lib/agreement-pdf";

const SPREADSHEET_ID = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "토큰이 필요합니다." }, { status: 400 });
    }

    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // 토큰으로 주문 찾기
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "주문!A:L",
    });

    const rows = res.data.values || [];
    let rowIndex = -1;
    let orderRow = null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][9] === token) { // J열: 다운로드토큰
        rowIndex = i;
        orderRow = rows[i];
        break;
      }
    }

    if (!orderRow) {
      return new Response("<h1>유효하지 않은 링크입니다.</h1><p>링크가 만료되었거나 올바르지 않습니다. sahu.kr@gmail.com으로 문의해 주세요.</p>", {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // 만료 체크
    const expiresAt = new Date(orderRow[10]); // K열
    if (Date.now() > expiresAt.getTime()) {
      return new Response("<h1>다운로드 링크가 만료되었습니다.</h1><p>72시간이 경과했습니다. sahu.kr@gmail.com으로 재발급을 요청해 주세요.</p>", {
        status: 410,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // 다운로드 횟수 체크
    const downloadCount = parseInt(orderRow[11] || "0", 10); // L열
    if (downloadCount >= 3) {
      return new Response("<h1>다운로드 횟수를 초과했습니다.</h1><p>최대 3회 다운로드 가능합니다. sahu.kr@gmail.com으로 문의해 주세요.</p>", {
        status: 429,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // 상태 체크
    const status = orderRow[2]; // C열
    if (status !== "발송완료" && status !== "입금확인") {
      return new Response("<h1>아직 결제가 확인되지 않았습니다.</h1><p>입금 확인 후 다운로드가 가능합니다.</p>", {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // 원본 PDF 생성 (isPreview: false → 워터마크 없음, RRN 마스킹 없음)
    const formData = JSON.parse(orderRow[7]); // H열: JSON_Payload
    const today = new Date();
    const agreementDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    const pdfStream = await ReactPDF.renderToStream(
      AgreementDocument({ data: { ...formData, document: { agreement_date: agreementDate } }, isPreview: false })
    );

    const chunks = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // 다운로드 횟수 증가
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `주문!L${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [[String(downloadCount + 1)]] },
    });

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=agreement_${orderRow[0]}.pdf`,
      },
    });
  } catch (err) {
    console.error("다운로드 오류:", err);
    return new Response("<h1>오류가 발생했습니다.</h1><p>잠시 후 다시 시도해 주세요. sahu.kr@gmail.com</p>", {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
