export const metadata = {
  title: "상속포기·한정승인 방법 총정리 (2026) — 기한 3개월, 절차, 비용",
  description:
    "상속포기와 한정승인은 상속개시 있음을 안 날부터 3개월 이내에 가정법원에 신청해야 합니다. 절차, 필요서류, 비용, 차이점을 정리했습니다.",
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

export default function InheritanceRenouncePage() {
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
        상속포기·한정승인 완벽 가이드
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
        핵심: 상속개시 있음을 안 날부터 3개월 이내에 신청하지 않으면,
        단순승인(모든 재산+빚을 상속)으로 간주됩니다.
      </div>

      <Section title="상속포기 vs 한정승인">
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
                fontSize: 16,
              }}
            >
              상속포기
            </div>
            <div style={{ fontSize: 13, color: "#8888a0", marginBottom: 4 }}>
              재산과 빚 모두 포기
            </div>
            <div style={{ fontSize: 13, color: "#8888a0", marginBottom: 4 }}>
              처음부터 상속인이 아닌 것으로 간주
            </div>
            <div style={{ fontSize: 13, color: "#ef4444" }}>
              취소 불가
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
                fontSize: 16,
              }}
            >
              한정승인
            </div>
            <div style={{ fontSize: 13, color: "#8888a0", marginBottom: 4 }}>
              상속받은 재산 범위 내에서만 빚을 갚음
            </div>
            <div style={{ fontSize: 13, color: "#8888a0", marginBottom: 4 }}>
              재산이 빚보다 많으면 남은 재산을 받을 수 있음
            </div>
            <div style={{ fontSize: 13, color: "#eab308" }}>
              절차가 더 복잡
            </div>
          </div>
        </div>
      </Section>

      <Section title="기한">
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
              상속개시 있음을 안 날부터 3개월
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#8888a0" }}>
            &ldquo;상속개시 있음을 안 날&rdquo;이란 피상속인이 사망했고 자신이
            상속인이 됨을 안 시점입니다. 통상 사망일로 봅니다.
          </div>
        </div>
        <p>
          기한이 지나면 자동으로 단순승인이 됩니다. 고인의 빚이 재산보다
          많더라도 모두 상속받게 되므로, 빚이 우려된다면 반드시 기한 내
          결정해야 합니다.
        </p>
      </Section>

      <Section title="어떤 것을 선택해야 할까?">
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>
              빚이 재산보다 확실히 많다면
            </span>
            <div style={{ fontSize: 13, color: "#8888a0" }}>→ 상속포기</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>
              빚과 재산 규모를 아직 모른다면
            </span>
            <div style={{ fontSize: 13, color: "#8888a0" }}>
              → 한정승인 (안전한 선택)
            </div>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>
              재산이 빚보다 확실히 많다면
            </span>
            <div style={{ fontSize: 13, color: "#8888a0" }}>
              → 단순승인 (별도 신청 불필요)
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
          <div style={{ marginBottom: 4 }}>· 상속포기/한정승인 심판청구서</div>
          <div style={{ marginBottom: 4 }}>· 사망진단서(시체검안서)</div>
          <div style={{ marginBottom: 4 }}>
            · 가족관계증명서 (사망 기록 포함)
          </div>
          <div style={{ marginBottom: 4 }}>· 기본증명서 (고인)</div>
          <div style={{ marginBottom: 4 }}>· 주민등록등본</div>
          <div>· 인지대, 송달료 (법원에 따라 다름)</div>
        </div>
      </Section>

      <Section title="절차">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            "안심상속 원스톱서비스로 고인의 재산/채무 파악",
            "상속포기 또는 한정승인 결정",
            "관할 가정법원에 심판청구서 제출",
            "법원 심판 (보통 1~2개월 소요)",
            "심판문 수령 후 채권자에게 통지 (한정승인의 경우)",
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
          <div style={{ marginBottom: 8, color: "#eab308" }}>
            · 상속포기는 한번 하면 취소할 수 없습니다.
          </div>
          <div style={{ marginBottom: 8, color: "#eab308" }}>
            · 상속포기 시 다음 순위 상속인에게 상속권이 넘어갑니다. 가족 전원이
            함께 포기해야 할 수 있습니다.
          </div>
          <div style={{ marginBottom: 8 }}>
            · 한정승인 시 관보 공고 및 채권자 최고 절차가 필요합니다.
          </div>
          <div>
            · 복잡한 경우 변호사 상담을 권장합니다.
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
          상속 결정 외에도 해야 할 일이 많습니다
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