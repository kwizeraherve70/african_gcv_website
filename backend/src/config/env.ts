import dotenv from "dotenv";
dotenv.config();
export const appEnv = {
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudName: process.env.CLOUD_NAME,
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  PAYPACK_API_BASE_URL: process.env.PAYPACK_API_BASE_URL,
  PAYPACK_WEBHOOK_SIGN_KEY: process.env.PAYPACK_WEBHOOK_SIGN_KEY,
  // Inbox that receives internal notifications (new contact enquiries, etc).
  // Falls back to the sending mailbox itself when unset.
  adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
};
