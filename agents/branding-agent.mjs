// 브랜딩 에이전트 — 브랜드 아이덴티티, UX, 톤앤매너, 랜딩 전략
// 매일 회의에서 브랜딩/UX 관점 아이디어 제출

export function generateReport() {
  const today = new Date().toISOString().split("T")[0];

  const report = {
    agent: "브랜딩",
    date: today,
    currentStatus: {
      브랜드명: "사후 (SAHU)",
      도메인: "sahu.kr",
      톤: "다크 테마, 절제된 UI, 정보 중심",
      랜딩: "사망일 입력 → 체크리스트 직행 (별도 랜딩 없음)",
      로고: "S 아이콘 (텍스트 기반)",
      슬로건: "사망 후 행정 처리 가이드",
      브랜드_인지도: "0 (신규 서비스)",
    },
    ideas: [],
    requests: [],
  };

  report.ideas = [
    {
      id: "brand-001",
      title: "서비스 신뢰도 구축 요소 점검",
      description: "사후 행정은 민감한 주제. 유저가 첫 진입 시 '이 서비스를 믿어도 되는가'를 판단하는 데 3초. 현재 신뢰 요소(정부 서비스 연결, 데이터 로컬 저장 안내 등) 배치 점검.",
      priority: "high",
      effort: "low",
    },
    {
      id: "brand-002",
      title: "톤앤매너 가이드라인 수립",
      description: "유가족 대상 서비스이므로 톤이 핵심. 너무 사무적이면 차갑고, 너무 감성적이면 불신. 정보 전달 + 차분한 공감 사이의 톤 기준 정의.",
      priority: "medium",
      effort: "low",
    },
  ];

  report.requests = [];

  return report;
}

if (process.argv[1]?.includes("branding-agent")) {
  const report = generateReport();
  console.log(JSON.stringify(report, null, 2));
}
