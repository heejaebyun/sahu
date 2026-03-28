export const metadata = {
  title: "사망 후 은행 계좌 정리 방법 (2026) — 서류, 절차, 주의사항",
  description:
    "고인의 은행 계좌를 정리하려면 사망진단서, 가족관계증명서, 상속인 전원의 인감증명서 등이 필요합니다. 절차와 주의사항을 정리했습니다.",
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

export default function BankAccountsPage() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "40px 20px 80px",
        color: "#c0c0d0",
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
        사망 후 은행 계좌 정리 방법
      </h1>
      <p style={{ fontSize: 14, color: "#8888a0", marginBottom: 32 }}>
        2026년 기준 · 마지막 업데이트: 2026년 3월
      </p>

      <div
        style={{
          background: "#ef444410",
          border: "1px solid #ef444430",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 32,
          fontSize: 14,
          color: "#ef4444",
          fontWeight: 600,
        }}
      >
        주의: 사망 전 인출하거나, 상속 절차 없이 고인 계좌에서 인출하면 형사
        처벌 대상이 될 수 있습니다.
      </div>

      <Section title="진행 순서">
        <p>
          은행 계좌 정리는 안심상속 원스톱서비스 결과를 받은 후 진행하는 것이
          가장 효율적입니다. 어떤 은행에 계좌가 있는지 먼저 파악해야 하기
          때문입니다.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 12,
          }}
        >
          {[
            "안심상속 원스톱서비스로 고인의 금융거래 현황 조회",
            "상속인 전원의 합의 (상속협의서 작성)",
            "필요 서류 준비",
            "각 은행 영업점 방문하여 잔액 조회·계좌 해지·이전",
          ].map((step, i) => (
            <div
              key={i}
              style={{
                background: "#12121a",
                border: "1px solid #222233",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#3b82f620",
                  color: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 14 }}>{step}</span>
            </div>
          ))}
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
          <div style={{ marginBottom: 4 }}>· 사망진단서(시체검안서)</div>
          <div style={{ marginBottom: 4 }}>
            · 가족관계증명서 (사망 기록 포함)
          </div>
          <div style={{ marginBottom: 4 }}>
            · 상속인 전원의 인감증명서
          </div>
          <div style={{ marginBottom: 4 }}>· 상속인 신분증</div>
          <div style={{ marginBottom: 4 }}>
            · 상속협의서 (상속인이 2명 이상인 경우, 전원 인감 날인)
          </div>
          <div>· 통장, 카드 등 (보유 시)</div>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#eab308",
            marginTop: 12,
          }}
        >
          은행마다 요구 서류가 다를 수 있습니다. 방문 전 해당 은행에 전화로
          확인하세요.
        </p>
      </Section>

      <Section title="상속인이 1명인 경우">
        <p>
          상속인이 본인 1명뿐이라면 상속협의서와 다른 상속인의 인감증명서가
          필요 없으므로 절차가 간단합니다. 가족관계증명서로 단독 상속인임을
          증명하면 됩니다.
        </p>
      </Section>

      <Section title="상속인이 여러 명인 경우">
        <p>
          상속인이 여러 명이면 전원의 합의가 필요합니다. 상속협의서에 전원이
          인감을 찍고 인감증명서를 첨부해야 합니다.
        </p>
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>방법 1: </span>
            대표 상속인 1명이 전체 금액을 수령 후 분배
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>방법 2: </span>
            상속협의서에 각자 수령 금액을 명시하여 각각 수령
          </div>
        </div>
      </Section>

      <Section title="주의사항">
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            fontSize: 14,
          }}
        >
          <div style={{ marginBottom: 8, color: "#ef4444" }}>
            · 고인 사망 전 가족이 임의로 인출하면 횡령/사기죄가 성립할 수
            있습니다.
          </div>
          <div style={{ marginBottom: 8, color: "#ef4444" }}>
            · 사망 후에도 상속 절차 없이 인출하면 처벌 대상입니다.
          </div>
          <div style={{ marginBottom: 8 }}>
            · 고인 계좌의 자동이체는 별도로 해지해야 합니다.
          </div>
          <div style={{ marginBottom: 8 }}>
            · 대출이 있는 계좌는 상속 채무가 됩니다. 상속포기/한정승인 결정에
            영향을 줄 수 있으니 먼저 확인하세요.
          </div>
          <div>
            · 계좌 해지 전 최근 거래내역을 출력해두면 상속세 신고에 도움이
            됩니다.
          </div>
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
          은행 외에도 해야 할 일이 많습니다
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
  );
}
