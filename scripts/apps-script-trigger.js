/**
 * SAHU 입금확인 자동화 — Google Apps Script
 *
 * 설치 방법:
 * 1. Google Sheets → 확장 프로그램 → Apps Script
 * 2. 이 코드를 에디터에 붙여넣기
 * 3. 좌측 "프로젝트 설정(톱니바퀴)" → 스크립트 속성 추가:
 *    - 키: SAHU_ADMIN_SECRET / 값: (Vercel 환경변수와 동일한 시크릿)
 *    - 키: SAHU_API_URL / 값: https://sahu.kr/api/order/confirm
 * 4. 좌측 "트리거(시계 아이콘)" → [트리거 추가]
 *    - 실행할 함수: handleStatusChange
 *    - 이벤트 소스: 스프레드시트에서
 *    - 이벤트 유형: 수정 시
 * 5. Google 계정 권한 승인 (최초 1회)
 */

function handleStatusChange(e) {
  if (!e) return;

  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== "주문") return;

  var range = e.range;
  var row = range.getRow();
  var col = range.getColumn();

  // C열(3번째)이 수정되었고, 헤더(1행)가 아닌 경우만
  if (col !== 3 || row < 2) return;

  var status = e.value;
  if (status !== "입금확인") return;

  // 데이터 추출 (G열: 이메일, H열: JSON Payload, A열: 주문번호)
  var orderNumber = sheet.getRange(row, 1).getValue();
  var email = sheet.getRange(row, 7).getValue();
  var payloadStr = sheet.getRange(row, 8).getValue();

  if (!email || !payloadStr) {
    sheet.getRange(row, 9).setValue("❌ 이메일 또는 JSON 데이터 누락");
    return;
  }

  // 스크립트 속성에서 시크릿 키 로드 (하드코딩 금지)
  var scriptProperties = PropertiesService.getScriptProperties();
  var secret = scriptProperties.getProperty("SAHU_ADMIN_SECRET");
  var apiUrl = scriptProperties.getProperty("SAHU_API_URL");

  if (!secret || !apiUrl) {
    sheet.getRange(row, 9).setValue("❌ 스크립트 속성 누락 (SAHU_ADMIN_SECRET / SAHU_API_URL)");
    return;
  }

  try {
    // Apps Script가 데이터를 직접 전달 (API가 Sheets 재조회 안 함)
    var response = UrlFetchApp.fetch(apiUrl, {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + secret,
      },
      payload: JSON.stringify({
        email: email,
        data: JSON.parse(payloadStr),
        orderNumber: orderNumber,
      }),
      muteHttpExceptions: true,
    });

    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();

    if (statusCode === 200) {
      var result = JSON.parse(responseBody);
      // 다운로드 토큰을 Sheets J/K/L 열에 저장
      sheet.getRange(row, 10).setValue(result.downloadToken || ""); // J열: 토큰
      sheet.getRange(row, 11).setValue(new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()); // K열: 만료일시
      sheet.getRange(row, 12).setValue("0"); // L열: 다운로드횟수
      sheet.getRange(row, 3).setValue("발송완료");
      sheet.getRange(row, 9).setValue("✅ " + new Date().toLocaleString("ko-KR"));
    } else {
      sheet.getRange(row, 9).setValue("❌ API 에러(" + statusCode + "): " + responseBody);
      sheet.getRange(row, 3).setValue("입금확인(발송실패)");
    }
  } catch (error) {
    sheet.getRange(row, 9).setValue("❌ 통신 실패: " + error.toString());
    sheet.getRange(row, 3).setValue("입금확인(발송실패)");
  }
}
