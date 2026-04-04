"use client";

import { useState, useEffect } from "react";
import { LIFE_CATEGORIES, LIFE_CHECKLIST } from "@/lib/life-checklist-data";

export default function LifePage() {
  const [entries, setEntries] = useState({});
  const [expandedItem, setExpandedItem] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // sessionStorage 저장/복원
  useEffect(() => {
    const saved = sessionStorage.getItem("sahu-life-data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.entries) setEntries(data.entries);
        if (data.familyMembers) setFamilyMembers(data.familyMembers);
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      sessionStorage.setItem("sahu-life-data", JSON.stringify({ entries, familyMembers }));
    }
  }, [entries, familyMembers, loaded]);

  const updateEntry = (itemId, fieldKey, value) => {
    setEntries((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [fieldKey]: value },
    }));
  };

  const getCompletionRate = () => {
    const total = LIFE_CHECKLIST.length;
    const filled = LIFE_CHECKLIST.filter((item) => {
      const entry = entries[item.id];
      if (!entry) return false;
      return item.fields.some((f) => entry[f.key]?.trim());
    }).length;
    return { filled, total, pct: total === 0 ? 0 : Math.round((filled / total) * 100) };
  };

  const addFamilyMember = () => {
    if (familyMembers.length >= 5) return;
    setFamilyMembers((prev) => [...prev, { id: `fm_${Date.now()}`, name: "", relation: "", phone: "", email: "" }]);
  };

  const updateFamilyMember = (id, field, value) => {
    setFamilyMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeFamilyMember = (id) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleShare = async () => {
    const shareData = { entries, familyMembers, sharedAt: new Date().toISOString() };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
    const shareUrl = `${window.location.origin}/life/shared?data=${encoded.slice(0, 100)}`;

    // 간단한 텍스트 공유
    const text = `인생정리 체크리스트를 공유합니다.\n\n${getCompletionRate().filled}/${getCompletionRate().total}개 항목을 정리했습니다.\n\n확인하기: ${window.location.origin}/life`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "SAHU 인생정리", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("링크가 복사되었습니다. 가족에게 보내주세요.");
    }
  };

  const { filled, total, pct } = getCompletionRate();

  if (!loaded) return null;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px", background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>

      {/* 네비게이션 */}
      <nav className="sahu-nav">
        <div className="sahu-nav-inner">
          <a href="/landing" className="sahu-logo">SAHU</a>
          <div className="sahu-nav-links">
            <a href="/life" className="active">생전 정리</a>
            <a href="/">사후 행정</a>
            <a href="/agreement">분할협의서</a>
          </div>
        </div>
      </nav>

      <div style={{ height: 56 }} /> {/* 네비 높이만큼 여백 */}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, paddingTop: 16 }}>
        <button onClick={handleShare} className="btn-accent" style={{ padding: "8px 16px", fontSize: 12 }}>가족에게 공유</button>
      </div>

      {/* 소개 */}
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.02em" }}>
          오늘 10분, 가족의 내일이 달라집니다.
        </h1>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
          디지털 계정, 금융 자산, 중요 서류 위치를 정리해 두면<br />
          가족이 나중에 고생하지 않습니다.
        </p>
      </div>

      {/* 진행률 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 8 }}>
          <span>정리 진행률</span>
          <span>{filled}/{total} ({pct}%)</span>
        </div>
        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : "linear-gradient(90deg, #10b981, #059669)", borderRadius: 3, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* 가족 지정인 */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>👨‍👩‍👧 가족 지정인</h3>
          {familyMembers.length < 5 && (
            <button onClick={addFamilyMember} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#64748b", cursor: "pointer" }}>+ 추가</button>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>이 정리 내용을 전달받을 가족을 등록하세요.</p>
        {familyMembers.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <input value={m.name} onChange={(e) => updateFamilyMember(m.id, "name", e.target.value)} placeholder="이름" style={{ flex: 1, padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
            <input value={m.relation} onChange={(e) => updateFamilyMember(m.id, "relation", e.target.value)} placeholder="관계" style={{ width: 70, padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
            <input value={m.phone} onChange={(e) => updateFamilyMember(m.id, "phone", e.target.value)} placeholder="연락처" style={{ flex: 1, padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
            <button onClick={() => removeFamilyMember(m.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        ))}
        {familyMembers.length === 0 && (
          <p style={{ fontSize: 12, color: "#cbd5e1", textAlign: "center", padding: 8 }}>아직 등록된 가족이 없습니다.</p>
        )}
      </div>

      {/* 카테고리별 체크리스트 */}
      {LIFE_CATEGORIES.map((cat) => {
        const items = LIFE_CHECKLIST.filter((i) => i.category === cat.id);
        const catFilled = items.filter((item) => {
          const entry = entries[item.id];
          return entry && item.fields.some((f) => entry[f.key]?.trim());
        }).length;

        return (
          <section key={cat.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{cat.label}</h2>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{catFilled}/{items.length}</span>
            </div>

            {items.map((item) => {
              const isExpanded = expandedItem === item.id;
              const entry = entries[item.id] || {};
              const isFilled = item.fields.some((f) => entry[f.key]?.trim());

              return (
                <div key={item.id} style={{ background: isFilled ? "#f0fdf4" : "#ffffff", border: `1px solid ${isFilled ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                  <div onClick={() => setExpandedItem(isExpanded ? null : item.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: isFilled ? "#059669" : "#334155" }}>
                        {isFilled ? "✓ " : ""}{item.title}
                      </span>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{item.description}</p>
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: 12, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                      {item.fields.map((field) => (
                        <div key={field.key}>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{field.label}</label>
                          {field.type === "select" ? (
                            <select value={entry[field.key] || ""} onChange={(e) => updateEntry(item.id, field.key, e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", background: "#fff" }}>
                              <option value="">선택</option>
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === "textarea" ? (
                            <textarea value={entry[field.key] || ""} onChange={(e) => updateEntry(item.id, field.key, e.target.value)} placeholder={field.placeholder} rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", resize: "vertical", boxSizing: "border-box" }} />
                          ) : (
                            <input value={entry[field.key] || ""} onChange={(e) => updateEntry(item.id, field.key, e.target.value)} placeholder={field.placeholder} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#1e293b", boxSizing: "border-box" }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}

      {/* PDF 리포트 다운로드 */}
      {filled > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginTop: 16, textAlign: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>인생정리 리포트</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.6 }}>
            지금까지 정리한 내용을 PDF로 다운로드할 수 있습니다.<br />
            출력해서 가족에게 전달하거나, 안전한 곳에 보관하세요.
          </p>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/generate-life-report", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ entries, familyMembers }),
                });
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "인생정리_리포트.pdf";
                  a.click();
                } else {
                  alert("PDF 생성에 실패했습니다.");
                }
              } catch {
                alert("오류가 발생했습니다.");
              }
            }}
            style={{ padding: "14px 32px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            📄 PDF 리포트 다운로드
          </button>
        </div>
      )}

      {/* 사후 서비스 연결 */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "24px", marginTop: 16, color: "#ffffff" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>만약의 상황이 발생한다면</h3>
        <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>
          사망 후 해야 할 21가지 행정 절차를 기한별로 안내합니다. 상속신고, 은행 정리, 보험 청구까지.
        </p>
        <a href="/" style={{ display: "inline-block", padding: "12px 24px", background: "#ffffff", color: "#0f172a", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          사후 행정 체크리스트 보기
        </a>
      </div>

      {/* 푸터 */}
      <footer style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20, marginTop: 32, fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.6 }}>
        <p>본 서비스는 일반적인 정보 정리 목적이며, 법률·세무 자문을 대체하지 않습니다.</p>
        <p style={{ marginTop: 4 }}>모든 데이터는 브라우저에만 저장됩니다. 서버에 전송되지 않습니다.</p>
        <p style={{ marginTop: 4 }}>© 2026 SAHU 인생정리</p>
      </footer>
    </main>
  );
}
