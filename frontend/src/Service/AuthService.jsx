import { api } from "@/lib/api";

export const login = async (email, password) => {
  const data = await api.post("/auth/signin", { email, password });
  return data;
};

export const singnUp = async (username, email, password) => {
  const data = await api.post("/auth/signup", { username, email, password });
  return data;
};

export const signout = async () => {
  const data = await api.get("/auth/signout");
  return data;
};
