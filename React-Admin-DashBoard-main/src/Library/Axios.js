import axios from "axios";

const axiosInstance = axios.create({
  // Development URL - change to production URL when deploying
//   baseURL: "http://localhost:5000/api",
  baseURL: "https://ttdashboard04.onrender.com/api",
  // Production URL: "https://ttdashboard04.onrender.com/api"
});

export default axiosInstance;
