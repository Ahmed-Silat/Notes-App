import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as userRepository from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";

// How long a login lasts: the token expires and the cookie is kept this long.
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const toPublicUser = (user) => {
  const { password, ...rest } = user.toObject();
  return rest;
};

export const signup = async ({ username, email, password }) => {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new ApiError(400, "User already Exist");
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  try {
    const user = await userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    return toPublicUser(user);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "User already Exist");
    }
    throw error;
  }
};

export const signin = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const validPassword = await bcryptjs.compare(password, user.password);

  if (!validPassword) {
    throw new ApiError(401, "Password is not correct");
  }

  const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
    expiresIn: SESSION_DURATION_MS / 1000,
  });

  return { token, user: toPublicUser(user) };
};
