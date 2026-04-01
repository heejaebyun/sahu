"use client";

import { useState, useCallback, useEffect } from "react";
import {
  validateRRN,
  RELATION_OPTIONS,
  ASSET_TYPE_OPTIONS,
  createInitialFormData,
  buildHeirsText,
  buildAssetText,
} from "@/lib/agreement-utils";

const MAX_HEIRS = 5;
const MAX_ASSETS = 5;

// ── 공통 스타일 ──
const containerStyle = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "32px 20px 80px",
  fontFamily: "var(--font-geist-sans), -apple-system, 'Segoe UI', sans-serif",
  color: "#1e293b",
  background: "#ffffff",
  minHeight: "100vh",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 15,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  color: "#1e293b",
  background: "#ffffff",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  cursor: "pointer",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 100,
};

const btnPrimary = {
  width: "100%",
  padding: "16px",
  fontSize: 15,
  fontWeight: 700,
  background: "#0f172a",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  letterSpacing: "0.02em",
};

const btnSecondary = {
  ...btnPrimary,
  background: "transparent",
  color: "#64748b",
  border: "1px solid #e2e8f0",
};

const btnDisabled = {
  ...btnPrimary,
  background: "#e2e8f0",
  color: "#94a3b8",
  cursor: "not-allowed",
};

const errorStyle = {
  fontSize: 12,
  color: "#dc2626",
  marginTop: 4,
};

const warningBoxStyle = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  padding: "16px",
  marginBottom: 16,
};

const sectionTitle = {
  fontSize: 20,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 8,
  letterSpacing: "-0.02em",
};

const sectionDesc = {
  fontSize: 14,
  color: "#64748b",
  marginBottom: 28,
  lineHeight: 1.6,
};

const stepIndicator = (current, total) => ({
  fontSize: 12,
  color: "#94a3b8",
  marginBottom: 8,
  fontWeight: 500,
});

// ── 메인 컴포넌트 ──
export default function AgreementPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(createInitialFormData());
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentClicked, setPaymentClicked] = useState(false);

  // localStorage 자동 저장/복원
  useEffect(() => {
    const saved = localStorage.getItem("sahu-agreement");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.step) setStep(parsed.step);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "sahu-agreement",
      JSON.stringify({ formData, step })
    );
  }, [formData, step]);

  // 결제 버튼 클릭 카운팅
  const handlePaymentClick = async () => {
    setPaymentClicked(true);
    try {
      await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.deceased.name + " 건 (결제 의향)",
          phone: formData.heirs[0]?.phone || "미입력",
          deathDate: formData.deceased.date_of_death,
          needs: "분할협의서 결제 클릭",
          detail: `상속인 ${formData.heirs.length}명, 재산 ${formData.assets.length}건`,
        }),
      });
    } catch {}
  };

  // ── Step 1: 고인 정보 ──
  const updateDeceased = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      deceased: { ...prev.deceased, [field]: value },
    }));
    if (errors[`dec_${field}`]) {
      setErrors((prev) => ({ ...prev, [`dec_${field}`]: null }));
    }
  };

  const validateStep1 = () => {
    const e = {};
    const d = formData.deceased;
    if (!d.name.trim()) e.dec_name = "필수 입력";
    if (!d.rrn.trim()) e.dec_rrn = "필수 입력";
    else if (!validateRRN(d.rrn)) e.dec_rrn = "유효하지 않은 주민등록번호입니다";
    if (!d.date_of_death) e.dec_date_of_death = "필수 입력";
    if (!d.last_resident_address.trim()) e.dec_last_address = "필수 입력";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 2: 상속인 ──
  const addHeir = () => {
    if (formData.heirs.length >= MAX_HEIRS) return;
    setFormData((prev) => ({
      ...prev,
      heirs: [
        ...prev.heirs,
        { id: `h_${Date.now()}`, name: "", rrn: "", address: "", relation: "", phone: "" },
      ],
    }));
  };

  const removeHeir = (id) => {
    if (formData.heirs.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      heirs: prev.heirs.filter((h) => h.id !== id),
      assets: prev.assets.map((a) =>
        a.assignedHeirId === id ? { ...a, assignedHeirId: "" } : a
      ),
    }));
  };

  const updateHeir = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      heirs: prev.heirs.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    }));
  };

  const validateStep2 = () => {
    const e = {};
    formData.heirs.forEach((h, i) => {
      if (!h.name.trim()) e[`heir_name_${i}`] = "필수";
      if (!h.rrn.trim()) e[`heir_rrn_${i}`] = "필수";
      else if (!validateRRN(h.rrn)) e[`heir_rrn_${i}`] = "유효하지 않은 주민등록번호";
      if (!h.relation) e[`heir_rel_${i}`] = "필수";
      if (!h.address.trim()) e[`heir_addr_${i}`] = "필수";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 3: 예외 감지 ──
  const updateException = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      exceptions: { ...prev.exceptions, [field]: value },
    }));
  };

  const hasException = Object.values(formData.exceptions).some((v) => v === true);
  const allAnswered = Object.values(formData.exceptions).every((v) => v !== null);

  // ── Step 4: 재산 매핑 ──
  const addAsset = () => {
    if (formData.assets.length >= MAX_ASSETS) return;
    setFormData((prev) => ({
      ...prev,
      assets: [
        ...prev.assets,
        { id: `a_${Date.now()}`, type: "bank_account", description: "", assignedHeirId: "", bankName: "", accountNumber: "", amount: "" },
      ],
    }));
  };

  const removeAsset = (id) => {
    if (formData.assets.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));
  };

  const updateAsset = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  };

  const validateStep4 = () => {
    const e = {};
    formData.assets.forEach((a, i) => {
      if (!a.description.trim() && a.type === "real_estate") e[`asset_desc_${i}`] = "필수";
      if (a.type === "bank_account" && !a.bankName.trim()) e[`asset_bank_${i}`] = "필수";
      if (!a.assignedHeirId) e[`asset_owner_${i}`] = "상속인을 선택하세요";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 5: 프리뷰 + 결제 ──
  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const today = new Date();
      const agreementDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      const res = await fetch("/api/generate-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, document: { agreement_date: agreementDate }, isPreview: true }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "문서 생성에 실패했습니다. 입력 내용을 확인해 주세요.");
      }
    } catch {
      alert("문서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
    setIsGenerating(false);
  };

  const nextStep = () => {
    let valid = true;
    if (step === 1) valid = validateStep1();
    if (step === 2) valid = validateStep2();
    if (step === 4) valid = validateStep4();
    if (valid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <main style={containerStyle}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <a href="/landing" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.15em", color: "#0f172a", textDecoration: "none" }}>
          SAHU
        </a>
      </div>

      {/* 진행 바 */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: s <= step ? "#0f172a" : "#e2e8f0",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {/* ── Step 1: 고인 정보 ── */}
      {step === 1 && (
        <div>
          <p style={stepIndicator(1, 5)}>1 / 5</p>
          <h2 style={sectionTitle}>고인 정보</h2>
          <p style={sectionDesc}>
            기본증명서(상세)와 말소자초본에 기재된 내용을 정확히 입력해 주세요.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={labelStyle}>성명</label>
              <input style={inputStyle} value={formData.deceased.name} onChange={(e) => updateDeceased("name", e.target.value)} placeholder="홍길동" />
              {errors.dec_name && <p style={errorStyle}>{errors.dec_name}</p>}
            </div>
            <div>
              <label style={labelStyle}>주민등록번호</label>
              <input style={inputStyle} value={formData.deceased.rrn} onChange={(e) => updateDeceased("rrn", e.target.value)} placeholder="000000-0000000" maxLength={14} />
              {errors.dec_rrn && <p style={errorStyle}>{errors.dec_rrn}</p>}
            </div>
            <div>
              <label style={labelStyle}>사망일</label>
              <input type="date" style={inputStyle} value={formData.deceased.date_of_death} onChange={(e) => updateDeceased("date_of_death", e.target.value)} />
              {errors.dec_date_of_death && <p style={errorStyle}>{errors.dec_date_of_death}</p>}
            </div>
            <div>
              <label style={labelStyle}>사망 장소</label>
              <input style={inputStyle} value={formData.deceased.death_place} onChange={(e) => updateDeceased("death_place", e.target.value)} placeholder="OO병원 / 자택 등" />
            </div>
            <div>
              <label style={labelStyle}>등록기준지 (본적)</label>
              <input style={inputStyle} value={formData.deceased.registered_domicile} onChange={(e) => updateDeceased("registered_domicile", e.target.value)} placeholder="기본증명서(상세)에 기재된 등록기준지" />
            </div>
            <div>
              <label style={labelStyle}>최후 주소</label>
              <input style={inputStyle} value={formData.deceased.last_resident_address} onChange={(e) => updateDeceased("last_resident_address", e.target.value)} placeholder="말소자초본에 기재된 최후 주소" />
              {errors.dec_last_address && <p style={errorStyle}>{errors.dec_last_address}</p>}
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <button onClick={nextStep} style={btnPrimary}>다음</button>
          </div>
        </div>
      )}

      {/* ── Step 2: 상속인 ── */}
      {step === 2 && (
        <div>
          <p style={stepIndicator(2, 5)}>2 / 5</p>
          <h2 style={sectionTitle}>상속인 정보</h2>
          <p style={sectionDesc}>
            상속인 전원을 빠짐없이 입력해 주세요. 1명이라도 누락되면 문서가 무효입니다.
          </p>

          {formData.heirs.map((heir, i) => (
            <div key={heir.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>상속인 {i + 1}</span>
                {formData.heirs.length > 1 && (
                  <button onClick={() => removeHeir(heir.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>삭제</button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>성명</label>
                  <input style={inputStyle} value={heir.name} onChange={(e) => updateHeir(heir.id, "name", e.target.value)} />
                  {errors[`heir_name_${i}`] && <p style={errorStyle}>{errors[`heir_name_${i}`]}</p>}
                </div>
                <div>
                  <label style={labelStyle}>고인과의 관계</label>
                  <select style={selectStyle} value={heir.relation} onChange={(e) => updateHeir(heir.id, "relation", e.target.value)}>
                    <option value="">선택</option>
                    {RELATION_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors[`heir_rel_${i}`] && <p style={errorStyle}>{errors[`heir_rel_${i}`]}</p>}
                </div>
                <div>
                  <label style={labelStyle}>주민등록번호</label>
                  <input style={inputStyle} value={heir.rrn} onChange={(e) => updateHeir(heir.id, "rrn", e.target.value)} placeholder="000000-0000000" maxLength={14} />
                  {errors[`heir_rrn_${i}`] && <p style={errorStyle}>{errors[`heir_rrn_${i}`]}</p>}
                </div>
                <div>
                  <label style={labelStyle}>주소</label>
                  <input style={inputStyle} value={heir.address} onChange={(e) => updateHeir(heir.id, "address", e.target.value)} />
                  {errors[`heir_addr_${i}`] && <p style={errorStyle}>{errors[`heir_addr_${i}`]}</p>}
                </div>
                <div>
                  <label style={labelStyle}>연락처</label>
                  <input style={inputStyle} value={heir.phone} onChange={(e) => updateHeir(heir.id, "phone", e.target.value)} placeholder="010-0000-0000" />
                </div>
              </div>
            </div>
          ))}

          {formData.heirs.length < MAX_HEIRS && (
            <button onClick={addHeir} style={{ ...btnSecondary, marginBottom: 16 }}>+ 상속인 추가</button>
          )}
          {formData.heirs.length >= MAX_HEIRS && (
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>상속인은 최대 {MAX_HEIRS}명까지 입력 가능합니다. 초과 시 전문가 상담을 권장합니다.</p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button onClick={prevStep} style={btnSecondary}>이전</button>
            <button onClick={nextStep} style={btnPrimary}>다음</button>
          </div>
        </div>
      )}

      {/* ── Step 3: 예외 감지 ── */}
      {step === 3 && (
        <div>
          <p style={stepIndicator(3, 5)}>3 / 5</p>
          <h2 style={sectionTitle}>사전 확인</h2>
          <p style={sectionDesc}>
            아래 항목에 해당하는 경우 자동 작성이 어려울 수 있습니다. 정확히 답변해 주세요.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "hasMinor", label: "상속인 중 미성년자(만 19세 미만)가 있습니까?" },
              { key: "hasForeigner", label: "상속인 중 해외 거주자 또는 외국 국적자가 있습니까?" },
              { key: "hasMissing", label: "상속인 중 연락이 닿지 않거나 행방불명인 사람이 있습니까?" },
              { key: "hasWill", label: "고인이 유언장을 남기셨습니까?" },
              { key: "wantsJoint", label: "하나의 재산을 여러 명이 지분으로 나눠 소유하려 합니까?" },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  padding: "16px 18px",
                  background: formData.exceptions[item.key] === true ? "#fef2f2" : formData.exceptions[item.key] === false ? "#f0fdf4" : "#f8fafc",
                  border: `1px solid ${formData.exceptions[item.key] === true ? "#fecaca" : formData.exceptions[item.key] === false ? "#bbf7d0" : "#e2e8f0"}`,
                  borderRadius: 10,
                }}
              >
                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.5, marginBottom: 12 }}>
                  {item.label}
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: formData.exceptions[item.key] === false ? "#16a34a" : "#64748b", fontWeight: formData.exceptions[item.key] === false ? 700 : 400 }}>
                    <input
                      type="radio"
                      name={item.key}
                      checked={formData.exceptions[item.key] === false}
                      onChange={() => updateException(item.key, false)}
                      style={{ accentColor: "#16a34a", width: 18, height: 18 }}
                    />
                    아니오
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: formData.exceptions[item.key] === true ? "#dc2626" : "#64748b", fontWeight: formData.exceptions[item.key] === true ? 700 : 400 }}>
                    <input
                      type="radio"
                      name={item.key}
                      checked={formData.exceptions[item.key] === true}
                      onChange={() => updateException(item.key, true)}
                      style={{ accentColor: "#dc2626", width: 18, height: 18 }}
                    />
                    예
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* 경고창: 하나라도 "예" 있을 때 하단에 1개만 표시 */}
          {hasException && (
            <div style={{ ...warningBoxStyle, marginTop: 24 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>
                자동 작성이 어려운 케이스입니다.
              </p>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>
                위 항목에 해당하는 경우, 특별대리인 선임이나 공증 등 추가 절차가 필요할 수 있습니다.
                정확한 처리를 위해 상속 전문가의 상담을 권장합니다.
              </p>
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 16 }}>
                  전문가 상담 신청 (무료)
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    style={inputStyle}
                    placeholder="성함"
                    value={formData.consultName || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, consultName: e.target.value }))}
                  />
                  <input
                    style={inputStyle}
                    placeholder="연락처 (010-0000-0000)"
                    value={formData.consultPhone || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, consultPhone: e.target.value }))}
                  />
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                    placeholder="상황을 간단히 알려주세요 (선택)"
                    value={formData.consultDetail || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, consultDetail: e.target.value }))}
                  />
                  <button
                    onClick={async () => {
                      if (!formData.consultName || !formData.consultPhone) {
                        alert("성함과 연락처를 입력해 주세요.");
                        return;
                      }
                      const checkedItems = Object.entries(formData.exceptions)
                        .filter(([, v]) => v === true)
                        .map(([k]) => {
                          const labels = { hasMinor: "미성년자", hasForeigner: "해외거주자", hasMissing: "행방불명", hasWill: "유언장", wantsJoint: "지분분할" };
                          return labels[k] || k;
                        })
                        .join(", ");
                      try {
                        await fetch("/api/consult", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: formData.consultName,
                            phone: formData.consultPhone,
                            deathDate: formData.deceased.date_of_death,
                            needs: "분할협의서 예외 케이스: " + checkedItems,
                            detail: formData.consultDetail || "",
                          }),
                        });
                        alert("상담 신청이 접수되었습니다. 24시간 내에 연락드리겠습니다.");
                      } catch {
                        alert("신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                      }
                    }}
                    style={btnPrimary}
                  >
                    상담 신청하기
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={prevStep} style={btnSecondary}>이전</button>
            <button
              onClick={nextStep}
              disabled={!allAnswered || hasException}
              style={!allAnswered || hasException ? btnDisabled : btnPrimary}
            >
              {!allAnswered ? "모든 항목에 답변해 주세요" : hasException ? "해당 사항이 있어 진행할 수 없습니다" : "다음"}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: 재산 매핑 ── */}
      {step === 4 && (
        <div>
          <p style={stepIndicator(4, 5)}>4 / 5</p>
          <h2 style={sectionTitle}>상속 재산 배분</h2>
          <p style={sectionDesc}>
            분할할 재산을 입력하고, 각 재산을 단독으로 상속받을 사람을 지정해 주세요.
          </p>

          {formData.assets.map((asset, i) => (
            <div key={asset.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>재산 {i + 1}</span>
                {formData.assets.length > 1 && (
                  <button onClick={() => removeAsset(asset.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>삭제</button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>재산 유형</label>
                  <select style={selectStyle} value={asset.type} onChange={(e) => updateAsset(asset.id, "type", e.target.value)}>
                    {ASSET_TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {asset.type === "real_estate" && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>
                      부동산 표시 입력 주의
                    </p>
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12, lineHeight: 1.6 }}>
                      도로명 주소를 임의로 입력하지 마세요. 반드시 등기부등본 표제부에 기재된 소재지번, 건물명, 동/호수를 띄어쓰기까지 똑같이 입력해야 등기소에서 반려되지 않습니다.
                    </p>
                    <textarea
                      style={textareaStyle}
                      value={asset.description}
                      onChange={(e) => updateAsset(asset.id, "description", e.target.value)}
                      placeholder={"예) 서울특별시 서초구 법원로3길 00\n[건물내역] 철근콘크리트구조 제000동 제000호 84.5㎡"}
                    />
                    {errors[`asset_desc_${i}`] && <p style={errorStyle}>{errors[`asset_desc_${i}`]}</p>}
                  </div>
                )}

                {asset.type === "bank_account" && (
                  <>
                    <div>
                      <label style={labelStyle}>은행명</label>
                      <input style={inputStyle} value={asset.bankName} onChange={(e) => updateAsset(asset.id, "bankName", e.target.value)} placeholder="국민은행" />
                      {errors[`asset_bank_${i}`] && <p style={errorStyle}>{errors[`asset_bank_${i}`]}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>계좌번호</label>
                      <input style={inputStyle} value={asset.accountNumber} onChange={(e) => updateAsset(asset.id, "accountNumber", e.target.value)} placeholder="123-456-789012" />
                    </div>
                    <div>
                      <label style={labelStyle}>금액 (원)</label>
                      <input style={inputStyle} type="number" value={asset.amount} onChange={(e) => updateAsset(asset.id, "amount", e.target.value)} placeholder="50000000" />
                    </div>
                  </>
                )}

                {(asset.type === "vehicle" || asset.type === "stock" || asset.type === "other") && (
                  <div>
                    <label style={labelStyle}>상세 내용</label>
                    <textarea
                      style={textareaStyle}
                      value={asset.description}
                      onChange={(e) => updateAsset(asset.id, "description", e.target.value)}
                      placeholder={
                        asset.type === "vehicle" ? "예) 제네시스 G90 (107서1265)" :
                        asset.type === "stock" ? "예) 주식회사 OO 주식 10,000주 (액면가 5,000원)" :
                        "재산 내용을 상세히 입력하세요"
                      }
                    />
                  </div>
                )}

                <div>
                  <label style={labelStyle}>이 재산을 상속받을 사람</label>
                  <select
                    style={selectStyle}
                    value={asset.assignedHeirId}
                    onChange={(e) => updateAsset(asset.id, "assignedHeirId", e.target.value)}
                  >
                    <option value="">선택하세요</option>
                    {formData.heirs.map((h) => {
                      const rel = RELATION_OPTIONS.find((r) => r.value === h.relation);
                      return (
                        <option key={h.id} value={h.id}>
                          {h.name} ({rel?.label || ""})
                        </option>
                      );
                    })}
                  </select>
                  {errors[`asset_owner_${i}`] && <p style={errorStyle}>{errors[`asset_owner_${i}`]}</p>}
                </div>
              </div>
            </div>
          ))}

          {formData.assets.length < MAX_ASSETS && (
            <button onClick={addAsset} style={{ ...btnSecondary, marginBottom: 16 }}>+ 재산 추가</button>
          )}
          {formData.assets.length >= MAX_ASSETS && (
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>재산은 최대 {MAX_ASSETS}개까지 입력 가능합니다.</p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button onClick={prevStep} style={btnSecondary}>이전</button>
            <button onClick={nextStep} style={btnPrimary}>다음</button>
          </div>
        </div>
      )}

      {/* ── Step 5: 프리뷰 + 결제 ── */}
      {step === 5 && (
        <div>
          <p style={stepIndicator(5, 5)}>5 / 5</p>
          <h2 style={sectionTitle}>입력 내용 확인</h2>
          <p style={sectionDesc}>
            아래 내용을 확인한 후 문서를 생성합니다. 생성된 문서는 제출용 초안이며, 기관에 따라 추가 증빙이 요구될 수 있습니다.
          </p>

          {/* 고인 요약 */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#334155" }}>고인 정보</h3>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 2 }}>
              <div>성명: {formData.deceased.name}</div>
              <div>주민등록번호: {formData.deceased.rrn}</div>
              <div>사망일: {formData.deceased.date_of_death}</div>
              <div>최후 주소: {formData.deceased.last_resident_address}</div>
            </div>
          </div>

          {/* 상속인 요약 */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#334155" }}>상속인 ({formData.heirs.length}명)</h3>
            {formData.heirs.map((h, i) => {
              const rel = RELATION_OPTIONS.find((r) => r.value === h.relation);
              return (
                <div key={h.id} style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>
                  {i + 1}. {rel?.display || ""} {h.name} ({h.rrn})
                </div>
              );
            })}
          </div>

          {/* 재산 요약 */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#334155" }}>재산 배분 ({formData.assets.length}건)</h3>
            {formData.assets.map((a, i) => (
              <div key={a.id} style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>
                {i + 1}. {buildAssetText(a, formData.heirs)}
              </div>
            ))}
          </div>

          {/* 면책 */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 12, color: "#92400e", lineHeight: 1.7 }}>
            본 서비스는 사용자가 입력한 데이터를 바탕으로 제출용 초안 문서를 생성하는 서식 자동 완성 서비스입니다. 법률 상담이나 대리 행위를 수행하지 않습니다. 입력 데이터의 정확성에 대한 책임은 사용자에게 있으며, 특수한 법적 쟁점이 있는 경우 전문가의 도움을 받으시기 바랍니다.
          </div>

          {/* 가격 */}
          {!pdfUrl && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through" }}>79,000원</span>
                <span style={{ fontSize: 11, color: "#d97706", fontWeight: 700, marginLeft: 8 }}>베타 할인</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a" }}>
                49,900<span style={{ fontSize: 16, color: "#64748b" }}>원</span>
              </div>
            </div>
          )}

          {!paymentClicked && !pdfUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                style={btnSecondary}
              >
                {isGenerating ? "미리보기 생성 중..." : "미리보기 확인하기 (무료)"}
              </button>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={prevStep} style={btnSecondary}>이전</button>
                <button
                  onClick={handlePaymentClick}
                  style={btnPrimary}
                >
                  결제하고 원본 받기 (49,900원)
                </button>
              </div>
            </div>
          )}

          {/* 결제 클릭 후 — 시스템 점검 메시지 (결제 의향 카운팅) */}
          {paymentClicked && (
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: 24, marginTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>🔧</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
                결제 시스템 준비 중입니다
              </h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 16 }}>
                현재 결제 시스템을 점검 중입니다. 빠른 시일 내에 오픈 예정입니다.
                <br />아래 미리보기를 통해 문서를 먼저 확인하실 수 있습니다.
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>
                문의: sahu.kr@gmail.com
              </p>
              {!pdfUrl && (
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  style={{ ...btnPrimary, marginTop: 16 }}
                >
                  {isGenerating ? "미리보기 생성 중..." : "미리보기 확인하기"}
                </button>
              )}
            </div>
          )}

          {/* PDF 다운로드 */}
          {pdfUrl && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12, color: "#16a34a" }}>✓</div>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>문서가 생성되었습니다</p>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                아래 버튼으로 미리보기를 확인하세요. 입금 확인 후 최종 문서를 전달드립니다.
              </p>
              <a
                href={pdfUrl}
                download="상속재산분할협의서_초안.pdf"
                style={{ ...btnPrimary, display: "inline-block", textDecoration: "none", textAlign: "center" }}
              >
                PDF 다운로드
              </a>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
