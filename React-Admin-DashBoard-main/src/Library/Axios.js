import axios from "axios";

const axiosInstance = axios.create({
// baseURL: "https://ttdashboard04.onrender.com/api",
baseURL: process.env.REACT_APP_API_URL || "https://ttdashboard04.onrender.com/api",
});

export default axiosInstance;
//baseURL: "https://ttdashboard04.onrender.com/api",
