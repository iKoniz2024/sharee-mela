import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const loginUser = async (payload) => {
  const { data } = await axiosPublic.post("/auth/login", payload);
  return data;
};

export const logoutUser = async () => {
  const { data } = await axiosSecure.post("/auth/logout");
  return data;
};

export const getProfile = async () => {
  const { data } = await axiosSecure.get("/users/profile");
  return data;
};
