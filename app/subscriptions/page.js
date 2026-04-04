"use client";

import { useState } from "react";
import { SUBSCRIPTIONS } from "@/lib/subscription-data";

export default function SubscriptionsPage() {
  const [checkedServices, setCheckedServices] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleService = (name) => {
    setCheckedServices((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const totalServices = SUBSCRIPTIONS.reduce(
    (acc, cat) => acc + cat.services.length,
    0
  );
  const checkedCount =
    Object.values(checkedServices).filter(Boolean).length;

  return (
    <main
      data-theme="dark"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "96px 20px 80px",
        background: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
      }}
    >
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
      <a
        href="/"
        style={{
          fontSize: 13,
          color: "#555566",
          display: "block",
          marginBottom: 24,
        }}
      >
        ← 체크리스트로 돌아가기
      </a>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        구독/계정 해지 가이드
      </h1>
      <p style={{ fontSize: 14, color: "#8888a0", marginBottom: 32 }}>
        고인 명의의 구독 서비스와 디지털 계정을 정리하세요.
        <br />
        카드 명세서와 고인 휴대폰 앱 목록을 확인하면 가입된 서비스를 파악할 수
        있습니다.
      </p>

      <div
        style={{
          background: "#12121a",
          border: "1px solid #222233",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 32,
          fontSize: 13,
          color: "#8888a0",
        }}
      >
        <div style={{ fontWeight: 600, color: "#e0e0e8", marginBottom: 8 }}>
          확인 방법
        </div>
        <div style={{ marginBottom: 4 }}>
          · 고인의 카드 명세서에서 정기결제 내역 확인
        </div>
        <div style={{ marginBottom: 4 }}>
          · 고인의 휴대폰에 설치된 앱 목록 확인
        </div>
        <div style={{ marginBottom: 4 }}>
          · 고인의 이메일에서 구독 확인 메일 검색
        </div>
        <div>· 은행 계좌의 자동이체 내역 확인</div>
      </div>

      <div style={{ fontSize: 13, color: "#555566", marginBottom: 24 }}>
        처리 완료: {checkedCount}/{totalServices}
      </div>

      {SUBSCRIPTIONS.map((category) => {
        const isExpanded = expandedCategory === category.category;
        const catChecked = category.services.filter(
          (s) => checkedServices[s.name]
        ).length;

        return (
          <section key={category.category} style={{ marginBottom: 16 }}>
            <div
              onClick={() =>
                setExpandedCategory(isExpanded ? null : category.category)
              }
              style={{
                background: "#12121a",
                border: "1px solid #222233",
                borderRadius: 8,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  {category.category}
                </span>
                <span style={{ fontSize: 12, color: "#555566" }}>
                  {catChecked}/{category.services.length}
                </span>
              </div>
              <span
                style={{
                  color: "#555566",
                  fontSize: 14,
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                ▼
              </span>
            </div>

            {isExpanded && (
              <div style={{ marginTop: 4 }}>
                {category.services.map((service) => (
                  <div
                    key={service.name}
                    style={{
                      background: checkedServices[service.name]
                        ? "#0d1a0d"
                        : "#0a0a0f",
                      border: `1px solid ${
                        checkedServices[service.name] ? "#22c55e30" : "#1a1a26"
                      }`,
                      borderRadius: 8,
                      padding: "14px 16px",
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedServices[service.name]}
                        onChange={() => toggleService(service.name)}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: "#22c55e",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          textDecoration: checkedServices[service.name]
                            ? "line-through"
                            : "none",
                          color: checkedServices[service.name]
                            ? "#555566"
                            : "#e0e0e8",
                        }}
                      >
                        {service.name}
                      </span>
                    </div>

                    {!checkedServices[service.name] && (
                      <div
                        style={{
                          marginTop: 12,
                          marginLeft: 28,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          fontSize: 13,
                          color: "#8888a0",
                        }}
                      >
                        <div>
                          <span style={{ color: "#555566" }}>해지 방법: </span>
                          {service.method}
                        </div>
                        {service.phone !== "없음" && (
                          <div>
                            <span style={{ color: "#555566" }}>연락처: </span>
                            {service.phone}
                          </div>
                        )}
                        <div>
                          <span style={{ color: "#555566" }}>필요 서류: </span>
                          {service.documents}
                        </div>
                        {service.note && (
                          <div style={{ color: "#eab308", fontSize: 12 }}>
                            {service.note}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

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
        <p>연락처 및 해지 방법은 변경될 수 있습니다. 최신 정보는 각 서비스에서 확인하세요.</p>
      </footer>
    </main>
  );
}
