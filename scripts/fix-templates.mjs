import { google } from 'googleapis';

const SPREADSHEET_ID = '1BdkaB-9p9nR_kMdlmSVE9AvD62MW4qN__u_Fvzb99Hw';
const CREDENTIALS_PATH = '/Users/byunheejae/Desktop/sahu/google-credentials.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1:J',
  });

  const rows = res.data.values;
  console.log(`${rows.length}행 읽음`);

  let fixCount = 0;
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][9]) continue;
    let val = rows[i][9];
    const original = val;

    // 1. Replace literal \n with actual newlines
    val = val.replace(/\\n/g, '\n');

    // 2. Add ?utm_source=kin to sahu.kr URLs
    val = val.replace(/https:\/\/sahu\.kr(\/[^\s?]*)?(?!\S*utm_source)/g,
      (match) => match + '?utm_source=kin');

    if (val !== original) { rows[i][9] = val; fixCount++; }
  }

  const jValues = rows.map((row) => [row[9] || '']);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'J1:J',
    valueInputOption: 'RAW',
    requestBody: { values: jValues },
  });
  console.log(`${fixCount}행 수정 완료`);
}

main().catch(console.error);
