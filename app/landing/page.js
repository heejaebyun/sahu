import Link from "next/link";

export const metadata = {
  title: "사후(SAHU) — 생전 정리부터 사후 행정까지",
  description:
    "미리 정리하면, 가족이 고생하지 않습니다. 디지털 유산 정리, 사망 후 행정 체크리스트, 상속재산분할협의서까지.",
};

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", wordBreak: "keep-all" }}>

      {/* 네비게이션 */}
      <nav className="sahu-nav">
        <div className="sahu-nav-inner">
          <Link href="/landing" className="sahu-logo">SAHU</Link>
          <div className="sahu-nav-links">
            <Link href="/life">생전 정리</Link>
            <Link href="/">사후 행정</Link>
            <Link href="/agreement">분할협의서</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 40 }}>
            <div style={{ width: 40, height: 1, background: "var(--accent)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "var(--accent)" }}>
              소중한 분을 위한 마지막 정리
            </span>
            <div style={{ width: 40, height: 1, background: "var(--accent)" }} />
          </div>

          <h1 style={{ fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.35, letterSpacing: "-0.02em", marginBottom: 20, color: "var(--primary)" }}>
            미리 정리하면,
            <br />
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              남은 가족이 고생하지 않습니다.
            </span>
          </h1>

          <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 44 }}>
            디지털 유산 정리부터 사후 행정 체크리스트,
            <br />
            상속재산분할협의서 자동 작성까지. 한 곳에서.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
            <Link href="/life" className="btn-accent" style={{ padding: "16px 36px" }}>
              생전 정리 시작하기
            </Link>
            <Link href="/" className="btn-primary" style={{ padding: "16px 36px", background: "var(--primary)", color: "#ffffff" }}>
              사후 행정 체크리스트
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
            무료입니다. 모든 데이터는 브라우저에만 저장됩니다.
          </p>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section style={{ padding: "100px 24px", background: "var(--primary)", color: "#e2e8f0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, lineHeight: 1.4, marginBottom: 48, color: "#ffffff" }}>
            가장 힘든 순간에 마주하는 행정 절차가
            <br />
            가족의 또 다른 짐이 되지 않도록.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 36 }}>
            {[
              { num: "01", title: "생전 정리", desc: "디지털 계정, 금융 자산, 보험, 중요 서류 위치를 미리 정리합니다. 가족에게 공유하면, 나중에 헤매지 않습니다.", color: "#10b981" },
              { num: "02", title: "사후 행정 체크리스트", desc: "사망일 입력만으로 21개 행정 절차의 기한이 자동 계산됩니다. 기한을 놓치면 과태료와 가산세가 부과됩니다.", color: "#818cf8" },
              { num: "03", title: "분할협의서 자동 작성", desc: "상속재산분할협의서를 실무 양식으로 자동 작성합니다. 은행과 등기소에서 반려되지 않도록 데이터를 검증합니다.", color: "#f59e0b" },
            ].map((item) => (
              <div key={item.num}>
                <span style={{ color: item.color, fontWeight: 700, fontSize: 17, display: "block", marginBottom: 10 }}>{item.num}</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#f1f5f9" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 비교 테이블 */}
      <section style={{ padding: "100px 24px", background: "var(--surface)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, marginBottom: 48 }}>
            무료 양식과는 다릅니다.
          </h2>

          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 20px", background: "var(--surface)", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--text-dim)" }}>
              <span>항목</span>
              <span>일반 양식</span>
              <span style={{ color: "var(--accent)" }}>SAHU</span>
            </div>
            {[
              ["문서 형식", "빈칸 나열형", "실무 서술형 문안"],
              ["데이터 검증", "사용자 임의 입력", "주민번호·등기부 자동 검증"],
              ["금액 표기", "수동 입력", "한글 금액 자동 변환"],
              ["제출 결과", "반려 위험", "은행·등기소 제출 기준 충족"],
              ["사후 보장", "없음", "반려 시 전액 환불"],
            ].map(([label, basic, premium], i) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 20px", borderBottom: i < 4 ? "1px solid var(--border)" : "none", fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{label}</span>
                <span style={{ color: "var(--text-dim)" }}>{basic}</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{premium}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 가격 */}
      <section style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, marginBottom: 44 }}>
            합리적인 비용, 확실한 결과
          </h2>

          <div style={{ padding: 44, border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", background: "var(--bg)", borderRadius: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ background: "var(--accent)", color: "#ffffff", padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", borderRadius: 4 }}>
                오픈 베타
              </span>
            </div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 14, color: "var(--text-dim)", textDecoration: "line-through", display: "block", marginBottom: 4 }}>79,000원</span>
              <span style={{ fontSize: 44, fontWeight: 800, color: "var(--text)" }}>49,900</span>
              <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>원</span>
            </div>

            <div style={{ textAlign: "left", marginBottom: 36, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "실무 서술형 협의서 서식 자동 완성",
                "주민번호·등기부 데이터 검증",
                "은행·등기소 제출용 PDF 즉시 생성",
                "반려 시 전액 환불 보장",
              ].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
                  {text}
                </div>
              ))}
            </div>

            <Link href="/agreement" className="btn-primary" style={{ display: "block", width: "100%", padding: "16px", background: "var(--primary)", color: "#ffffff" }}>
              협의서 작성 시작하기
            </Link>
          </div>

          <p style={{ marginTop: 28, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
            체크리스트와 생전 정리는 무료입니다.
            <br />
            분할협의서 작성 시에만 비용이 발생합니다.
          </p>
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{ padding: "60px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
          <div style={{ maxWidth: 280 }}>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14, color: "var(--text)" }}>SAHU</div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.8 }}>
              생전 정리부터 사후 행정까지.
              미리 정리하면, 가족이 고생하지 않습니다.
            </p>
          </div>
          <div style={{ maxWidth: 400, textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.8 }}>
              SAHU는 서식 자동 완성 서비스를 제공하며, 법률 상담이나 대리 행위를 수행하지 않습니다. 본 서비스의 결과물은 사용자가 입력한 데이터를 바탕으로 생성된 제출용 초안 문서입니다.
            </p>
            <p style={{ marginTop: 12, fontSize: 11, color: "var(--border)" }}>© 2026 SAHU. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
