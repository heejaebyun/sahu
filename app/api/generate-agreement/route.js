import { NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { AgreementDocument } from "@/lib/agreement-pdf";

export async function POST(request) {
  try {
    const data = await request.json();

    // 기본 검증
    if (!data.deceased?.name || !data.heirs?.length || !data.assets?.length) {
      return NextResponse.json({ error: "필수 데이터가 누락되었습니다." }, { status: 400 });
    }

    // PDF 생성
    const pdfStream = await ReactPDF.renderToStream(
      AgreementDocument({ data })
    );

    // Stream → Buffer
    const chunks = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=agreement.pdf",
      },
    });
  } catch (err) {
    console.error("PDF 생성 오류:", err);
    return NextResponse.json({ error: "문서 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
