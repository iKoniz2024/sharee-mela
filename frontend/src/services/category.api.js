import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const getCategories = async () => {
  const { data } = await axiosPublic.get("/categories");
  return data;
};

export const getCategoriesWithCounts = async () => {
  const { data } = await axiosPublic.get("/categories/with-counts");
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await axiosSecure.post("/categories", payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await axiosSecure.patch(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await axiosSecure.delete(`/categories/${id}`);
  return data;
};
