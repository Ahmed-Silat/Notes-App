import User from "../models/user.model.js";

export const findByEmail = (email) => User.findOne({ email });

export const create = (data) => User.create(data);
