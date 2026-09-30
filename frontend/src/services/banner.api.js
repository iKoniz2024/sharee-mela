import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const getBanners = async () => {
  const { data } = await axiosPublic.get("/banners");
  return data;
};

export const getBannerById = async (id) => {
  const { data } = await axiosPublic.get(`/banners/${id}`);
  return data;
};

export const createBanner = async (payload) => {
  const { data } = await axiosSecure.post("/banners", payload);
  return data;
};

export const updateBanner = async (id, payload) => {
  const { data } = await axiosSecure.patch(`/banners/${id}`, payload);
  return data;
};

export const deleteBanner = async (id) => {
  const { data } = await axiosSecure.delete(`/banners/${id}`);
  return data;
};
