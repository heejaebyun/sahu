export const metadata = {
  title: "안심상속 원스톱서비스 신청 방법 (2026) — 기한, 조회항목, 결과확인",
  description:
    "안심상속 원스톱서비스는 고인의 금융·부동산·세금·연금을 한번에 조회하는 서비스입니다. 신청 기한, 방법, 조회 항목, 결과 확인까지 정리했습니다.",
};

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 12,
          color: "#e0e0e8",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SafeInheritancePage() {
  return (
    <>
      <nav className="sahu-nav">
        <div className="sahu-nav-inner">
          <a href="/landing" className="sahu-logo">SAHU</a>
          <div className="sahu-nav-links">
            <a href="/life">생전 정리</a>
            <a href="/" className="active">사후 행정</a>
            <a href="/agreement">분할협의서</a>
          </div>
        </div>
      </nav>
      <main
        data-theme="dark"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        paddingTop: 96,
        padding: "96px 20px 80px",
        background: "var(--bg)",
        color: "var(--text-secondary)",
        minHeight: "100vh",
        fontSize: 15,
        lineHeight: 1.8,
      }}
    >
      <a
        href="/guides"
        style={{
          fontSize: 13,
          color: "#555566",
          display: "block",
          marginBottom: 24,
        }}
      >
        ← 가이드 목록
      </a>

      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          color: "#e0e0e8",
        }}
      >
        안심상속 원스톱서비스 신청 방법
      </h1>
      <p style={{ fontSize: 14, color: "#8888a0", marginBottom: 32 }}>
        2026년 기준 · 마지막 업데이트: 2026년 3월
      </p>

      <Section title="안심상속 원스톱서비스란?">
        <p>
          고인이 남긴 금융자산(예금, 대출, 보험), 부동산, 자동차, 세금(국세·지방세),
          연금, 공제회 등의 가입·보유 내역을 한 번의 신청으로 통합 조회하는
          정부 서비스입니다.
        </p>
        <p>
          이 서비스를 이용하면 여러 기관을 일일이 방문하지 않아도 고인의 재산과
          채무를 파악할 수 있습니다. 숨은 보험, 모르던 예금, 대출 등을 확인하는
          핵심 절차입니다.
        </p>
      </Section>

      <Section title="신청 기한">
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: "#555566" }}>기한: </span>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>
              사망일이 속한 달의 말일부터 1년 이내
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#8888a0" }}>
            예: 3월 8일 사망 → 3월 31일(말일)부터 1년 → 다음해 3월 31일까지
          </div>
        </div>
        <p style={{ fontSize: 14, color: "#eab308" }}>
          사망신고와 함께 바로 신청하는 것이 가장 좋습니다. 결과가 나와야 은행,
          보험, 상속세 등 후속 절차를 진행할 수 있기 때문입니다.
        </p>
      </Section>

      <Section title="신청 방법">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#12121a",
              border: "1px solid #222233",
              borderRadius: 8,
              padding: "16px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#e0e0e8",
                marginBottom: 8,
              }}
            >
              오프라인
            </div>
            <div style={{ fontSize: 13, color: "#8888a0" }}>
              주민센터(행정복지센터) 방문
            </div>
            <div
              style={{ fontSize: 13, color: "#8888a0", marginTop: 4 }}
            >
              사망신고와 동시 신청 가능
            </div>
          </div>
          <div
            style={{
              background: "#12121a",
              border: "1px solid #222233",
              borderRadius: 8,
              padding: "16px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#e0e0e8",
                marginBottom: 8,
              }}
            >
              온라인
            </div>
            <div style={{ fontSize: 13, color: "#8888a0" }}>
              정부24 (gov.kr)
            </div>
            <div
              style={{ fontSize: 13, color: "#8888a0", marginTop: 4 }}
            >
              공동인증서 필요
            </div>
          </div>
        </div>
      </Section>

      <Section title="필요 서류">
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
          }}
        >
          <div style={{ marginBottom: 4 }}>· 신청인 신분증</div>
          <div style={{ marginBottom: 4 }}>
            · 가족관계증명서 (상속인임을 증명)
          </div>
          <div>· 사망진단서 (사망신고와 별도 신청 시)</div>
        </div>
      </Section>

      <Section title="조회 항목">
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
          }}
        >
          {[
            { item: "금융거래", desc: "예금, 대출, 보험, 증권, 카드 등" },
            { item: "부동산", desc: "토지, 건물 소유 현황" },
            { item: "자동차", desc: "차량 등록 현황" },
            { item: "국세", desc: "미납 세금, 환급금" },
            { item: "지방세", desc: "재산세, 자동차세 등" },
            { item: "국민연금", desc: "가입 이력, 유족연금 수급 여부" },
            { item: "공제회", desc: "군인공제회, 과학기술인공제회 등" },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: i < 6 ? 8 : 0,
                fontSize: 14,
              }}
            >
              <span
                style={{
                  color: "#e0e0e8",
                  fontWeight: 600,
                  minWidth: 80,
                }}
              >
                {row.item}
              </span>
              <span style={{ color: "#8888a0" }}>{row.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="결과 확인">
        <p>
          결과는 조회 항목에 따라 소요 기간이 다릅니다:
        </p>
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 8, fontSize: 14 }}>
            <span style={{ color: "#e0e0e8", fontWeight: 600 }}>7일 이내: </span>
            <span style={{ color: "#8888a0" }}>부동산, 자동차, 지방세 등</span>
          </div>
          <div style={{ fontSize: 14 }}>
            <span style={{ color: "#e0e0e8", fontWeight: 600 }}>
              20일 이내:{" "}
            </span>
            <span style={{ color: "#8888a0" }}>
              금융거래, 국세, 국민연금 등
            </span>
          </div>
        </div>
        <p>
          결과는 문자, 정부24 온라인, 또는 우편으로 받을 수 있습니다.
        </p>
      </Section>

      <Section title="결과를 받은 후">
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            fontSize: 14,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            · 금융자산 확인 → 각 은행 방문하여 계좌 정리
          </div>
          <div style={{ marginBottom: 8 }}>
            · 보험 확인 → 각 보험사에 보험금 청구
          </div>
          <div style={{ marginBottom: 8 }}>
            · 채무 확인 → 상속포기/한정승인 여부 결정
          </div>
          <div>· 부동산/자동차 → 명의 이전 절차 진행</div>
        </div>
      </Section>

      <div
        style={{
          marginTop: 40,
          padding: "16px 20px",
          background: "#7b9fff10",
          border: "1px solid #7b9fff20",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, color: "#e0e0e8", marginBottom: 8 }}>
          안심상속 이후 절차도 놓치지 마세요
        </div>
        <a
          href="/"
          style={{
            display: "inline-block",
            background: "#7b9fff",
            color: "#0a0a0f",
            padding: "10px 24px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          전체 체크리스트 보기
        </a>
      </div>

      <footer
        style={{
          borderTop: "1px solid #222233",
          paddingTop: 24,
          marginTop: 32,
          fontSize: 12,
          color: "#555566",
          textAlign: "center",
        }}
      >
        <p>
          본 내용은 일반적인 정보 제공 목적이며, 법률 자문을 대체하지 않습니다.
        </p>
      </footer>
    </main>
    </>
  );
}