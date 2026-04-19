import { NextResponse } from "next/server";

// Google Sheets integration removed. Service paused.
export async function GET() {
  return NextResponse.json({ error: "서비스가 일시 중단되었습니다." }, { status: 503 });
}
export async function POST() {
  return NextResponse.json({ error: "서비스가 일시 중단되었습니다." }, { status: 503 });
}
