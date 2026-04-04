import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "사후(SAHU) — 생전 정리부터 사후 행정까지",
    template: "%s — 사후(SAHU)",
  },
  description:
    "미리 정리하면, 가족이 고생하지 않습니다. 디지털 유산 정리, 사망 후 행정 체크리스트, 상속재산분할협의서까지.",
  verification: {
    google: "MWCeWKB-iUh9gi_4BySFnKl_AI8QhiV6h3UGAKiSXEE",
    other: {
      "naver-site-verification": "f8cae595ddcac544fceff159c1d65bfb4b651b30",
    },
  },
  metadataBase: new URL("https://sahu.kr"),
  openGraph: {
    title: "사후(SAHU) — 생전 정리부터 사후 행정까지",
    description:
      "미리 정리하면, 가족이 고생하지 않습니다. 디지털 유산 정리, 사망 후 행정 체크리스트, 상속재산분할협의서까지.",
    url: "https://sahu.kr",
    siteName: "사후(SAHU)",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "사후(SAHU) — 생전 정리부터 사후 행정까지",
    description:
      "미리 정리하면, 가족이 고생하지 않습니다.",
  },
  keywords: [
    "생전 정리",
    "디지털 유산",
    "엔딩노트",
    "인생정리",
    "사망 후 해야할 일",
    "사망신고 방법",
    "상속포기 기한",
    "상속재산분할협의서",
    "안심상속 원스톱서비스",
    "사망 후 행정 처리",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={geistSans.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
