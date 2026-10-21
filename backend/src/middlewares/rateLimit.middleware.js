import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const NOTES_WINDOW_MINUTES = 15;
const NOTES_MAX_REQUESTS = 300;

// Notes API: at most 300 requests per 15 minutes per visitor, plenty for
// normal use (searching, paging, editing). Over the limit it answers 429 in
// the same shape as every other API error, and RateLimit headers tell the
// client when it can try again.
export const notesRateLimit = rateLimit({
  windowMs: NOTES_WINDOW_MINUTES * 60 * 1000,
  limit: NOTES_MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(429, "Too many requests. Please wait a few minutes and try again.")
    );
  },
});
