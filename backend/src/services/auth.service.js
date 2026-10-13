import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as userRepository from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";

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

  const token = jwt.sign({ id: user._id }, env.JWT_SECRET);

  return { token, user: toPublicUser(user) };
};
