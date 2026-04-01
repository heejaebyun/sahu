import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Svg, Rect, G, Text as SvgText } from "@react-pdf/renderer";

// 명조체 폰트 등록 (법률 문서 권위감)
Font.register({
  family: "NanumMyeongjo",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/NanumMyeongjo.woff", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/NanumMyeongjoBold.woff", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NanumMyeongjo",
    fontSize: 11,
    padding: "60 50 60 50",
    lineHeight: 1.8,
    color: "#111111",
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 8,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.9,
    marginBottom: 20,
    textAlign: "justify",
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  assetItem: {
    fontSize: 11,
    lineHeight: 1.8,
    marginBottom: 10,
    paddingLeft: 8,
  },
  closingText: {
    fontSize: 11,
    lineHeight: 1.9,
    marginTop: 24,
    marginBottom: 30,
    textAlign: "justify",
  },
  dateText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 30,
    marginBottom: 40,
    fontWeight: 700,
  },
  signerSection: {
    marginTop: 20,
  },
  signerBlock: {
    marginBottom: 30,
    paddingBottom: 16,
    borderBottom: "1 solid #cccccc",
  },
  signerRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  signerLabel: {
    width: 100,
    fontSize: 11,
    lineHeight: 2,
  },
  signerValue: {
    flex: 1,
    fontSize: 11,
    lineHeight: 2,
  },
  signerNameRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  signerNameLabel: {
    width: 100,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 2,
  },
  signerNameValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 2,
  },
  sealMark: {
    fontSize: 10,
    color: "#888888",
  },
  disclaimer: {
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    marginTop: 40,
    lineHeight: 1.5,
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// 관계 매핑
const RELATION_MAP = {
  spouse: "처",
  spouse_m: "부",
  son: "자",
  daughter: "자",
  father: "부",
  mother: "모",
  sibling: "형제",
};

// 연락처 포맷팅 (000-0000-0000 강제)
function formatPhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// RRN 마스킹 (뒤 7자리)
function maskRRN(rrn, isPreview = false) {
  if (!isPreview || !rrn) return rrn;
  const cleaned = rrn.replace(/-/g, "");
  if (cleaned.length !== 13) return rrn;
  return cleaned.slice(0, 6) + "-*******";
}

// 숫자 → 한글 금액
function numberToKorean(num) {
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

// 재산 항목 텍스트 생성
function buildAssetLine(asset, heirs) {
  const owner = heirs.find((h) => h.id === asset.assignedHeirId);
  const ownerName = owner?.name || "";

  if (asset.type === "bank_account") {
    const amountNum = parseInt(asset.amount, 10);
    const amountStr = amountNum
      ? `${amountNum.toLocaleString()}원 (${numberToKorean(amountNum)})`
      : "전액";
    return `${asset.bankName || ""} ${asset.accountNumber || ""} 예금 ${amountStr}은(는) ${ownerName}의 소유로 한다.`;
  }

  return `${asset.description || ""}은(는) ${ownerName}의 소유로 한다.`;
}

// 워터마크 타일링 컴포넌트
function WatermarkOverlay() {
  const rows = 8;
  const cols = 3;
  const cellW = 200;
  const cellH = 100;

  return (
    <View style={styles.watermarkContainer}>
      <Svg width="595" height="842">
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <SvgText
              key={`wm-${r}-${c}`}
              x={c * cellW + 40}
              y={r * cellH + 60}
              fill="#cccccc"
              fillOpacity={0.25}
              fontSize={14}
              transform={`rotate(-30, ${c * cellW + 100}, ${r * cellH + 60})`}
            >
              미리보기 - SAHU
            </SvgText>
          ))
        )}
      </Svg>
    </View>
  );
}

export function AgreementDocument({ data, isPreview = false }) {
  const { deceased, heirs, assets, document: docInfo } = data;

  // 공동상속인 텍스트
  const heirsText = heirs
    .map((h) => `${RELATION_MAP[h.relation] || ""} ${h.name}`)
    .join(", ");

  const heirCount = heirs.length;
  const totalCopies = heirCount + 1;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 워터마크 타일링 (미리보기 전용) */}
        {isPreview && <WatermarkOverlay />}

        {/* 제목 */}
        <Text style={styles.title}>상속재산분할협의서</Text>

        {/* 도입부 서술형 문안 */}
        <Text style={styles.body}>
          {`피상속인 ${deceased.name}(${maskRRN(deceased.rrn, isPreview)}, ${deceased.last_resident_address})은(는) ${deceased.date_of_death}에 ${deceased.death_place || ""}에서 사망하였는바, 망 ${deceased.name}의 사망으로 인하여 상속이 개시되었고 이에 공동상속인으로서 ${heirsText}는 망 ${deceased.name}의 상속재산을 다음과 같이 분할하기로 협의한다.`}
        </Text>

        {/* 다 음 */}
        <Text style={styles.sectionHeader}>다 음</Text>

        {/* 재산 목록 */}
        {assets.map((asset, index) => (
          <Text key={asset.id || index} style={styles.assetItem}>
            {`${index + 1}. ${buildAssetLine(asset, heirs)}`}
          </Text>
        ))}

        {/* 마무리 문안 */}
        <Text style={styles.closingText}>
          {`위 협의를 증명하기 위하여 협의서 ${totalCopies}통(1통은 부동산등기신청 시 필요함)을 작성하고 각 공동상속인 전원은 아래와 같이 인감도장을 날인한 후 인감증명서를 첨부하여 각자 1통씩 보유한다.`}
        </Text>

        {/* 날짜 */}
        <Text style={styles.dateText}>{docInfo?.agreement_date || ""}</Text>

        {/* 상속인 서명란 (정렬된 레이아웃) */}
        <View style={styles.signerSection}>
          {heirs.map((heir, index) => (
            <View key={heir.id || index} style={styles.signerBlock}>
              <View style={styles.signerNameRow}>
                <Text style={styles.signerNameLabel}>성 명 :</Text>
                <Text style={styles.signerNameValue}>
                  {`${heir.name}  `}
                  <Text style={styles.sealMark}>(인감도장  인)</Text>
                </Text>
              </View>
              <View style={styles.signerRow}>
                <Text style={styles.signerLabel}>주민등록번호 :</Text>
                <Text style={styles.signerValue}>{maskRRN(heir.rrn, isPreview)}</Text>
              </View>
              <View style={styles.signerRow}>
                <Text style={styles.signerLabel}>주 소 :</Text>
                <Text style={styles.signerValue}>{heir.address}</Text>
              </View>
              <View style={styles.signerRow}>
                <Text style={styles.signerLabel}>연 락 처 :</Text>
                <Text style={styles.signerValue}>{formatPhone(heir.phone)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 하단 면책 */}
        <Text style={styles.disclaimer}>
          본 문서는 SAHU 서식 자동 완성 서비스를 통해 생성된 제출용 초안입니다. 입력 데이터의 정확성에 대한 책임은 사용자에게 있습니다.
        </Text>
      </Page>
    </Document>
  );
}
