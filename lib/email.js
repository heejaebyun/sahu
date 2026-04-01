import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `SAHU <${process.env.GMAIL_USER}>`;

// 주문 확인 + 계좌 안내 이메일
export async function sendOrderConfirmation({ to, orderNumber, depositorName, paymentMethod }) {
  const subject = `[SAHU] 주문이 접수되었습니다 (${orderNumber})`;
  const html = `
    <div style="max-width:560px;margin:0 auto;font-family:-apple-system,'Segoe UI',sans-serif;color:#1e293b;line-height:1.8">
      <div style="padding:32px 0;border-bottom:1px solid #e2e8f0">
        <h1 style="font-size:18px;font-weight:800;letter-spacing:0.15em;margin:0">SAHU</h1>
      </div>
      <div style="padding:32px 0">
        <h2 style="font-size:18px;font-weight:700;margin:0 0 16px">주문이 접수되었습니다.</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#64748b">주문번호</td><td style="padding:8px 0;font-weight:600">${orderNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">입금자명</td><td style="padding:8px 0;font-weight:600">${depositorName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">결제금액</td><td style="padding:8px 0;font-weight:600">49,900원</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">결제수단</td><td style="padding:8px 0;font-weight:600">${paymentMethod}</td></tr>
        </table>
        <p style="font-size:14px;color:#64748b;margin-top:24px">
          입금 확인 후 원본 서류를 이 이메일로 발송해 드립니다.<br>
          문의: sahu.kr@gmail.com
        </p>
      </div>
      <div style="padding:24px 0;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
        본 메일은 SAHU 서식 자동 완성 서비스에서 발송되었습니다.
      </div>
    </div>
  `;
  await transporter.sendMail({ from: FROM, to, subject, html });
}

// 원본 PDF 다운로드 링크 발송
export async function sendPDFDownloadLink({ to, orderNumber, downloadUrl, deceasedName }) {
  const subject = `[SAHU] ${deceasedName}님의 상속재산분할협의서가 준비되었습니다`;
  const html = `
    <div style="max-width:560px;margin:0 auto;font-family:-apple-system,'Segoe UI',sans-serif;color:#1e293b;line-height:1.8">
      <div style="padding:32px 0;border-bottom:1px solid #e2e8f0">
        <h1 style="font-size:18px;font-weight:800;letter-spacing:0.15em;margin:0">SAHU</h1>
      </div>
      <div style="padding:32px 0">
        <h2 style="font-size:18px;font-weight:700;margin:0 0 16px">서류가 준비되었습니다.</h2>
        <p style="font-size:14px;color:#334155;margin-bottom:24px">
          ${deceasedName}님의 상속재산분할협의서 원본이 생성되었습니다.<br>
          아래 버튼을 눌러 다운로드해 주세요.
        </p>
        <a href="${downloadUrl}" style="display:inline-block;padding:16px 40px;background:#0f172a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.05em">
          원본 PDF 다운로드
        </a>
        <p style="font-size:12px;color:#94a3b8;margin-top:16px">
          72시간 내, 최대 3회 다운로드 가능합니다.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:24px">
          <tr><td style="padding:8px 0;color:#64748b">주문번호</td><td style="padding:8px 0;font-weight:600">${orderNumber}</td></tr>
        </table>
      </div>
      <div style="padding:24px 0;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
        본 서류는 사용자가 입력한 데이터를 바탕으로 생성된 제출용 초안입니다.<br>
        입력 데이터의 정확성에 대한 책임은 사용자에게 있습니다.
      </div>
    </div>
  `;
  await transporter.sendMail({ from: FROM, to, subject, html });
}

// 환불 완료 이메일
export async function sendRefundConfirmation({ to, orderNumber }) {
  const subject = `[SAHU] 환불이 완료되었습니다 (${orderNumber})`;
  const html = `
    <div style="max-width:560px;margin:0 auto;font-family:-apple-system,'Segoe UI',sans-serif;color:#1e293b;line-height:1.8">
      <div style="padding:32px 0;border-bottom:1px solid #e2e8f0">
        <h1 style="font-size:18px;font-weight:800;letter-spacing:0.15em;margin:0">SAHU</h1>
      </div>
      <div style="padding:32px 0">
        <h2 style="font-size:18px;font-weight:700;margin:0 0 16px">환불이 완료되었습니다.</h2>
        <p style="font-size:14px;color:#334155">
          주문번호 ${orderNumber}에 대한 환불이 정상 처리되었습니다.<br>
          처리에 불편을 드려 죄송합니다. 추가 도움이 필요하시면 언제든 연락 주세요.
        </p>
        <p style="font-size:13px;color:#64748b;margin-top:16px">문의: sahu.kr@gmail.com</p>
      </div>
      <div style="padding:24px 0;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
        본 메일은 SAHU 서식 자동 완성 서비스에서 발송되었습니다.
      </div>
    </div>
  `;
  await transporter.sendMail({ from: FROM, to, subject, html });
}
