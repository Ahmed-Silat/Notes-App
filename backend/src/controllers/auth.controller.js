import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const COOKIE_NAME = "access_token";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

export const signup = asyncHandler(async (req, res) => {
  await authService.signup(req.body);

  res.status(201).json({
    success: true,
    message: "User Created Successfully",
  });
});

export const signin = asyncHandler(async (req, res) => {
  const { token, user } = await authService.signin(req.body);

  res.cookie(COOKIE_NAME, token, cookieOptions).status(200).json({
    success: true,
    message: "Login Successful",
    rest: user,
  });
});

export const signout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions).status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});
