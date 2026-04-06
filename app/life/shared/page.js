"use client";

import { useState, useEffect } from "react";
import { LIFE_CATEGORIES, LIFE_CHECKLIST } from "@/lib/life-checklist-data";

export default function SharedPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("id");

    if (!shareId) {
      setError("공유 링크가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    fetch(`/api/share/view?id=${shareId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }
      })
      .catch(() => setError("데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "120px 20px", textAlign: "center", color: "var(--text)" }}>
        <p>불러오는 중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "120px 20px", textAlign: "center", color: "var(--text)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>공유 링크 오류</h1>
        <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        <a href="/life" style={{ display: "inline-block", marginTop: 24, padding: "12px 24px", background: "var(--accent)", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          나도 인생정리 시작하기
        </a>
      </main>
    );
  }

  const { entries, familyMembers } = data;

  const getEntries = (itemId) => {
    const raw = entries[itemId];
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px", background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>
      <nav className="sahu-nav">
        <div className="sahu-nav-inner">
          <a href="/landing" className="sahu-logo">SAHU</a>
          <div className="sahu-nav-links">
            <a href="/life">생전 정리</a>
            <a href="/">사후 행정</a>
          </div>
        </div>
      </nav>
      <div style={{ height: 56 }} />

      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "20px 24px", marginTop: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>공유받은 인생정리</h1>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
          가족이 정리한 내용입니다. 중요한 정보가 포함되어 있으니 안전하게 보관하세요.
        </p>
      </div>

      {LIFE_CATEGORIES.map((cat) => {
        const items = LIFE_CHECKLIST.filter((i) => i.category === cat.id);
        const filledItems = items.filter((item) => {
          const itemEntries = getEntries(item.id);
          return itemEntries.some((entry) => item.fields.some((f) => entry[f.key]?.trim?.()));
        });

        if (filledItems.length === 0) return null;

        return (
          <section key={cat.id} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #e2e8f0" }}>
              {cat.icon} {cat.label}
            </h2>
            {filledItems.map((item) => {
              const itemEntries = getEntries(item.id);
              return (
                <div key={item.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{item.title} ({itemEntries.length}개)</h3>
                  {itemEntries.map((entry, ei) => (
                    <div key={ei} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: ei < itemEntries.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                      {item.fields.map((field) => {
                        const val = entry[field.key];
                        if (!val || !val.trim?.()) return null;
                        return (
                          <div key={field.key} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: "#94a3b8", minWidth: 80 }}>{field.label}:</span>
                            <span style={{ color: "#334155" }}>{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </section>
        );
      })}

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <a href="/life" style={{ display: "inline-block", padding: "14px 28px", background: "var(--accent)", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
          나도 인생정리 시작하기
        </a>
      </div>

      <footer className="sahu-footer">
        <p>본 서비스는 일반적인 정보 정리 목적이며, 법률·세무 자문을 대체하지 않습니다.</p>
      </footer>
    </main>
  );
}
