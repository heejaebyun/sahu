// 전략 에이전트 — 시장 분석 + 방향 제안
// 매일 오전 회의에서 전략 관점 아이디어 제출

export function generateReport() {
  const today = new Date().toISOString().split("T")[0];

  const report = {
    agent: "전략",
    date: today,
    currentStatus: {
      phase: "Phase 1 — 트래픽 확보",
      목표: "월 5,000 방문자 달성",
      현재: "SEO 인덱싱 대기 + 콘텐츠 발행 시작",
      runway: "비용 0원 (무료 도구만 사용 중)",
    },
    ideas: [],
    requests: [],
  };

  report.ideas = [
    {
      id: "str-001",
      title: "Phase 1→2 전환 기준 명확화",
      description: "Phase 1(트래픽) → Phase 2(수익화) 전환 기준: 월 방문자 3,000명 OR 상담 문의 주 5건. 둘 중 하나 달성 시 세무사 매칭 시작.",
      priority: "high",
      effort: "low",
      expectedImpact: "명확한 마일스톤 → 의사결정 속도 향상",
    },
    {
      id: "str-002",
      title: "경쟁 우위 강화 — 기한 자동 계산",
      description: "블로그/지식인 답변에서 sahu.kr의 핵심 차별점은 '사망일 입력 → 기한 자동 계산'. 모든 콘텐츠에서 이 기능을 강조.",
      priority: "high",
      effort: "low",
      expectedImpact: "전환율 향상 (방문 → 서비스 사용)",
    },
    {
      id: "str-003",
      title: "B2B 타겟 탐색 — 장례식장",
      description: "장례식장에서 유가족에게 사후 행정 가이드 전달. 장례식장 입장에서는 고객 서비스 향상. QR코드가 포함된 안내문 제작 → 장례식장에 무료 배포.",
      priority: "medium",
      effort: "medium",
      expectedImpact: "B2B 채널 확보 + 안정적 유입",
    },
    {
      id: "str-004",
      title: "데이터 자산 구축",
      description: "지식인 크롤링 데이터가 쌓이면 '사망 후 행정 관련 FAQ' 데이터셋이 됨. 이 데이터로 AI 챗봇(사후 행정 전문) 구축 가능.",
      priority: "low",
      effort: "high",
      expectedImpact: "장기 경쟁 우위 + 제품 확장",
    },
  ];

  report.requests = [
    { to: "리서치", request: "한국 장례식장 수 + 주요 프랜차이즈 장례식장 목록 조사" },
    { to: "마케팅", request: "현재 콘텐츠에서 '기한 자동 계산' 기능 언급 비율 확인" },
  ];

  return report;
}

if (process.argv[1]?.includes("strategy-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
