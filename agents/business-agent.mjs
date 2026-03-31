// 비즈니스 의사결정 에이전트 — 수익화 + 파트너십 + KPI
// 운영과 분리: 이 에이전트는 "뭘 할지" 결정, 운영 에이전트는 "실행"

export function generateReport() {
  const today = new Date().toISOString().split("T")[0];

  const report = {
    agent: "비즈니스",
    date: today,
    currentStatus: {
      매출: "0원",
      비용: "0원 (도메인 연간 ~2만원 제외)",
      수익모델: "미구현 (Phase 1 — 트래픽 확보 중)",
    },
    ideas: [],
    kpi: {
      weekly: {
        블로그_발행수: { target: 7, unit: "개/주" },
        지식인_답변수: { target: 5, unit: "개/주" },
        사이트_방문자: { target: 100, unit: "명/주" },
      },
      monthly: {
        검색_노출수: { target: 1000, unit: "회/월" },
        상담_문의: { target: 0, unit: "건/월", note: "Phase 2에서 시작" },
      },
    },
    requests: [],
  };

  report.ideas = [
    {
      id: "biz-001",
      title: "세무사 매칭 수익 모델 설계",
      description: "세무사에게 월 구독료(10~30만원) 또는 건당 수수료(5~10만원). 초기에는 무료로 연결해서 사례 만들고, 이후 과금.",
      priority: "medium",
      effort: "low",
      expectedImpact: "수익화 로드맵 확정",
    },
    {
      id: "biz-002",
      title: "장례식장 B2B 파일럿",
      description: "근처 장례식장 3곳에 직접 방문. sahu.kr QR코드 안내문 무료 제공 제안. 유가족 반응 데이터 수집.",
      priority: "medium",
      effort: "medium",
      expectedImpact: "B2B 채널 검증",
    },
    {
      id: "biz-003",
      title: "예비창업패키지/초기창업패키지 지원",
      description: "중기부 창업지원사업 신청. 사회문제 해결형으로 분류 가능. 최대 1억원 지원.",
      priority: "low",
      effort: "high",
      expectedImpact: "자금 확보 + 신뢰도",
    },
  ];

  // 완료: 상담 폼 자체 구현 완료 (플로팅 버튼 + Google Sheets 연동)
  report.requests = [
    { to: "리서치", request: "세무사 상속세 신고 수수료 시장 가격 조사" },
  ];

  return report;
}

if (process.argv[1]?.includes("business-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
