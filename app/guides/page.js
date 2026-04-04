import Link from "next/link";

export const metadata = {
  title: "사망 후 행정 처리 가이드 모음 — 사후(SAHU)",
  description:
    "사망신고, 상속포기, 안심상속, 은행 계좌 정리 등 사망 후 해야 할 행정 절차를 항목별로 상세하게 안내합니다.",
};

const GUIDES = [
  {
    slug: "death-report",
    title: "사망신고 방법 총정리",
    summary: "사망신고 기한, 필요 서류, 신고 장소, 온라인 신고까지",
  },
  {
    slug: "inheritance-renounce",
    title: "상속포기·한정승인 완벽 가이드",
    summary: "기한, 절차, 비용, 주의사항까지 한눈에",
  },
  {
    slug: "safe-inheritance",
    title: "안심상속 원스톱서비스 신청 방법",
    summary: "신청 기한, 조회 항목, 결과 확인까지 단계별 안내",
  },
  {
    slug: "bank-accounts",
    title: "사망 후 은행 계좌 정리 방법",
    summary: "필요 서류, 주의사항, 상속인별 절차 안내",
  },
];

export default function GuidesPage() {
  return (
    <main
      data-theme="dark"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "40px 20px 80px",
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
      <div style={{ height: 56 }} />
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
        사망 후 행정 처리 가이드
      </h1>
      <p style={{ fontSize: 14, color: "#8888a0", marginBottom: 32 }}>
        각 절차별 상세한 안내를 확인하세요.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            style={{
              display: "block",
              background: "#12121a",
              border: "1px solid #222233",
              borderRadius: 8,
              padding: "16px 20px",
              textDecoration: "none",
              color: "#e0e0e8",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              {guide.title}
            </div>
            <div style={{ fontSize: 13, color: "#8888a0" }}>
              {guide.summary}
            </div>
          </Link>
        ))}
      </div>

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
          전체 절차를 체크리스트로 관리하세요
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
    </main>
  );
}
