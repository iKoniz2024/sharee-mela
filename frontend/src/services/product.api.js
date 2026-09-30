import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const getProducts = async (params = {}) => {
  const { data } = await axiosPublic.get("/products", { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axiosPublic.get(`/products/${id}`);
  return data;
};

export const getFlashSaleProducts = async () => {
  const { data } = await axiosPublic.get("/products/flash-sale");
  return data;
};

export const getBestSellingProducts = async () => {
  const { data } = await axiosPublic.get("/products/best-sellers");
  return data;
};

export const getNewArrivals = async () => {
  const { data } = await axiosPublic.get("/products/new-arrivals");
  return data;
};

export const getLatestReviews = async () => {
  const { data } = await axiosPublic.get("/products/reviews");
  return data;
};

export const getFeaturedProducts = async () => {
  const { data } = await axiosPublic.get("/products/featured");
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await axiosSecure.post("/products", payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await axiosSecure.patch(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await axiosSecure.delete(`/products/${id}`);
  return data;
};
