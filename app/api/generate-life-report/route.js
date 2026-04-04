import { NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { LifeReportDocument } from "@/lib/life-report-pdf";

export async function POST(request) {
  try {
    const { entries, familyMembers } = await request.json();

    if (!entries || Object.keys(entries).length === 0) {
      return NextResponse.json({ error: "정리된 항목이 없습니다." }, { status: 400 });
    }

    const pdfStream = await ReactPDF.renderToStream(
      LifeReportDocument({ entries, familyMembers: familyMembers || [] })
    );

    const chunks = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=life-report.pdf",
      },
    });
  } catch (err) {
    console.error("인생정리 PDF 생성 오류:", err);
    return NextResponse.json({ error: "PDF 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
