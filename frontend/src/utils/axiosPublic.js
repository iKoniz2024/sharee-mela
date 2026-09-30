import axios from "axios";
import { getApiUrl } from "./getApiUrl";

const axiosPublic = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosPublic;
