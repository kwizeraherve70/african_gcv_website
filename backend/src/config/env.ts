import dotenv from "dotenv";
dotenv.config();
export const appEnv = {
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudName: process.env.CLOUD_NAME,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // Base URL of the deployed frontend — used to build Stripe Checkout's
  // success_url/cancel_url redirects.
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  // Inbox that receives internal notifications (new contact enquiries, etc).
  // Falls back to the sending mailbox itself when unset.
  adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
};
