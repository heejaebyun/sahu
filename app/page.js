"use client";

import { useState, useMemo, useEffect } from "react";
import { CHECKLIST, CATEGORIES } from "@/lib/checklist-data";

function calculateDeadlines(deathDate) {
  if (!deathDate) return {};
  const death = new Date(deathDate);
  const today = new Date();
  const diffDays = Math.floor((today - death) / (1000 * 60 * 60 * 24));
  return { deathDate: death, diffDays };
}

function getRemainingDays(item, diffDays, deathDate) {
  let remaining = item.deadline - diffDays;
  if (item.deadlineFromMonthEnd && deathDate) {
    const death = new Date(deathDate);
    const monthEnd = new Date(death.getFullYear(), death.getMonth() + 1, 0);
    const extraDays = Math.floor((monthEnd - death) / (1000 * 60 * 60 * 24));
    remaining += extraDays;
  }
  return remaining;
}

function DeadlineBadge({ item, diffDays, deathDate }) {
  if (!item.deadline || diffDays === undefined) return null;
  const remaining = getRemainingDays(item, diffDays, deathDate);
  if (remaining < 0) {
    return (
      <span
        style={{
          background: "var(--danger-bg)",
          color: "var(--danger)",
          padding: "2px 10px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        {Math.abs(remaining)}일 초과
      </span>
    );
  }
  if (remaining <= 14) {
    return (
      <span
        style={{
          background: "var(--warning-bg)",
          color: "var(--warning)",
          padding: "2px 10px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        D-{remaining}
      </span>
    );
  }
  return (
    <span
      style={{
        background: "var(--accent-glow)",
        color: "var(--accent)",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
      }}
    >
      D-{remaining}
    </span>
  );
}

function CheckItem({ item, checked, onToggle, diffDays, deathDate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: checked ? "var(--success-bg)" : "var(--surface)",
        border: `1px solid ${checked ? "#34d39925" : "var(--border)"}`,
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 8,
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          style={{ marginTop: 2 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                textDecoration: checked ? "line-through" : "none",
                color: checked ? "var(--text-dim)" : "var(--text)",
              }}
            >
              {item.title}
            </span>
            {item.critical && !checked && (
              <span
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  padding: "1px 8px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                필수
              </span>
            )}
            <DeadlineBadge
              item={item}
              diffDays={diffDays}
              deathDate={deathDate}
            />
          </div>
          {!checked && (
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                marginTop: 5,
                lineHeight: 1.5,
              }}
            >
              {item.description}
            </p>
          )}
        </div>
        <span
          style={{
            color: "var(--text-dim)",
            fontSize: 12,
            flexShrink: 0,
            marginTop: 4,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          &#9662;
        </span>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 16,
            marginLeft: 34,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                marginBottom: 5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              어디서
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {item.where}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                marginBottom: 5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              필요 서류
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {item.documents.map((doc) => (
                <div
                  key={doc}
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "var(--text-dim)", fontSize: 8 }}>
                    ●
                  </span>
                  {doc}
                </div>
              ))}
            </div>
          </div>

          {item.tips.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginBottom: 5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                참고사항
              </div>
              {item.tips.map((tip) => (
                <p
                  key={tip}
                  style={{
                    fontSize: 13,
                    color: tip.startsWith("\u26A0\uFE0F")
                      ? "var(--warning)"
                      : "var(--text-secondary)",
                    marginBottom: 5,
                    lineHeight: 1.6,
                  }}
                >
                  {tip}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ checked, total }) {
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--text-dim)",
          marginBottom: 8,
          fontWeight: 500,
        }}
      >
        <span>진행률</span>
        <span style={{ color: "var(--text-secondary)" }}>
          {checked}/{total} ({pct}%)
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--surface)",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background:
              pct === 100
                ? "var(--success)"
                : "linear-gradient(90deg, var(--accent), var(--accent-hover))",
            borderRadius: 3,
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

function DatePicker({ value, onChange }) {
  const today = new Date();
  const currentYear = today.getFullYear();

  const parsed = value ? value.split("-") : ["", "", ""];
  const [year, setYear] = useState(parsed[0] || "");
  const [month, setMonth] = useState(parsed[1] || "");
  const [day, setDay] = useState(parsed[2] || "");

  const years = [];
  for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);

  const months = [];
  for (let m = 1; m <= 12; m++) months.push(m);

  const daysInMonth =
    year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  useEffect(() => {
    if (year && month && day) {
      const m = String(month).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      onChange(`${year}-${m}-${d}`);
    } else {
      onChange("");
    }
  }, [year, month, day]);

  useEffect(() => {
    if (value) {
      const p = value.split("-");
      setYear(p[0] || "");
      setMonth(p[1] ? String(Number(p[1])) : "");
      setDay(p[2] ? String(Number(p[2])) : "");
    }
  }, []);

  const selectStyle = {
    flex: 1,
    padding: "12px 8px",
    fontSize: 15,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--text)",
    appearance: "none",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: 500,
  };

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        style={selectStyle}
      >
        <option value="">년</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}년
          </option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => {
          setMonth(e.target.value);
          setDay("");
        }}
        style={selectStyle}
      >
        <option value="">월</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {m}월
          </option>
        ))}
      </select>
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        style={selectStyle}
      >
        <option value="">일</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}일
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Home() {
  const [deathDate, setDeathDate] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [started, setStarted] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const [consultForm, setConsultForm] = useState({ name: "", phone: "", needs: "", detail: "" });
  const [consultStatus, setConsultStatus] = useState(null); // null | "sending" | "done" | "error"

  useEffect(() => {
    const saved = localStorage.getItem("sahu-data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.deathDate) setDeathDate(data.deathDate);
        if (data.checkedItems) setCheckedItems(data.checkedItems);
        if (data.deathDate) setStarted(true);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (started) {
      localStorage.setItem(
        "sahu-data",
        JSON.stringify({ deathDate, checkedItems })
      );
    }
  }, [deathDate, checkedItems, started]);

  const { diffDays } = useMemo(
    () => calculateDeadlines(deathDate),
    [deathDate]
  );

  const toggleItem = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const handleStart = () => {
    if (!deathDate) return;
    setStarted(true);
  };

  const handleShare = async () => {
    const url = window.location.origin;
    const text =
      "사후(SAHU) — 사망 후 행정 처리 가이드\n해야 할 일을 단계별로 안내합니다.";
    if (navigator.share) {
      try {
        await navigator.share({ title: "사후(SAHU)", text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("링크가 복사되었습니다.");
    }
  };

  const handleConsultSubmit = async () => {
    if (!consultForm.name || !consultForm.phone) return;
    setConsultStatus("sending");
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...consultForm, deathDate }),
      });
      if (res.ok) {
        setConsultStatus("done");
      } else {
        setConsultStatus("error");
      }
    } catch {
      setConsultStatus("error");
    }
  };

  const handleReset = () => {
    if (confirm("모든 진행 상황이 초기화됩니다. 계속하시겠습니까?")) {
      setDeathDate("");
      setCheckedItems({});
      setStarted(false);
      localStorage.removeItem("sahu-data");
    }
  };

  // ── 시작 화면 ──
  if (!started) {
    return (
      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "100px 20px 80px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "var(--accent-glow)",
              border: "1px solid var(--accent)",
              marginBottom: 24,
              fontSize: 20,
            }}
          >
            S
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 10,
              letterSpacing: "-0.02em",
            }}
          >
            사후
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            가족을 잃은 후 해야 할 행정 절차를
            <br />
            단계별로 안내합니다.
          </p>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "28px 24px",
            marginBottom: 16,
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: 13,
              color: "var(--text-secondary)",
              marginBottom: 14,
              fontWeight: 500,
            }}
          >
            사망일을 선택해주세요
          </label>
          <DatePicker value={deathDate} onChange={setDeathDate} />
          <button
            onClick={handleStart}
            disabled={!deathDate}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: 15,
              fontWeight: 600,
              background: deathDate
                ? "linear-gradient(135deg, var(--accent), var(--accent-hover))"
                : "var(--surface-hover)",
              color: deathDate ? "#fff" : "var(--text-dim)",
              border: "none",
              borderRadius: 10,
              cursor: deathDate ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              letterSpacing: "-0.01em",
            }}
          >
            시작하기
          </button>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "22px 24px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-dim)",
              marginBottom: 14,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            이 서비스가 도와드리는 것
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            {[
              "사망신고부터 상속세까지 전체 절차 안내",
              "기한이 있는 항목 D-day 자동 계산",
              "각 절차별 필요 서류 및 방문처 안내",
              "진행 상황 체크리스트로 관리",
              "모든 데이터는 브라우저에만 저장",
            ].map((text) => (
              <div
                key={text}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    flexShrink: 0,
                  }}
                />
                {text}
              </div>
            ))}
          </div>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            marginTop: 32,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          본 서비스는 일반적인 정보 제공 목적이며,
          <br />
          법률·세무 자문을 대체하지 않습니다.
        </p>
      </main>
    );
  }

  // ── 체크리스트 화면 ──
  const urgentItems = CHECKLIST.filter(
    (item) =>
      item.deadline &&
      !checkedItems[item.id] &&
      diffDays !== undefined &&
      getRemainingDays(item, diffDays, deathDate) >= 0 &&
      getRemainingDays(item, diffDays, deathDate) <= 14
  );

  const overdueItems = CHECKLIST.filter(
    (item) =>
      item.deadline &&
      !checkedItems[item.id] &&
      diffDays !== undefined &&
      getRemainingDays(item, diffDays, deathDate) < 0
  );

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "32px 20px 80px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--accent-glow)",
              border: "1px solid var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            S
          </div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            사후
          </h1>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleShare}
            style={{
              background: "var(--accent-glow)",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            공유
          </button>
          <button
            onClick={handleReset}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            초기화
          </button>
        </div>
      </header>

      <p
        style={{
          fontSize: 12,
          color: "var(--text-dim)",
          marginBottom: 24,
          fontWeight: 500,
        }}
      >
        사망일 {deathDate} · 경과 {diffDays}일
      </p>

      <ProgressBar checked={checkedCount} total={CHECKLIST.length} />

      {/* 기한 초과 */}
      {overdueItems.length > 0 && (
        <div
          style={{
            background: "var(--danger-bg)",
            border: "1px solid #f8717120",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--danger)",
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            기한 초과
          </div>
          {overdueItems.map((item) => (
            <div
              key={item.id}
              style={{
                fontSize: 13,
                color: "var(--danger)",
                marginTop: 4,
                opacity: 0.9,
              }}
            >
              {item.title} —{" "}
              {Math.abs(getRemainingDays(item, diffDays, deathDate))}일 초과
            </div>
          ))}
        </div>
      )}

      {/* 기한 임박 */}
      {urgentItems.length > 0 && (
        <div
          style={{
            background: "var(--warning-bg)",
            border: "1px solid #fbbf2420",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--warning)",
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            기한 임박
          </div>
          {urgentItems.map((item) => (
            <div
              key={item.id}
              style={{
                fontSize: 13,
                color: "var(--warning)",
                marginTop: 4,
                opacity: 0.9,
              }}
            >
              {item.title} — D-
              {getRemainingDays(item, diffDays, deathDate)}
            </div>
          ))}
        </div>
      )}

      {/* 카테고리별 체크리스트 */}
      {CATEGORIES.map((category) => {
        const items = CHECKLIST.filter(
          (item) => item.category === category.id
        );
        if (items.length === 0) return null;
        const catChecked = items.filter((i) => checkedItems[i.id]).length;

        return (
          <section key={category.id} style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: category.color,
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${category.color}40`,
                }}
              />
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {category.label}
              </h2>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  fontWeight: 500,
                }}
              >
                {catChecked}/{items.length}
              </span>
            </div>
            {items.map((item) => (
              <CheckItem
                key={item.id}
                item={item}
                checked={!!checkedItems[item.id]}
                onToggle={toggleItem}
                diffDays={diffDays}
                deathDate={deathDate}
              />
            ))}
          </section>
        );
      })}

      {/* 전문가 상담 신청 */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--accent-glow), var(--surface))",
          border: "1px solid var(--accent)",
          borderRadius: 16,
          padding: "24px",
          marginBottom: 16,
          marginTop: 8,
        }}
      >
        {consultStatus === "done" ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>신청이 완료되었습니다</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              영업일 기준 1일 이내에 연락드리겠습니다.
            </div>
          </div>
        ) : !showConsult ? (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => setShowConsult(true)}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              절차가 복잡하신가요?
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 }}>
              상속세 신고, 상속포기 등 전문가 도움이 필요하시면 무료로 상담 연결해드립니다.
            </div>
            <button
              style={{
                width: "100%",
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              전문가 상담 신청 (무료)
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
              전문가 상담 신청
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="text"
                placeholder="이름 *"
                value={consultForm.name}
                onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 14,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--text)",
                }}
              />
              <input
                type="tel"
                placeholder="연락처 * (예: 010-1234-5678)"
                value={consultForm.phone}
                onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 14,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--text)",
                }}
              />
              <select
                value={consultForm.needs}
                onChange={(e) => setConsultForm({ ...consultForm, needs: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 14,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: consultForm.needs ? "var(--text)" : "var(--text-dim)",
                }}
              >
                <option value="">필요한 서비스 선택</option>
                <option value="상속세 신고">상속세 신고</option>
                <option value="상속포기/한정승인">상속포기 / 한정승인</option>
                <option value="부동산 상속등기">부동산 상속등기</option>
                <option value="재산 조회/정리">재산 조회 / 정리</option>
                <option value="기타">기타</option>
              </select>
              <textarea
                placeholder="상황을 간단히 알려주세요 (선택)"
                value={consultForm.detail}
                onChange={(e) => setConsultForm({ ...consultForm, detail: e.target.value })}
                rows={3}
                style={{
                  padding: "12px 14px",
                  fontSize: 14,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--text)",
                  resize: "vertical",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowConsult(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: 14,
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--text-dim)",
                    cursor: "pointer",
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleConsultSubmit}
                  disabled={!consultForm.name || !consultForm.phone || consultStatus === "sending"}
                  style={{
                    flex: 2,
                    padding: "12px",
                    fontSize: 14,
                    fontWeight: 600,
                    background:
                      consultForm.name && consultForm.phone
                        ? "linear-gradient(135deg, var(--accent), var(--accent-hover))"
                        : "var(--surface-hover)",
                    color: consultForm.name && consultForm.phone ? "#fff" : "var(--text-dim)",
                    border: "none",
                    borderRadius: 10,
                    cursor: consultForm.name && consultForm.phone ? "pointer" : "not-allowed",
                  }}
                >
                  {consultStatus === "sending" ? "전송 중..." : "신청하기"}
                </button>
              </div>
              {consultStatus === "error" && (
                <div style={{ fontSize: 12, color: "var(--danger)", textAlign: "center" }}>
                  전송에 실패했습니다. 잠시 후 다시 시도해주세요.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 링크 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        <a href="/subscriptions" className="link-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 3,
                  color: "var(--text)",
                }}
              >
                구독/계정 해지 가이드
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                고인 명의의 구독 서비스와 디지털 계정 정리
              </div>
            </div>
            <span style={{ color: "var(--text-dim)", fontSize: 16 }}>›</span>
          </div>
        </a>

        <a href="/guides" className="link-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 3,
                  color: "var(--text)",
                }}
              >
                절차별 상세 가이드
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                사망신고, 상속포기, 안심상속 등 상세 안내
              </div>
            </div>
            <span style={{ color: "var(--text-dim)", fontSize: 16 }}>›</span>
          </div>
        </a>
      </div>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 20,
          marginTop: 32,
          fontSize: 11,
          color: "var(--text-dim)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        <p>
          본 서비스는 일반적인 정보 제공 목적이며, 법률·세무 자문을 대체하지
          않습니다.
        </p>
        <p style={{ marginTop: 4 }}>
          © 2026 사후(SAHU). 모든 데이터는 브라우저에만 저장됩니다.
        </p>
      </footer>
    </main>
  );
}
