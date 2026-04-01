import { NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { AgreementDocument } from "@/lib/agreement-pdf";
import { sendPDFDownloadLink } from "@/lib/email";
import crypto from "crypto";

export async function POST(request) {
  try {
    // 1. Bearer 인증
    const authHeader = request.headers.get("authorization");
    const secret = process.env.SAHU_ADMIN_SECRET;

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Apps Script가 보낸 데이터 직접 수신 (Sheets 재조회 안 함)
    const body = await request.json();
    const { email, data, orderNumber } = body;

    if (!email || !data) {
      return NextResponse.json({ error: "Bad Request: email 또는 data 누락" }, { status: 400 });
    }

    // 3. 다운로드 토큰 생성
    const downloadToken = crypto.randomUUID();

    // 4. 원본 PDF 생성 (isPreview: false → 워터마크 없음)
    const today = new Date();
    const agreementDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    const pdfStream = await ReactPDF.renderToStream(
      AgreementDocument({
        data: { ...data, document: { agreement_date: agreementDate } },
        isPreview: false,
      })
    );

    const chunks = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }

    // 5. 이메일로 다운로드 링크 발송
    const deceasedName = data.deceased?.name || "고인";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sahu.kr";
    const downloadUrl = `${baseUrl}/api/download/${downloadToken}`;

    await sendPDFDownloadLink({
      to: email,
      orderNumber: orderNumber || "",
      downloadUrl,
      deceasedName,
    });

    // 6. 성공 응답 (Apps Script가 이 응답으로 시트 상태를 '발송완료'로 변경)
    return NextResponse.json({
      success: true,
      message: "PDF generated and sent",
      downloadToken,
    });
  } catch (err) {
    console.error("Order Confirm API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
