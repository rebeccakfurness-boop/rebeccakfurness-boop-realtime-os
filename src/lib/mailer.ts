import nodemailer from "nodemailer";

/**
 * Thin mail-sending boundary used by the magic-link auth flow (and, later, any
 * transactional email). If SMTP credentials are configured, it sends a real email.
 * Otherwise it prints the message to the server console, so magic-link login and
 * every other email-triggering flow stays fully usable in dev without real creds.
 */
export async function sendMail(params: { to: string; subject: string; html: string; text: string }) {
  const host = process.env.EMAIL_SERVER_HOST;

  if (!host) {
    console.log("\n──────── [dev mailer] no EMAIL_SERVER_HOST set, printing email instead of sending ────────");
    console.log(`To:      ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(params.text);
    console.log("────────────────────────────────────────────────────────────────────────────\n");
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transport.sendMail({
    to: params.to,
    from: process.env.EMAIL_FROM,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
