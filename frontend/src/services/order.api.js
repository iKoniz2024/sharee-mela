import axiosSecure from "../utils/axiosSecure";
import axiosPublic from "../utils/axiosPublic";

export const getOrders = async () => {
  const { data } = await axiosSecure.get("/orders");
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await axiosSecure.get(`/orders/${id}`);
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await axiosSecure.post("/orders", payload);
  return data;
};

export const createGuestOrder = async (payload) => {
  const { data } = await axiosPublic.post("/orders/guest", payload);
  return data;
};

export const trackOrder = async (payload) => {
  const { data } = await axiosPublic.post("/orders/track", payload);
  return data;
};

export const cancelOrder = async (id) => {
  const { data } = await axiosSecure.patch(`/orders/${id}/cancel`);
  return data;
};

export const getAllOrders = async () => {
  const { data } = await axiosSecure.get("/orders/all");
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await axiosSecure.get("/orders/dashboard-stats");
  return data;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const { data } = await axiosSecure.patch(`/orders/${id}/status`, { orderStatus });
  return data;
};

export const sendOrderInvoice = async (orderId) => {
  const { data } = await axiosPublic.post(`/orders/${orderId}/invoice`);
  return data;
};

export const deleteOrder = async (id) => {
  const { data } = await axiosSecure.delete(`/orders/${id}`);
  return data;
};

export const getRecentSales = async () => {
  const { data } = await axiosPublic.get("/orders/recent-sales");
  return data;
};
