import { fromNodeHeaders } from "better-auth/node";
import { getAuth } from "../config/auth.js";
import { ApiError } from "../utils/ApiError.js";

// Lets a request through only with a valid Better Auth session. Any session
// problem (no cookie, expired, revoked) is a 401, which the frontend treats
// as "log in again".
export const verifyToken = async (req, res, next) => {
  try {
    const session = await getAuth().api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return next(new ApiError(401, "unauthorized"));
    }

    req.user = { id: session.user.id };
    next();
  } catch (error) {
    next(error);
  }
};
