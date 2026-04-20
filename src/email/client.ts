import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getClient(): Resend {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailArgs) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set");

  const result = await getClient().emails.send({
    from,
    to,
    subject,
    html,
    text,
    replyTo,
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }

  return { id: result.data?.id ?? null };
}
