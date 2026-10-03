import express, {
  json,
  urlencoded,
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
// Explanation: This line intentionally causes an error because...
// @ts-ignore
import { RegisterRoutes } from "../build/routes";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { TUser } from "./utils/interfaces/common";
import AppError, { ValidationError } from "./utils/error";
import { ValidateError } from "tsoa";
import { PaymentService } from "./services/PaymentService";

declare module "express" {
  interface Request {
    user?: TUser;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL ?? "https://african-gcv-frontend.vercel.app",
    ...(process.env.FRONTEND_URLS?.split(",") ?? []),
    "http://localhost:4173",
    "http://localhost:5173",
  ]
    .map((origin) => origin?.trim().replace(/\/$/, ""))
    .filter((origin): origin is string => Boolean(origin)),
);
app.use(
  urlencoded({
    extended: true,
  }),
);

// Mounted before the global json() parser: Stripe signature verification
// needs the exact raw request bytes, which json() would otherwise consume
// and reserialize.
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req: ExRequest, res: ExResponse) => {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      return res.status(400).json({ message: "Missing Stripe-Signature header" });
    }
    try {
      const result = await PaymentService.handleStripeWebhookEvent(
        req.body as Buffer,
        signature,
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error("Stripe webhook error:", error);
      return res.status(400).json({ message: "Webhook processing failed" });
    }
  },
);

app.use(json());
app.use(
  cors({
    // Set FRONTEND_URL to the canonical Vercel URL in Railway. Additional
    // comma-separated preview/custom URLs can be supplied via FRONTEND_URLS.
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);
app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    //@ts-ignore
    swaggerUi.generateHTML(await import("../build/swagger.json")),
  );
});

RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction,
): ExResponse | void {
  console.log(err);
  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err instanceof ValidateError) {
    return res.status(400).json({
      status: 400,
      message: "Invalid request fields",
      fields: err.fields,
    });
  }

  if (err instanceof ValidationError) {
    return res
      .status(400)
      .json({ error: "validate", data: JSON.parse(err.message) });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: err.message ?? "Internal server error",
      status: 500,
    });
  }
  next();
});

app.listen(PORT, () =>
  console.log(`API running on PORT http://localhost:${PORT} wow!s`),
);
