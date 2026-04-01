// 상속재산분할협의서 유틸리티

// 관계 표시 매핑
export const RELATION_OPTIONS = [
  { value: "spouse", label: "배우자", display: "처" },
  { value: "spouse_m", label: "배우자(남)", display: "부" },
  { value: "son", label: "아들", display: "자" },
  { value: "daughter", label: "딸", display: "자" },
  { value: "father", label: "아버지", display: "부" },
  { value: "mother", label: "어머니", display: "모" },
  { value: "sibling", label: "형제/자매", display: "형제" },
];

export const ASSET_TYPE_OPTIONS = [
  { value: "real_estate", label: "부동산" },
  { value: "bank_account", label: "예금/적금" },
  { value: "stock", label: "주식" },
  { value: "vehicle", label: "자동차" },
  { value: "other", label: "기타" },
];

// 주민등록번호 Mod-11 검증
export function validateRRN(rrn) {
  const cleaned = rrn.replace(/-/g, "");
  if (!/^\d{13}$/.test(cleaned)) return false;

  const digits = cleaned.split("").map(Number);
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights[i];
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === digits[12];
}

// 숫자 → 한글 금액 변환
export function numberToKorean(num) {
  if (!num || isNaN(num)) return "";
  const n = parseInt(num, 10);
  if (n === 0) return "영";

  const units = ["", "만", "억", "조"];
  const digits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  const subUnits = ["", "십", "백", "천"];

  let result = "";
  let unitIndex = 0;
  let remaining = n;

  while (remaining > 0) {
    const chunk = remaining % 10000;
    if (chunk > 0) {
      let chunkStr = "";
      let c = chunk;
      for (let i = 0; i < 4 && c > 0; i++) {
        const d = c % 10;
        if (d > 0) {
          chunkStr = digits[d] + subUnits[i] + chunkStr;
        }
        c = Math.floor(c / 10);
      }
      result = chunkStr + units[unitIndex] + result;
    }
    remaining = Math.floor(remaining / 10000);
    unitIndex++;
  }

  return "금" + result + "원";
}

// 상속인 목록 서술형 텍스트 생성
export function buildHeirsText(heirs) {
  return heirs
    .map((h) => {
      const rel = RELATION_OPTIONS.find((r) => r.value === h.relation);
      return `${rel?.display || ""} ${h.name}`;
    })
    .join(", ");
}

// 재산 항목 서술형 텍스트 생성
export function buildAssetText(asset, heirs) {
  const owner = heirs.find((h) => h.id === asset.assignedHeirId);
  const ownerName = owner?.name || "";

  switch (asset.type) {
    case "bank_account": {
      const amountNum = parseInt(asset.amount, 10);
      const korean = numberToKorean(amountNum);
      return `${asset.bankName} ${asset.accountNumber} ${asset.description || "예금"} ${amountNum ? amountNum.toLocaleString() + "원 (" + korean + ")" : "전액"}은(는) ${ownerName}의 소유로 한다.`;
    }
    case "vehicle":
      return `${asset.description}은(는) ${ownerName}의 소유로 한다.`;
    case "stock":
      return `${asset.description}은(는) ${ownerName}의 소유로 한다.`;
    case "real_estate":
      return `${asset.description}은(는) ${ownerName}의 소유로 한다.`;
    default:
      return `${asset.description}은(는) ${ownerName}의 소유로 한다.`;
  }
}

// 초기 상태
export function createInitialFormData() {
  return {
    deceased: {
      name: "",
      rrn: "",
      date_of_death: "",
      death_place: "",
      registered_domicile: "",
      last_resident_address: "",
    },
    heirs: [{ id: "h_1", name: "", rrn: "", address: "", relation: "", phone: "" }],
    exceptions: {
      hasMinor: null,
      hasForeigner: null,
      hasMissing: null,
      hasWill: null,
      wantsJoint: null,
    },
    assets: [{ id: "a_1", type: "bank_account", description: "", assignedHeirId: "", bankName: "", accountNumber: "", amount: "" }],
    document: { agreement_date: "" },
  };
}
