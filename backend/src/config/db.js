import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  if (env.DNS_SERVERS?.length) {
    dns.setServers(env.DNS_SERVERS);
  }

  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to mongoDB");
};
