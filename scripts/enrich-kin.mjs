// 지식인 질문 상세 페이지 크롤링 + 품질 검수
// Usage: node scripts/enrich-kin.mjs

import { readFileSync, writeFileSync } from "fs";

const INPUT = "/Users/byunheejae/Desktop/sahu/scripts/kin-questions.tsv";
const OUTPUT = "/Users/byunheejae/Desktop/sahu/scripts/kin-enriched.tsv";

async function fetchDetail(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
    });
    const html = await res.text();

    // Extract title
    let title = "";
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      title = titleMatch[1]
        .replace(" : 지식iN", "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Extract question content
    let content = "";
    const contentMatch = html.match(
      /class="c-heading__content"[^>]*>([\s\S]*?)<\/div>/
    );
    if (contentMatch) {
      content = contentMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    }

    // Fallback content extraction
    if (!content) {
      const fallback = html.match(
        /class="question-content"[^>]*>([\s\S]*?)<\/div>/
      );
      if (fallback) {
        content = fallback[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      }
    }

    // Check if has accepted answer
    const hasAccepted = html.includes("채택된 답변") || html.includes("질문자 채택");

    // Count answers
    let answerCount = 0;
    const answerMatch = html.match(/답변\s*(\d+)/);
    if (answerMatch) answerCount = parseInt(answerMatch[1]);

    return { title, content: content.slice(0, 200), hasAccepted, answerCount };
  } catch (err) {
    return { title: "", content: "", hasAccepted: false, answerCount: 0 };
  }
}

function qualityScore(detail, keyword) {
  let score = 0;
  let reasons = [];

  // Title relevance
  const titleLower = detail.title.toLowerCase();
  if (
    titleLower.includes("사망") ||
    titleLower.includes("상속") ||
    titleLower.includes("장례") ||
    titleLower.includes("돌아가")
  ) {
    score += 3;
    reasons.push("관련 키워드 포함");
  }

  // Content length = genuine question
  if (detail.content.length > 50) {
    score += 2;
    reasons.push("상세한 질문");
  }

  // No accepted answer = opportunity
  if (!detail.hasAccepted) {
    score += 2;
    reasons.push("채택 답변 없음");
  }

  // Few answers = less competition
  if (detail.answerCount <= 2) {
    score += 1;
    reasons.push("답변 적음");
  }

  // Actionable question (asking how-to)
  if (
    titleLower.includes("어떻게") ||
    titleLower.includes("방법") ||
    titleLower.includes("해야") ||
    titleLower.includes("필요") ||
    titleLower.includes("기한") ||
    titleLower.includes("절차")
  ) {
    score += 2;
    reasons.push("행동 질문");
  }

  // Grade
  let grade;
  if (score >= 7) grade = "A";
  else if (score >= 5) grade = "B";
  else if (score >= 3) grade = "C";
  else grade = "D";

  return { score, grade, reasons: reasons.join(", ") };
}

async function main() {
  const raw = readFileSync(INPUT, "utf-8");
  const lines = raw.split("\n").slice(1); // skip header

  console.log(`${lines.length}개 질문 상세 크롤링 시작...\n`);

  const results = [];
  let processed = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const [keyword, , link, template] = line.split("\t");

    const detail = await fetchDetail(link);
    const quality = qualityScore(detail, keyword);

    results.push({
      grade: quality.grade,
      score: quality.score,
      keyword,
      title: detail.title || "[제목 추출 실패]",
      content: detail.content || "",
      link,
      hasAccepted: detail.hasAccepted ? "Y" : "N",
      answerCount: detail.answerCount,
      reasons: quality.reasons,
      template,
    });

    processed++;
    if (processed % 10 === 0) {
      console.log(`${processed}/${lines.length} 처리 완료...`);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 300));
  }

  // Sort by grade then score
  results.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
    return b.score - a.score;
  });

  // Generate TSV
  const header = "등급\t점수\t키워드\t질문 제목\t질문 내용(요약)\t링크\t채택여부\t답변수\t품질 사유\t답변 템플릿";
  const rows = results.map(
    (r) =>
      `${r.grade}\t${r.score}\t${r.keyword}\t${r.title}\t${r.content}\t${r.link}\t${r.hasAccepted}\t${r.answerCount}\t${r.reasons}\t${r.template}`
  );

  const tsv = [header, ...rows].join("\n");
  writeFileSync(OUTPUT, tsv, "utf-8");

  console.log(`\n=== 완료 ===`);
  console.log(`총 ${results.length}개 질문`);
  console.log(`A등급: ${results.filter((r) => r.grade === "A").length}개`);
  console.log(`B등급: ${results.filter((r) => r.grade === "B").length}개`);
  console.log(`C등급: ${results.filter((r) => r.grade === "C").length}개`);
  console.log(`D등급: ${results.filter((r) => r.grade === "D").length}개`);
  console.log(`\n저장: ${OUTPUT}`);
  console.log(`구글 스프레드시트에 탭 구분으로 붙여넣기 가능\n`);

  // Print top 10
  console.log("=== A/B등급 질문 ===");
  results
    .filter((r) => r.grade <= "B")
    .slice(0, 10)
    .forEach((r) => {
      console.log(`[${r.grade}] ${r.title}`);
      console.log(`    ${r.link}`);
      console.log(`    사유: ${r.reasons}`);
      console.log();
    });
}

main().catch(console.error);
