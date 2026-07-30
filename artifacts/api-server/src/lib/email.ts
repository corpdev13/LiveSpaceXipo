import { logger } from "./logger";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? "SPCX Investor Relations <onboarding@resend.dev>";

interface StatusEmailParams {
  to: string;
  fullName: string;
  status: "approved" | "rejected";
}

function renderStatusEmail({ fullName, status }: StatusEmailParams): { subject: string; html: string } {
  if (status === "approved") {
    return {
      subject: "Your SPCX investor access has been approved",
      html: `
        <div style="background:#050a0f;padding:40px 24px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
          <div style="max-width:480px;margin:0 auto;">
            <p style="letter-spacing:2px;font-size:20px;font-weight:bold;text-transform:uppercase;margin:0 0 32px;">SPCX</p>
            <h1 style="font-size:24px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Access approved</h1>
            <p style="font-size:15px;line-height:1.6;color:#d1d5db;">Hi ${fullName},</p>
            <p style="font-size:15px;line-height:1.6;color:#d1d5db;">
              Your investor access request for SPCX has been approved. You can now sign in to view live pricing,
              your portfolio, and deposit funds.
            </p>
            <p style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6b7280;margin-top:32px;">
              &copy; 2026 SPCX. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };
  }

  return {
    subject: "Update on your SPCX investor access request",
    html: `
      <div style="background:#050a0f;padding:40px 24px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
        <div style="max-width:480px;margin:0 auto;">
          <p style="letter-spacing:2px;font-size:20px;font-weight:bold;text-transform:uppercase;margin:0 0 32px;">SPCX</p>
          <h1 style="font-size:24px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Access request not approved</h1>
          <p style="font-size:15px;line-height:1.6;color:#d1d5db;">Hi ${fullName},</p>
          <p style="font-size:15px;line-height:1.6;color:#d1d5db;">
            After review, we're unable to approve your investor access request for SPCX at this time.
            If you believe this is a mistake, please contact investors@spcxipo.com.
          </p>
          <p style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6b7280;margin-top:32px;">
            &copy; 2026 SPCX. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * Send an email to an investor when their access status changes.
 * Never throws — failures are logged so a flaky email provider can never
 * block an admin's approve/reject action.
 */
export async function sendInvestorStatusEmail(params: StatusEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.warn("RESEND_API_KEY is not configured; skipping investor status email");
    return;
  }

  const { subject, html } = renderStatusEmail(params);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: params.to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error({ status: response.status, body }, "Failed to send investor status email");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send investor status email");
  }
}
