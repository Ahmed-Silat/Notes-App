import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// Every session problem (no cookie, expired or invalid token) is a 401, which
// the frontend treats as "log in again".
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(new ApiError(401, "unauthorized"));
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, "Your session has expired, please log in again"));
  }
};
