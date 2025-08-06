import axios from "axios";

const EXPRESS_API_URI = import.meta.env.VITE_API_BASE_URI;

console.log(EXPRESS_API_URI);

export const login = async (email, password) => {
  const data = await axios.post(
    `${EXPRESS_API_URI}/api/auth/signin`,
    {
      email,
      password,
    },
    { withCredentials: true }
  );
  //   console.log(data);
  return data;
};

export const singnUp = async (username, email, password) => {
  console.log(username, email, password);
  const data = await axios.post(
    `${EXPRESS_API_URI}/api/auth/signup`,
    { username, email, password },
    { withCredentials: true }
  );
  // console.log(data);
  return data;
};

export const signout = async () => {
  const data = await axios.get(`${EXPRESS_API_URI}/api/auth/signout`, {
    withCredentials: true,
  });
  return data;
};
