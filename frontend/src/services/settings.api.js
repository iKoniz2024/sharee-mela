import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const getSettings = async () => {
  const { data } = await axiosPublic.get("/settings");
  return data;
};

export const updateSettings = async (payload) => {
  const { data } = await axiosSecure.patch("/settings", payload);
  return data;
};
