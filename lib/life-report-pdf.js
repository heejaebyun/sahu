import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { LIFE_CATEGORIES, LIFE_CHECKLIST } from "./life-checklist-data";

Font.register({
  family: "NanumMyeongjo",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/NanumMyeongjo.woff", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/NanumMyeongjoBold.woff", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { fontFamily: "NanumMyeongjo", fontSize: 10, padding: "50 45", lineHeight: 1.7, color: "#111" },
  title: { fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 8, letterSpacing: 6 },
  subtitle: { fontSize: 11, textAlign: "center", color: "#666", marginBottom: 30 },
  dateText: { fontSize: 10, textAlign: "center", color: "#888", marginBottom: 40 },
  categoryTitle: { fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 10, paddingBottom: 6, borderBottom: "1 solid #ddd" },
  itemTitle: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  fieldRow: { flexDirection: "row", marginBottom: 3 },
  fieldLabel: { width: 100, fontSize: 10, color: "#666" },
  fieldValue: { flex: 1, fontSize: 10 },
  familySection: { marginTop: 30, paddingTop: 16, borderTop: "1 solid #ddd" },
  familyTitle: { fontSize: 14, fontWeight: 700, marginBottom: 10 },
  familyRow: { flexDirection: "row", marginBottom: 4 },
  disclaimer: { fontSize: 7, color: "#aaa", textAlign: "center", marginTop: 40, lineHeight: 1.4 },
});

export function LifeReportDocument({ entries, familyMembers }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 작성`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>인생정리 리포트</Text>
        <Text style={styles.subtitle}>가족을 위한 정리 기록</Text>
        <Text style={styles.dateText}>{dateStr}</Text>

        {LIFE_CATEGORIES.map((cat) => {
          const items = LIFE_CHECKLIST.filter((i) => i.category === cat.id);
          const filledItems = items.filter((item) => {
            const entry = entries[item.id];
            return entry && item.fields.some((f) => entry[f.key]?.trim());
          });

          if (filledItems.length === 0) return null;

          return (
            <View key={cat.id}>
              <Text style={styles.categoryTitle}>{cat.icon} {cat.label}</Text>
              {filledItems.map((item) => {
                const entry = entries[item.id] || {};
                return (
                  <View key={item.id}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.fields.map((field) => {
                      const val = entry[field.key];
                      if (!val || !val.trim()) return null;
                      return (
                        <View key={field.key} style={styles.fieldRow}>
                          <Text style={styles.fieldLabel}>{field.label}:</Text>
                          <Text style={styles.fieldValue}>{val}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          );
        })}

        {familyMembers && familyMembers.length > 0 && (
          <View style={styles.familySection}>
            <Text style={styles.familyTitle}>👨‍👩‍👧 지정인 목록</Text>
            {familyMembers.map((m, i) => (
              <View key={m.id || i} style={styles.familyRow}>
                <Text style={styles.fieldLabel}>{m.relation || "관계 미입력"}:</Text>
                <Text style={styles.fieldValue}>{m.name} ({m.phone || "연락처 없음"})</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          본 문서는 SAHU 인생정리 서비스를 통해 생성되었습니다. 법적 효력이 없는 개인 기록이며, 법률·세무 자문을 대체하지 않습니다.
        </Text>
      </Page>
    </Document>
  );
}
