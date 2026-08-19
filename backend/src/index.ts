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
import cron from "node-cron";
import { PaymentService } from "./services/PaymentService";

declare module "express" {
  interface Request {
    user?: TUser;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  urlencoded({
    extended: true,
  }),
);

app.use(json());
app.use(
  cors({
    // The kigalihotmarket.* / vercel.app origins are inherited from khm-be
    // and are unrelated to this project (Pi Global GCV Alliance) — left in
    // place rather than removed blind, since it's unconfirmed whether that
    // old frontend is still live against this API. localhost:5173 is this
    // project's Vite dev server (added 2026-08-16 for Day 3 frontend
    // wiring); the real production frontend origin isn't known yet.
    origin: ["https://kigalihotmarket-frontend.vercel.app", "https://kigalihotmarket-fontend-hs54pegw0.vercel.app", "https://kigalihotmarket-fontend-oyyqg4fe9.vercel.app", "http://localhost:4173", "http://localhost:5173", "https://www.kigalihotmarket.store", "https://kigalihotmarket.store"],
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

// Schedule the synchronization to run every minute
cron.schedule("* * * * *", async () => {
  console.log("Running payment synchronization...");
  try {
    const result = await PaymentService.syncAllPaymentsWithTransactions();
    console.log(result.message);
  } catch (error) {
    console.error("Error during payment synchronization:", error);
  }
});

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
