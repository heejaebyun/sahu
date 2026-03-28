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
          background: "#ef444420",
          color: "#ef4444",
          padding: "2px 8px",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        기한 초과 {Math.abs(remaining)}일
      </span>
    );
  }
  if (remaining <= 14) {
    return (
      <span
        style={{
          background: "#eab30820",
          color: "#eab308",
          padding: "2px 8px",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        D-{remaining}
      </span>
    );
  }
  return (
    <span
      style={{
        background: "#3b82f620",
        color: "#3b82f6",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
      }}
    >
      D-{remaining}
    </span>
  );
}

function CheckItem({ item, checked, onToggle, diffDays }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: checked ? "#0d1a0d" : "#12121a",
        border: `1px solid ${checked ? "#22c55e30" : "#222233"}`,
        borderRadius: 8,
        padding: "16px",
        marginBottom: 8,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
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
          style={{
            width: 20,
            height: 20,
            marginTop: 2,
            accentColor: "#22c55e",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
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
                fontSize: 15,
                fontWeight: 600,
                textDecoration: checked ? "line-through" : "none",
                color: checked ? "#555566" : "#e0e0e8",
              }}
            >
              {item.title}
            </span>
            {item.critical && !checked && (
              <span
                style={{
                  background: "#ef444420",
                  color: "#ef4444",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                필수
              </span>
            )}
            <DeadlineBadge item={item} diffDays={diffDays} deathDate={deathDate} />
          </div>
          <p
            style={{
              color: "#8888a0",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {item.description}
          </p>
        </div>
        <span
          style={{
            color: "#555566",
            fontSize: 18,
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 16,
            marginLeft: 32,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{ fontSize: 12, color: "#555566", marginBottom: 4, fontWeight: 600 }}
            >
              어디서
            </div>
            <div style={{ fontSize: 14, color: "#8888a0" }}>{item.where}</div>
          </div>

          <div>
            <div
              style={{ fontSize: 12, color: "#555566", marginBottom: 4, fontWeight: 600 }}
            >
              필요 서류
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {item.documents.map((doc) => (
                <li
                  key={doc}
                  style={{ fontSize: 14, color: "#8888a0" }}
                >
                  · {doc}
                </li>
              ))}
            </ul>
          </div>

          {item.tips.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#555566",
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                참고사항
              </div>
              {item.tips.map((tip) => (
                <p
                  key={tip}
                  style={{
                    fontSize: 13,
                    color: tip.startsWith("\u26A0\uFE0F") ? "#eab308" : "#8888a0",
                    marginBottom: 4,
                    lineHeight: 1.5,
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
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#8888a0",
          marginBottom: 6,
        }}
      >
        <span>진행률</span>
        <span>
          {checked}/{total} 완료 ({pct}%)
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "#1a1a26",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct === 100 ? "#22c55e" : "#7b9fff",
            borderRadius: 4,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function DatePicker({ value, onChange }) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

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

  // 값 복원
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
    fontSize: 16,
    background: "#0a0a0f",
    border: "1px solid #222233",
    borderRadius: 8,
    color: "#e0e0e8",
    appearance: "none",
    textAlign: "center",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      <select value={year} onChange={(e) => setYear(e.target.value)} style={selectStyle}>
        <option value="">년</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}년</option>
        ))}
      </select>
      <select value={month} onChange={(e) => { setMonth(e.target.value); setDay(""); }} style={selectStyle}>
        <option value="">월</option>
        {months.map((m) => (
          <option key={m} value={m}>{m}월</option>
        ))}
      </select>
      <select value={day} onChange={(e) => setDay(e.target.value)} style={selectStyle}>
        <option value="">일</option>
        {days.map((d) => (
          <option key={d} value={d}>{d}일</option>
        ))}
      </select>
    </div>
  );
}

export default function Home() {
  const [deathDate, setDeathDate] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [started, setStarted] = useState(false);

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
    const text = "사후(SAHU) — 사망 후 행정 처리 가이드\n해야 할 일을 단계별로 안내합니다.";
    if (navigator.share) {
      try {
        await navigator.share({ title: "사후(SAHU)", text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert("링크가 복사되었습니다.");
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

  if (!started) {
    return (
      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          사후(SAHU)
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#8888a0",
            marginBottom: 48,
            lineHeight: 1.7,
          }}
        >
          가족을 잃은 후 해야 할 행정 절차를
          <br />
          단계별로 안내합니다.
        </p>

        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 12,
            padding: "32px 24px",
            marginBottom: 24,
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: 14,
              color: "#8888a0",
              marginBottom: 12,
            }}
          >
            사망일을 입력해주세요
          </label>
          <DatePicker value={deathDate} onChange={setDeathDate} />
          <button
            onClick={handleStart}
            disabled={!deathDate}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: 16,
              fontWeight: 600,
              background: deathDate ? "#7b9fff" : "#333",
              color: deathDate ? "#000" : "#666",
              border: "none",
              borderRadius: 8,
              cursor: deathDate ? "pointer" : "not-allowed",
            }}
          >
            시작하기
          </button>
        </div>

        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 12,
            padding: "20px 24px",
            textAlign: "left",
          }}
        >
          <div
            style={{ fontSize: 13, color: "#555566", marginBottom: 12, fontWeight: 600 }}
          >
            이 서비스가 도와드리는 것
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 14,
              color: "#8888a0",
            }}
          >
            <li>· 사망신고부터 상속세까지 전체 절차 안내</li>
            <li>· 기한이 있는 항목 D-day 자동 계산</li>
            <li>· 각 절차별 필요 서류 및 방문처 안내</li>
            <li>· 진행 상황 체크리스트로 관리</li>
            <li>· 모든 데이터는 브라우저에만 저장 (개인정보 수집 없음)</li>
          </ul>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#555566",
            marginTop: 32,
          }}
        >
          본 서비스는 일반적인 정보 제공 목적이며, 법률·세무 자문을 대체하지 않습니다.
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>사후(SAHU)</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleShare}
            style={{
              background: "none",
              border: "1px solid #7b9fff40",
              color: "#7b9fff",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            공유하기
          </button>
          <button
            onClick={handleReset}
            style={{
              background: "none",
              border: "1px solid #333",
              color: "#555566",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            초기화
          </button>
        </div>
      </header>

      <p style={{ fontSize: 13, color: "#555566", marginBottom: 24 }}>
        사망일: {deathDate} · 경과일: {diffDays}일
      </p>

      <ProgressBar checked={checkedCount} total={CHECKLIST.length} />

      {CHECKLIST.filter(
        (item) =>
          item.deadline &&
          !checkedItems[item.id] &&
          diffDays !== undefined &&
          getRemainingDays(item, diffDays, deathDate) >= 0 &&
          getRemainingDays(item, diffDays, deathDate) <= 14
      ).length > 0 && (
        <div
          style={{
            background: "#eab30810",
            border: "1px solid #eab30830",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#eab308",
              marginBottom: 4,
            }}
          >
            기한 임박 항목
          </div>
          {CHECKLIST.filter(
            (item) =>
              item.deadline &&
              !checkedItems[item.id] &&
              diffDays !== undefined &&
              getRemainingDays(item, diffDays, deathDate) >= 0 &&
              getRemainingDays(item, diffDays, deathDate) <= 14
          ).map((item) => (
            <div
              key={item.id}
              style={{ fontSize: 13, color: "#eab308", marginTop: 4 }}
            >
              · {item.title} — D-{getRemainingDays(item, diffDays, deathDate)}
            </div>
          ))}
        </div>
      )}

      {CHECKLIST.filter(
        (item) =>
          item.deadline &&
          !checkedItems[item.id] &&
          diffDays !== undefined &&
          getRemainingDays(item, diffDays, deathDate) < 0
      ).length > 0 && (
        <div
          style={{
            background: "#ef444410",
            border: "1px solid #ef444430",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#ef4444",
              marginBottom: 4,
            }}
          >
            기한 초과 항목
          </div>
          {CHECKLIST.filter(
            (item) =>
              item.deadline &&
              !checkedItems[item.id] &&
              diffDays !== undefined &&
              getRemainingDays(item, diffDays, deathDate) < 0
          ).map((item) => (
            <div
              key={item.id}
              style={{ fontSize: 13, color: "#ef4444", marginTop: 4 }}
            >
              · {item.title} — {Math.abs(getRemainingDays(item, diffDays, deathDate))}일 초과
            </div>
          ))}
        </div>
      )}

      {CATEGORIES.map((category) => {
        const items = CHECKLIST.filter((item) => item.category === category.id);
        if (items.length === 0) return null;
        const catChecked = items.filter((i) => checkedItems[i.id]).length;

        return (
          <section key={category.id} style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: category.color,
                  flexShrink: 0,
                }}
              />
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>
                {category.label}
              </h2>
              <span style={{ fontSize: 12, color: "#555566" }}>
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
              />
            ))}
          </section>
        );
      })}

      <a
        href="/subscriptions"
        style={{
          display: "block",
          background: "#12121a",
          border: "1px solid #222233",
          borderRadius: 8,
          padding: "16px 20px",
          marginTop: 8,
          marginBottom: 8,
          textDecoration: "none",
          color: "#e0e0e8",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          구독/계정 해지 가이드 →
        </div>
        <div style={{ fontSize: 13, color: "#8888a0" }}>
          고인 명의의 구독 서비스와 디지털 계정을 정리하세요
        </div>
      </a>

      <a
        href="/guides"
        style={{
          display: "block",
          background: "#12121a",
          border: "1px solid #222233",
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 8,
          textDecoration: "none",
          color: "#e0e0e8",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          절차별 상세 가이드 →
        </div>
        <div style={{ fontSize: 13, color: "#8888a0" }}>
          사망신고, 상속포기, 안심상속 등 항목별 상세 안내
        </div>
      </a>

      <footer
        style={{
          borderTop: "1px solid #222233",
          paddingTop: 24,
          marginTop: 24,
          fontSize: 12,
          color: "#555566",
          textAlign: "center",
        }}
      >
        <p>
          본 서비스는 일반적인 정보 제공 목적이며, 법률·세무 자문을 대체하지
          않습니다.
        </p>
        <p style={{ marginTop: 4 }}>
          © 2026 SAHU. 모든 데이터는 브라우저에만 저장됩니다.
        </p>
      </footer>
    </main>
  );
}
