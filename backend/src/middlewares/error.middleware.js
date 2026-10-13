import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(err.keyValue ?? {}).join(", ")} already exists`;
  } else if (statusCode === 500) {
    console.error(err);
    if (env.NODE_ENV === "production") message = "Internal Server Error";
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(err instanceof ApiError && err.errors && { errors: err.errors }),
  });
};
