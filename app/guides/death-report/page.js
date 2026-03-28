export const metadata = {
  title: "사망신고 방법 총정리 (2026) — 기한, 서류, 장소, 과태료",
  description:
    "사망신고는 사망사실을 안 날부터 1개월 이내에 해야 합니다. 필요 서류, 신고 장소, 과태료, 온라인 신고 가능 여부까지 한눈에 정리했습니다.",
};

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 12,
          color: "#e0e0e8",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoBox({ items }) {
  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid #222233",
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: 16,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: i < items.length - 1 ? 8 : 0,
            fontSize: 14,
            color: "#c0c0d0",
          }}
        >
          <span style={{ color: "#555566", flexShrink: 0 }}>{item.label}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DeathReportGuide() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "40px 20px 80px",
        color: "#c0c0d0",
        fontSize: 15,
        lineHeight: 1.8,
      }}
    >
      <a
        href="/guides"
        style={{
          fontSize: 13,
          color: "#555566",
          display: "block",
          marginBottom: 24,
        }}
      >
        ← 가이드 목록
      </a>

      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          color: "#e0e0e8",
        }}
      >
        사망신고 방법 총정리
      </h1>
      <p style={{ fontSize: 14, color: "#8888a0", marginBottom: 32 }}>
        2026년 기준 · 마지막 업데이트: 2026년 3월
      </p>

      <Section title="사망신고란?">
        <p>
          사망신고는 가족관계등록법에 따라 사람의 사망 사실을 행정기관에 알리는
          법적 절차입니다. 사망신고를 해야 가족관계증명서에 사망 기록이 반영되고,
          이후 상속·보험·금융 등 모든 행정 절차를 진행할 수 있습니다.
        </p>
      </Section>

      <Section title="기한">
        <InfoBox
          items={[
            {
              label: "신고 기한:",
              value: "사망사실을 안 날부터 1개월 이내",
            },
            {
              label: "미신고 시:",
              value: "5만원 이하 과태료 부과 가능",
            },
          ]}
        />
        <p>
          &ldquo;사망사실을 안 날&rdquo;은 통상 사망 당일로 봅니다. 예를 들어 3월
          8일 사망 시, 4월 8일 전후까지 신고해야 합니다.
        </p>
      </Section>

      <Section title="신고 의무자">
        <p>다음 순서에 따라 신고 의무가 있습니다:</p>
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            marginTop: 8,
          }}
        >
          <div style={{ marginBottom: 4 }}>1. 동거하는 친족</div>
          <div style={{ marginBottom: 4 }}>2. 비동거 친족</div>
          <div style={{ marginBottom: 4 }}>3. 동거자</div>
          <div>4. 사망 장소의 관리인</div>
        </div>
      </Section>

      <Section title="필요 서류">
        <InfoBox
          items={[
            {
              label: "필수:",
              value: "사망진단서(시체검안서) 1통",
            },
            {
              label: "필수:",
              value: "신고인 신분증",
            },
            {
              label: "참고:",
              value:
                "사망진단서는 사망한 병원에서 발급받습니다. 최소 10통 이상 발급받는 것을 권장합니다.",
            },
          ]}
        />
      </Section>

      <Section title="신고 장소">
        <p>다음 주민센터(행정복지센터) 중 한 곳에서 신고할 수 있습니다:</p>
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            marginTop: 8,
          }}
        >
          <div style={{ marginBottom: 4 }}>· 사망지 관할 주민센터</div>
          <div style={{ marginBottom: 4 }}>· 신고인 주소지 주민센터</div>
          <div>· 고인 주소지 주민센터</div>
        </div>
      </Section>

      <Section title="사망신고 후 바로 할 일">
        <p>사망신고와 함께 다음을 바로 신청할 수 있습니다:</p>
        <div
          style={{
            background: "#12121a",
            border: "1px solid #222233",
            borderRadius: 8,
            padding: "16px 20px",
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>
              안심상속 원스톱서비스
            </span>
            <div style={{ fontSize: 13, color: "#8888a0", marginTop: 2 }}>
              고인의 금융·부동산·세금·연금 등을 한번에 조회하는 서비스입니다.
              사망신고 하면서 바로 신청하는 것이 가장 효율적입니다.
            </div>
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#e0e0e8" }}>
              가족관계증명서 발급
            </span>
            <div style={{ fontSize: 13, color: "#8888a0", marginTop: 2 }}>
              사망 기록이 반영된 가족관계증명서를 여러 통 발급받으세요. 이후 모든
              절차에 필요합니다.
            </div>
          </div>
        </div>
      </Section>

      <Section title="자주 묻는 질문">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: "#e0e0e8", marginBottom: 4 }}>
            Q. 온라인으로 사망신고를 할 수 있나요?
          </div>
          <p style={{ margin: 0 }}>
            대법원 전자가족관계등록시스템에서 일부 신고가 가능하지만, 사망신고는
            실무상 주민센터 방문이 일반적입니다.
          </p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: "#e0e0e8", marginBottom: 4 }}>
            Q. 사망진단서를 잃어버리면?
          </div>
          <p style={{ margin: 0 }}>
            사망한 병원에서 재발급 가능합니다. 병원마다 다르지만 1통당
            1,000~2,000원 수준입니다.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: "#e0e0e8", marginBottom: 4 }}>
            Q. 기한이 지나면?
          </div>
          <p style={{ margin: 0 }}>
            5만원 이하 과태료가 부과될 수 있습니다. 기한이 지났더라도 반드시
            신고해야 합니다.
          </p>
        </div>
      </Section>

      <div
        style={{
          marginTop: 40,
          padding: "16px 20px",
          background: "#7b9fff10",
          border: "1px solid #7b9fff20",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, color: "#e0e0e8", marginBottom: 8 }}>
          사망신고 이후 해야 할 절차도 체크리스트로 관리하세요
        </div>
        <a
          href="/"
          style={{
            display: "inline-block",
            background: "#7b9fff",
            color: "#0a0a0f",
            padding: "10px 24px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          무료 체크리스트 시작하기
        </a>
      </div>

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
        <p>
          본 내용은 일반적인 정보 제공 목적이며, 법률 자문을 대체하지 않습니다.
        </p>
      </footer>
    </main>
  );
}
