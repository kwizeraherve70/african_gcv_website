import nodemailer from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

function emailTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

export const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  const transporter = emailTransport();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: body,
  });
};

/** The whole attempt must finish before a background job's lease expires. */
export async function sendEmailBounded(message: EmailMessage, timeoutMs = 25_000): Promise<void> {
  const transporter = emailTransport();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      transporter.sendMail({ from: process.env.EMAIL_USER, to: message.to, subject: message.subject, text: message.body }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          transporter.close();
          reject(Object.assign(new Error("Email delivery deadline exceeded"), { code: "ETIMEDOUT" }));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    transporter.close();
  }
}

/**
 * Notification emails are a side effect of the core operation (contact
 * saved, order placed, password reset requested, ...), not the operation
 * itself. A dead SMTP config or a bad recipient must not turn an otherwise
 * successful DB write into a 500 for the caller, so failures are logged
 * and swallowed here instead of thrown.
 */
export const sendEmailSafe = async (params: {
  to: string;
  subject: string;
  body: string;
}): Promise<boolean> => {
  try {
    await sendEmail(params);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${params.to}:`, error);
    return false;
  }
};
