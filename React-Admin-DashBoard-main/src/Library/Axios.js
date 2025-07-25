import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ttdashboard04.onrender.com/api",
});

export default axiosInstance;
