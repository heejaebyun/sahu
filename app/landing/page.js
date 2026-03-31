import Link from "next/link";

export const metadata = {
  title: "사후(SAHU) — 품격 있는 상속 절차의 시작",
  description:
    "사망 후 행정 체크리스트부터 상속재산분할협의서 자동 작성까지. 가족을 잃은 뒤 해야 할 모든 절차를, 가장 정중한 방식으로 안내합니다.",
};

export default function LandingPage() {
  return (
    <div
      style={{
        background: "#ffffff",
        color: "#1e293b",
        fontFamily:
          "var(--font-geist-sans), -apple-system, 'Segoe UI', sans-serif",
        minHeight: "100vh",
        wordBreak: "keep-all",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#0f172a",
            }}
          >
            SAHU
          </div>
          <nav
            style={{
              display: "flex",
              gap: 32,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: "#94a3b8",
              textTransform: "uppercase",
            }}
          >
            <a href="#about" style={{ color: "inherit", textDecoration: "none" }}>
              소개
            </a>
            <a href="#service" style={{ color: "inherit", textDecoration: "none" }}>
              서비스
            </a>
            <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>
              비용
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          paddingTop: 180,
          paddingBottom: 120,
          textAlign: "center",
          background:
            "radial-gradient(ellipse at top, #f8fafc 0%, #ffffff 70%)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 40,
            }}
          >
            <div
              style={{ width: 40, height: 1, background: "#d97706" }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: "#d97706",
                textTransform: "uppercase",
              }}
            >
              Legacy & Honor
            </span>
            <div
              style={{ width: 40, height: 1, background: "#d97706" }}
            />
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              marginBottom: 24,
              color: "#0f172a",
            }}
          >
            남겨진 분들의 슬픔을 알기에,
            <br />
            <span
              style={{
                color: "#94a3b8",
                fontWeight: 300,
                fontStyle: "italic",
              }}
            >
              절차만큼은 평온해야 합니다.
            </span>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#64748b",
              lineHeight: 1.8,
              marginBottom: 48,
              fontWeight: 300,
            }}
          >
            사망신고부터 상속세까지, 기한별 행정 체크리스트로 안내합니다.
            <br />
            상속재산분할협의서가 필요하다면, 법률 실무 수준의 문서를 직접
            작성하실 수 있습니다.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Link
                href="/"
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  padding: "18px 40px",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                  display: "inline-block",
                  boxShadow: "0 8px 32px rgba(15,23,42,0.15)",
                }}
              >
                체크리스트 시작하기
              </Link>
              <Link
                href="/agreement"
                style={{
                  background: "transparent",
                  color: "#0f172a",
                  padding: "18px 40px",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                  display: "inline-block",
                  border: "1px solid #e2e8f0",
                }}
              >
                분할협의서 작성하기
              </Link>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.05em",
              }}
            >
              체크리스트는 무료입니다. 모든 데이터는 브라우저에만 저장됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        style={{
          padding: "120px 24px",
          background: "#0f172a",
          color: "#ffffff",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.4,
              marginBottom: 56,
              letterSpacing: "-0.02em",
            }}
          >
            가장 힘든 순간에 마주하는 행정 절차가
            <br />
            가족의 또 다른 짐이 되지 않도록.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 40,
            }}
          >
            {[
              {
                num: "01",
                title: "기한 자동 계산",
                desc: "사망일만 입력하면 사망신고, 상속포기, 상속세 등 21개 절차의 기한이 자동 계산됩니다. 기한을 놓치면 과태료와 가산세가 부과됩니다.",
              },
              {
                num: "02",
                title: "정부 서비스 직접 연결",
                desc: "정부24, 내보험찾아줌, 홈택스, 인터넷등기소 등 10개 정부 서비스로 바로 연결됩니다. 어디서 뭘 해야 하는지 헤매지 않습니다.",
              },
              {
                num: "03",
                title: "법률 실무 수준의 문서",
                desc: "상속재산분할협의서를 법률사무소 양식으로 자동 작성합니다. 은행과 등기소에서 반려되지 않도록 데이터를 검증합니다.",
              },
            ].map((item) => (
              <div key={item.num}>
                <span
                  style={{
                    color: "#d97706",
                    fontWeight: 700,
                    fontSize: 18,
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  {item.num}
                </span>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "#f1f5f9",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#94a3b8",
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Comparison */}
      <section
        id="service"
        style={{ padding: "120px 24px", background: "#f8fafc" }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              marginBottom: 60,
              letterSpacing: "-0.02em",
            }}
          >
            무료 양식과는 다릅니다.
          </h2>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {[
              ["문서 형식", "빈칸 나열형", "법률사무소 서술형 문안"],
              ["데이터 검증", "사용자 임의 입력", "주민번호·등기부 자동 검증"],
              ["금액 표기", "수동 입력", "한글 금액 자동 변환"],
              ["제출 결과", "반려 위험", "은행·등기소 제출 기준 충족"],
              ["사후 보장", "없음", "반려 시 전액 환불"],
            ].map(([label, basic, premium], i) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderBottom:
                    i < 4 ? "1px solid #f1f5f9" : "none",
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    padding: "20px 24px",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    padding: "20px 24px",
                    color: "#94a3b8",
                  }}
                >
                  {basic}
                </div>
                <div
                  style={{
                    padding: "20px 24px",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                >
                  {premium}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "140px 24px" }}>
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            합리적인 비용, 확실한 결과
          </h2>

          <div
            style={{
              padding: 48,
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
              background: "#ffffff",
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  background: "#d97706",
                  color: "#ffffff",
                  padding: "4px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                오픈 베타 할인
              </span>
            </div>

            <div style={{ marginBottom: 32 }}>
              <span
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  textDecoration: "line-through",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                79,000원
              </span>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                49,900
              </span>
              <span style={{ fontSize: 16, color: "#64748b" }}>원</span>
            </div>

            <div
              style={{
                textAlign: "left",
                marginBottom: 40,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[
                "법률 실무 기반 서술형 협의서 자동 생성",
                "주민번호·등기부 데이터 검증",
                "은행·등기소 제출용 PDF 즉시 다운로드",
                "반려 시 전액 환불 보장",
              ].map((text) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    fontSize: 14,
                    color: "#475569",
                  }}
                >
                  <span style={{ color: "#d97706", flexShrink: 0 }}>
                    ✓
                  </span>
                  {text}
                </div>
              ))}
            </div>

            <Link
              href="/agreement"
              style={{
                display: "block",
                background: "#0f172a",
                color: "#ffffff",
                padding: "18px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              협의서 작성 시작하기
            </Link>

            <p
              style={{
                marginTop: 20,
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.05em",
              }}
            >
              법무사 평균 비용 30만원 대비 83% 절감
            </p>
          </div>

          <p
            style={{
              marginTop: 32,
              fontSize: 12,
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            체크리스트는 무료로 이용하실 수 있습니다.
            <br />
            분할협의서 작성 시에만 비용이 발생합니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "80px 24px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 32,
            }}
          >
            <div style={{ maxWidth: 300 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  marginBottom: 16,
                  color: "#0f172a",
                }}
              >
                SAHU
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                가족을 잃은 뒤 해야 할 행정 절차를 단계별로 안내하고,
                상속재산분할협의서를 법률 실무 수준으로 작성할 수 있도록
                돕습니다.
              </p>
            </div>

            <div style={{ maxWidth: 420, textAlign: "right" }}>
              <p
                style={{
                  fontSize: 11,
                  color: "#cbd5e1",
                  lineHeight: 1.8,
                }}
              >
                SAHU는 법률 문서 자동화 서비스를 제공하며, 특정 사건에 대한
                개별 법률 상담이나 대리 행위를 수행하지 않습니다. 본
                서비스의 결과물은 사용자가 입력한 데이터를 바탕으로 생성된
                제출용 초안 문서이며, 특수한 법적 쟁점이 있는 경우 전문가의
                도움을 받으시기 바랍니다.
              </p>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 11,
                  color: "#e2e8f0",
                }}
              >
                © 2026 SAHU. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
