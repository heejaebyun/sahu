import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "사후(SAHU) — 사망 후 행정 처리 가이드",
    template: "%s — 사후(SAHU)",
  },
  description:
    "가족을 잃은 후 해야 할 행정 절차를 단계별로 안내합니다. 사망신고, 상속, 은행, 보험, 세금 등 모든 절차를 체크리스트로 관리하세요.",
  verification: {
    google: "MWCeWKB-iUh9gi_4BySFnKl_AI8QhiV6h3UGAKiSXEE",
    other: {
      "naver-site-verification": "f8cae595ddcac544fceff159c1d65bfb4b651b30",
    },
  },
  keywords: [
    "사망 후 해야할 일",
    "사망신고 방법",
    "상속포기 기한",
    "안심상속 원스톱서비스",
    "사망 후 행정 처리",
    "상속세 신고",
    "사망 후 은행",
    "사망 후 보험",
    "장례 후 절차",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
