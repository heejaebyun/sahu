import { NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { AgreementDocument } from "@/lib/agreement-pdf";

// 서버사이드 RRN Mod-11 검증
function validateRRN(rrn) {
  const cleaned = (rrn || "").replace(/-/g, "");
  if (!/^\d{13}$/.test(cleaned)) return false;
  const digits = cleaned.split("").map(Number);
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += digits[i] * weights[i];
  return (11 - (sum % 11)) % 10 === digits[12];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { deceased, heirs, assets, document: docInfo, isPreview } = body;

    // 필수 데이터 검증
    if (!deceased?.name?.trim()) {
      return NextResponse.json({ error: "고인 성명이 누락되었습니다." }, { status: 400 });
    }
    if (!deceased?.rrn?.trim() || !validateRRN(deceased.rrn)) {
      return NextResponse.json({ error: "고인 주민등록번호가 유효하지 않습니다." }, { status: 400 });
    }
    if (!deceased?.date_of_death) {
      return NextResponse.json({ error: "사망일이 누락되었습니다." }, { status: 400 });
    }
    if (!deceased?.last_resident_address?.trim()) {
      return NextResponse.json({ error: "최후 주소가 누락되었습니다." }, { status: 400 });
    }
    if (!heirs || heirs.length === 0) {
      return NextResponse.json({ error: "상속인 정보가 누락되었습니다." }, { status: 400 });
    }
    if (heirs.length > 5) {
      return NextResponse.json({ error: "상속인은 최대 5명까지 입력 가능합니다." }, { status: 400 });
    }
    if (!assets || assets.length === 0) {
      return NextResponse.json({ error: "재산 정보가 누락되었습니다." }, { status: 400 });
    }
    if (assets.length > 5) {
      return NextResponse.json({ error: "재산은 최대 5개까지 입력 가능합니다." }, { status: 400 });
    }

    // 상속인 RRN 서버 검증
    for (let i = 0; i < heirs.length; i++) {
      if (!heirs[i].name?.trim()) {
        return NextResponse.json({ error: `상속인 ${i + 1}번의 성명이 누락되었습니다.` }, { status: 400 });
      }
      if (!validateRRN(heirs[i].rrn)) {
        return NextResponse.json({ error: `상속인 ${i + 1}번(${heirs[i].name})의 주민등록번호가 유효하지 않습니다.` }, { status: 400 });
      }
    }

    // 재산-상속인 매핑 검증
    const heirIds = new Set(heirs.map((h) => h.id));
    for (let i = 0; i < assets.length; i++) {
      if (!assets[i].assignedHeirId || !heirIds.has(assets[i].assignedHeirId)) {
        return NextResponse.json({ error: `재산 ${i + 1}번의 상속인 지정이 올바르지 않습니다.` }, { status: 400 });
      }
    }

    // PDF 생성 (isPreview=true면 워터마크+마스킹)
    const pdfStream = await ReactPDF.renderToStream(
      AgreementDocument({ data: body, isPreview: isPreview !== false })
    );

    const chunks = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // 민감정보 참조 해제
    body.deceased = null;
    body.heirs = null;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=agreement_${isPreview ? "preview" : "final"}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF 생성 오류:", err);
    return NextResponse.json(
      { error: "문서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
