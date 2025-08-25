import axios from "axios";

const axiosInstance = axios.create({
baseURL: "https://ttdashboard04.onrender.com/api",
//baseURL: "http://localhost:5000/api",
});

export default axiosInstance;
//baseURL: "https://ttdashboard04.onrender.com/api",
