// 네이버 지식인 크롤링 → CSV 출력
// Usage: node scripts/crawl-kin.mjs

const KEYWORDS = [
  "사망 후 해야할 일",
  "사망신고 방법",
  "상속포기 방법",
  "상속포기 기한",
  "안심상속 원스톱",
  "사망 후 은행 계좌",
  "사망 후 보험",
  "사망 후 통신 해지",
  "사망 후 구독 해지",
  "상속세 신고",
  "사망진단서 발급",
  "유족연금 신청",
];

const ANSWER_TEMPLATES = {
  "사망": `안녕하세요. 사망 후 행정 절차가 복잡하고 막막하실 텐데, 단계별로 정리된 가이드가 있어 공유드립니다.\n\n사망신고 → 안심상속 조회 → 은행/보험 정리 → 상속 결정 → 세금 신고 순서로 진행하시면 됩니다.\n\n각 절차별 기한, 필요 서류, 방문처가 정리된 체크리스트입니다:\nhttps://sahu.kr\n\n기한을 놓치면 과태료나 가산세가 발생할 수 있으니 꼭 확인해보세요.`,
  "사망신고": `사망신고는 사망사실을 안 날부터 1개월 이내에 주민센터에서 하시면 됩니다.\n\n필요 서류: 사망진단서 1통 + 신고인 신분증\n신고 장소: 사망지/신고인 주소지/고인 주소지 주민센터 중 택1\n\n사망신고와 함께 '안심상속 원스톱서비스'도 바로 신청하세요. 고인의 재산/채무를 한번에 조회할 수 있습니다.\n\n상세 절차: https://sahu.kr/guides/death-report`,
  "상속포기": `상속포기는 상속개시 있음을 안 날부터 3개월 이내에 가정법원에 신청해야 합니다.\n\n기한이 지나면 단순승인(모든 빚 포함 상속)으로 간주되니 주의하세요.\n\n필요 서류: 심판청구서, 사망진단서, 가족관계증명서, 기본증명서, 주민등록등본\n\n상속포기 vs 한정승인 비교와 절차 안내: https://sahu.kr/guides/inheritance-renounce`,
  "안심상속": `안심상속 원스톱서비스는 주민센터 또는 정부24에서 신청 가능합니다.\n\n고인의 금융(예금/대출/보험), 부동산, 자동차, 세금, 연금을 한번에 조회할 수 있습니다.\n\n기한: 사망일이 속한 달의 말일부터 1년 이내\n결과: 항목별로 7일~20일 소요\n\n사망신고하면서 바로 신청하는 게 가장 좋습니다.\n\n상세 안내: https://sahu.kr/guides/safe-inheritance`,
  "은행": `고인의 은행 계좌 정리는 안심상속 원스톱서비스 결과를 받은 후 진행하는 것이 효율적입니다.\n\n필요 서류: 사망진단서, 가족관계증명서, 상속인 전원 인감증명서, 상속협의서\n\n⚠️ 상속 절차 없이 인출하면 형사 처벌 대상이 될 수 있습니다.\n\n상세 절차: https://sahu.kr/guides/bank-accounts`,
  "보험": `고인의 보험 조회는 '내보험찾아줌(cont.insure.or.kr)'에서 생명/손해보험 통합 조회가 가능합니다.\n\n단, 망인 조회는 안심상속 원스톱서비스 접수가 선행되어야 합니다.\n\n보험금 청구는 각 보험사에 직접 해야 하며, 시효는 3년입니다.\n\n전체 절차 체크리스트: https://sahu.kr`,
  "통신": `고인의 통신 서비스 해지는 각 통신사 대리점 또는 고객센터에서 가능합니다.\n\n필요 서류: 사망진단서, 가족관계증명서, 신청인 신분증\n\n사망 사유 해지 시 위약금 면제 약관이 있으나, 결합상품 등 예외가 있을 수 있으니 확인하세요.\n\n구독/계정 해지 가이드: https://sahu.kr/subscriptions`,
  "구독": `고인의 구독 서비스 정리는 카드 명세서와 휴대폰 앱 목록을 확인하면 파악할 수 있습니다.\n\n통신, 넷플릭스, 유튜브, 쿠팡, 멜론 등 주요 서비스별 해지 방법과 연락처가 정리된 가이드입니다:\nhttps://sahu.kr/subscriptions`,
  "상속세": `상속세는 사망일이 속한 달의 말일부터 6개월 이내에 관할 세무서에 신고·납부해야 합니다.\n\n기한 내 신고 시 3% 세액공제, 미신고 시 20~40% 가산세가 부과됩니다.\n\n90% 이상이 세무사에게 위임합니다. 전문가 상담을 추천합니다.\n\n전체 절차 체크리스트: https://sahu.kr`,
  "사망진단서": `사망진단서는 사망한 병원에서 발급받습니다.\n\n최소 10통 이상 발급받으세요. 은행, 보험사, 관공서마다 원본을 요구합니다.\n\n재발급은 병원에서 가능하며, 1통당 1,000~2,000원 수준입니다.\n\n사망진단서 발급 후 해야 할 절차: https://sahu.kr/guides/death-report`,
  "유족연금": `유족연금은 국민연금공단 지사 또는 온라인(nps.or.kr)에서 신청 가능합니다.\n\n필요 서류: 사망진단서, 가족관계증명서, 신청인 신분증, 통장 사본\n\n소멸시효는 5년이지만, 생활자금 공백 방지를 위해 빨리 신청하세요.\n\n전체 사망 후 절차: https://sahu.kr`,
};

function getTemplate(keyword) {
  for (const [key, template] of Object.entries(ANSWER_TEMPLATES)) {
    if (keyword.includes(key)) return template;
  }
  return ANSWER_TEMPLATES["사망"];
}

async function fetchQuestions(keyword) {
  const encoded = encodeURIComponent(keyword);
  const url = `https://kin.naver.com/search/list.naver?query=${encoded}&period=1m&section=kin`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9",
    },
  });

  const html = await res.text();

  // Extract question titles and links
  const results = [];
  const regex = /<a[^>]*class="[^"]*_nclicks\(kin\.txt\)[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const link = match[1].replace(/&amp;/g, "&");
    const title = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (title && link.includes("kin.naver.com")) {
      results.push({ keyword, title, link });
    }
  }

  // Fallback: try different pattern
  if (results.length === 0) {
    const regex2 = /href="(https?:\/\/kin\.naver\.com\/qna\/detail\.naver[^"]+)"[^>]*>([^<]+)/g;
    while ((match = regex2.exec(html)) !== null) {
      const link = match[1].replace(/&amp;/g, "&");
      const title = match[2].replace(/\s+/g, " ").trim();
      if (title) {
        results.push({ keyword, title, link });
      }
    }
  }

  // Fallback 2: broader pattern
  if (results.length === 0) {
    const regex3 = /"(https?:\/\/kin\.naver\.com\/qna\/detail\.naver\?d1id=\d+&dirId=\d+&docId=\d+[^"]*)"/g;
    const titles3 = [];
    const titleRegex = /class="[^"]*"[^>]*>((?:(?!<\/a>).)*사망(?:(?!<\/a>).)*)<\/a>/g;

    while ((match = regex3.exec(html)) !== null) {
      const link = match[1].replace(/&amp;/g, "&");
      results.push({ keyword, title: `[${keyword}] 관련 질문`, link });
    }
  }

  return results;
}

async function main() {
  console.log("네이버 지식인 크롤링 시작...\n");

  const allResults = [];

  for (const keyword of KEYWORDS) {
    try {
      const questions = await fetchQuestions(keyword);
      console.log(`[${keyword}] ${questions.length}개 질문 발견`);
      allResults.push(...questions);
      // Rate limit
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`[${keyword}] 에러: ${err.message}`);
    }
  }

  // Deduplicate by link
  const seen = new Set();
  const unique = allResults.filter(r => {
    if (seen.has(r.link)) return false;
    seen.add(r.link);
    return true;
  });

  console.log(`\n총 ${unique.length}개 고유 질문 발견\n`);

  // Generate CSV
  const csvHeader = "키워드\t질문\t링크\t답변 템플릿";
  const csvRows = unique.map(r => {
    const template = getTemplate(r.keyword).replace(/\n/g, "\\n").replace(/\t/g, " ");
    return `${r.keyword}\t${r.title}\t${r.link}\t${template}`;
  });

  const csv = [csvHeader, ...csvRows].join("\n");

  const fs = await import("fs");
  const outPath = "/Users/byunheejae/Desktop/sahu/scripts/kin-questions.tsv";
  fs.writeFileSync(outPath, csv, "utf-8");
  console.log(`TSV 저장: ${outPath}`);
  console.log(`구글 스프레드시트에 붙여넣기 가능 (탭 구분)\n`);

  // Also print for review
  unique.slice(0, 5).forEach(r => {
    console.log(`---`);
    console.log(`Q: ${r.title}`);
    console.log(`L: ${r.link}`);
    console.log(`K: ${r.keyword}`);
  });
}

main().catch(console.error);
