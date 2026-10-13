import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGINS } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
