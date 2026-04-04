// 생전 정리 (인생정리) 체크리스트 데이터

export const LIFE_CATEGORIES = [
  { id: "digital", label: "디지털 계정", color: "#10b981", icon: "📱" },
  { id: "finance", label: "금융·보험", color: "#3b82f6", icon: "💰" },
  { id: "documents", label: "중요 서류·문서", color: "#8b5cf6", icon: "📄" },
  { id: "property", label: "부동산·자산", color: "#f59e0b", icon: "🏠" },
  { id: "wishes", label: "마음 전하기", color: "#ec4899", icon: "💌" },
];

export const LIFE_CHECKLIST = [
  // ── 디지털 계정 ──
  {
    id: "email-accounts",
    category: "digital",
    title: "이메일 계정",
    description: "사용 중인 이메일 계정을 정리합니다.",
    fields: [
      { key: "provider", label: "서비스", placeholder: "Gmail / 네이버 / 다음 등" },
      { key: "account", label: "계정 (이메일 주소)", placeholder: "example@gmail.com" },
      { key: "action", label: "사후 처리", type: "select", options: ["삭제", "유지", "특정인에게 이전"] },
      { key: "note", label: "메모", placeholder: "중요한 메일이 있다면 기록" },
    ],
  },
  {
    id: "sns-accounts",
    category: "digital",
    title: "SNS 계정",
    description: "카카오톡, 인스타그램, 페이스북 등 SNS를 정리합니다.",
    fields: [
      { key: "provider", label: "서비스", placeholder: "카카오톡 / 인스타그램 / 페이스북 등" },
      { key: "account", label: "계정 ID", placeholder: "@username" },
      { key: "action", label: "사후 처리", type: "select", options: ["삭제", "추모 계정 전환", "유지"] },
      { key: "note", label: "메모", placeholder: "" },
    ],
  },
  {
    id: "cloud-storage",
    category: "digital",
    title: "클라우드 저장소",
    description: "구글 드라이브, 아이클라우드, 네이버 클라우드 등을 정리합니다.",
    fields: [
      { key: "provider", label: "서비스", placeholder: "구글 드라이브 / iCloud / 네이버 등" },
      { key: "account", label: "계정", placeholder: "" },
      { key: "action", label: "사후 처리", type: "select", options: ["삭제", "특정인에게 이전", "유지"] },
      { key: "note", label: "중요 파일", placeholder: "가족 사진 폴더, 업무 문서 등" },
    ],
  },
  {
    id: "subscriptions",
    category: "digital",
    title: "구독 서비스",
    description: "넷플릭스, 유튜브 프리미엄, 멜론 등 정기 결제를 정리합니다.",
    fields: [
      { key: "provider", label: "서비스명", placeholder: "넷플릭스 / 유튜브 / 멜론 등" },
      { key: "payment", label: "결제 수단", placeholder: "OO카드 / 계좌이체" },
      { key: "action", label: "사후 처리", type: "select", options: ["즉시 해지", "가족이 계속 사용", "결제일에 해지"] },
      { key: "note", label: "메모", placeholder: "가족 공유 중이면 기록" },
    ],
  },
  {
    id: "phone-device",
    category: "digital",
    title: "스마트폰·기기",
    description: "스마트폰 잠금 해제 방법과 중요 앱을 정리합니다.",
    fields: [
      { key: "device", label: "기기", placeholder: "아이폰 / 갤럭시 / 태블릿 등" },
      { key: "unlock", label: "잠금 해제 방법", placeholder: "비밀번호 / 패턴 / 지문" },
      { key: "important_apps", label: "중요 앱", placeholder: "은행, 보험, 인증서 앱 등" },
      { key: "note", label: "메모", placeholder: "" },
    ],
  },

  // ── 금융·보험 ──
  {
    id: "bank-accounts-life",
    category: "finance",
    title: "은행 계좌",
    description: "보유 중인 은행 계좌를 정리합니다.",
    fields: [
      { key: "bank", label: "은행명", placeholder: "국민은행 / 신한은행 등" },
      { key: "account_number", label: "계좌번호", placeholder: "" },
      { key: "type", label: "종류", placeholder: "예금 / 적금 / CMA 등" },
      { key: "auto_transfer", label: "자동이체 여부", placeholder: "공과금, 보험료 등" },
      { key: "note", label: "메모", placeholder: "" },
    ],
  },
  {
    id: "insurance-life",
    category: "finance",
    title: "보험",
    description: "가입 중인 보험을 정리합니다.",
    fields: [
      { key: "company", label: "보험사", placeholder: "삼성생명 / 한화생명 등" },
      { key: "product", label: "상품명", placeholder: "" },
      { key: "number", label: "증권번호", placeholder: "" },
      { key: "beneficiary", label: "수익자", placeholder: "" },
      { key: "note", label: "메모", placeholder: "보험설계사 연락처 등" },
    ],
  },
  {
    id: "stocks-investments",
    category: "finance",
    title: "주식·투자",
    description: "증권 계좌, 코인, 펀드 등을 정리합니다.",
    fields: [
      { key: "company", label: "증권사/거래소", placeholder: "키움 / 삼성 / 업비트 등" },
      { key: "account", label: "계좌번호", placeholder: "" },
      { key: "note", label: "메모", placeholder: "주요 보유 종목, 대략적 규모" },
    ],
  },

  // ── 중요 서류·문서 ──
  {
    id: "important-docs",
    category: "documents",
    title: "중요 서류 보관 위치",
    description: "등기권리증, 인감, 보험증권 등의 위치를 기록합니다.",
    fields: [
      { key: "document", label: "서류명", placeholder: "등기권리증 / 인감도장 / 보험증권 등" },
      { key: "location", label: "보관 위치", placeholder: "안방 서랍장 2번째 칸 / 금고 등" },
      { key: "note", label: "메모", placeholder: "" },
    ],
  },
  {
    id: "contracts",
    category: "documents",
    title: "계약서·증서",
    description: "전세/월세 계약서, 상조 계약서 등을 정리합니다.",
    fields: [
      { key: "type", label: "계약 종류", placeholder: "전세 계약 / 상조 계약 / 대출 등" },
      { key: "company", label: "상대방/회사", placeholder: "" },
      { key: "location", label: "원본 위치", placeholder: "" },
      { key: "note", label: "메모", placeholder: "만료일, 특약 등" },
    ],
  },

  // ── 부동산·자산 ──
  {
    id: "real-estate-life",
    category: "property",
    title: "부동산",
    description: "소유 부동산을 정리합니다.",
    fields: [
      { key: "type", label: "유형", placeholder: "아파트 / 단독주택 / 토지 등" },
      { key: "address", label: "주소", placeholder: "" },
      { key: "ownership", label: "소유 형태", placeholder: "단독 / 공동 (지분율)" },
      { key: "note", label: "메모", placeholder: "대출 잔액, 임대 현황 등" },
    ],
  },
  {
    id: "vehicle-life",
    category: "property",
    title: "자동차",
    description: "소유 차량을 정리합니다.",
    fields: [
      { key: "model", label: "차종", placeholder: "제네시스 G90 등" },
      { key: "plate", label: "차량번호", placeholder: "123가 4567" },
      { key: "note", label: "메모", placeholder: "리스/할부 여부, 보험사" },
    ],
  },

  // ── 마음 전하기 ──
  {
    id: "funeral-wishes",
    category: "wishes",
    title: "장례 희망 사항",
    description: "장례 방식, 안치 장소 등 희망 사항을 기록합니다.",
    fields: [
      { key: "method", label: "장례 방식", type: "select", options: ["화장", "매장", "가족이 결정"] },
      { key: "location", label: "안치 희망 장소", placeholder: "OO공원묘지 / 가족이 결정" },
      { key: "sangjo", label: "상조 회사", placeholder: "가입한 상조 회사 (있다면)" },
      { key: "note", label: "기타 희망 사항", placeholder: "" },
    ],
  },
  {
    id: "family-message",
    category: "wishes",
    title: "가족에게 전하는 말",
    description: "가족에게 남기고 싶은 말을 적어둡니다.",
    fields: [
      { key: "message", label: "전하고 싶은 말", type: "textarea", placeholder: "가족에게 남기고 싶은 말을 자유롭게 적어주세요." },
    ],
  },
  {
    id: "organ-donation",
    category: "wishes",
    title: "장기 기증·헌혈 의사",
    description: "장기 기증이나 시신 기증 의사를 기록합니다.",
    fields: [
      { key: "decision", label: "의사", type: "select", options: ["희망", "희망하지 않음", "가족이 결정"] },
      { key: "registered", label: "기증 등록 여부", type: "select", options: ["등록함", "미등록"] },
      { key: "note", label: "메모", placeholder: "" },
    ],
  },
];
