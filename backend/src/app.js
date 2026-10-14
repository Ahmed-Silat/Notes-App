import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { getAuth } from "./config/auth.js";
import { CORS_ORIGINS } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

// Better Auth: sign-up, sign-in, sign-out and sessions under /api/auth.
// It reads the request body itself, so it must come before express.json().
let authHandler;
app.all("/api/auth/*", (req, res) => {
  authHandler ??= toNodeHandler(getAuth());
  return authHandler(req, res);
});

app.use(express.json());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
