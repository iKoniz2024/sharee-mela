import axiosSecure from "../utils/axiosSecure";

export const getUsers = async () => {
  const { data } = await axiosSecure.get("/users");
  return data;
};

export const getProfile = async () => {
  const { data } = await axiosSecure.get("/users/profile");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await axiosSecure.patch("/users/profile", payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await axiosSecure.patch("/users/change-password", payload);
  return data;
};
