import nodemailer from "nodemailer";

export const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: body,
  });
};

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
