import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const WINDOW_MINUTES = 15;
const MAX_REQUESTS = 300;

// Notes API and shared notes: at most 300 requests per 15 minutes per visitor
// (both together), plenty for normal use (searching, paging, editing). Over
// the limit it answers 429 in the same shape as every other API error, and
// RateLimit headers tell the client when it can try again.
export const apiRateLimit = rateLimit({
  windowMs: WINDOW_MINUTES * 60 * 1000,
  limit: MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(429, "Too many requests. Please wait a few minutes and try again.")
    );
  },
});
