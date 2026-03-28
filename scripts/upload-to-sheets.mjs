// 지식인 크롤링 결과를 구글 스프레드시트에 업로드
// Usage: node scripts/upload-to-sheets.mjs

import { google } from "googleapis";
import { readFileSync } from "fs";

const CREDENTIALS_PATH = "/Users/byunheejae/Desktop/sahu/google-credentials.json";
const TSV_PATH = "/Users/byunheejae/Desktop/sahu/scripts/kin-enriched.tsv";

async function main() {
  // Auth
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  const spreadsheetId = "1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw";
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  console.log(`스프레드시트: ${spreadsheetUrl}`);

  // Read TSV
  const tsv = readFileSync(TSV_PATH, "utf-8");
  const rows = tsv.split("\n").map((line) => line.split("\t"));

  // Upload data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "시트1!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });

  console.log(`${rows.length}행 업로드 완료`);

  // Format header row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Bold header
        {
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.2, blue: 0.25 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        // Auto-resize columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 10,
            },
          },
        },
      ],
    },
  });

  console.log(`\n완료: ${spreadsheetUrl}`);
}

main().catch(console.error);
