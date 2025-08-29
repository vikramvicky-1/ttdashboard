import axios from "axios";

const axiosInstance = axios.create({
  // Development URL - change to production URL when deploying
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://ttdashboard04.onrender.com/api",
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔧 AXIOS REQUEST INTERCEPTOR:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: config.baseURL + config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : "NONE",
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ TOKEN ADDED TO REQUEST HEADERS');
    } else {
      console.log('❌ NO TOKEN FOUND IN LOCALSTORAGE');
    }
    return config;
  },
  (error) => {
    console.log('❌ AXIOS REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ AXIOS RESPONSE SUCCESS:', {
      status: response.status,
      url: response.config?.url,
      fullURL: response.config?.baseURL + response.config?.url,
      method: response.config?.method?.toUpperCase(),
      dataSize: JSON.stringify(response.data).length + ' chars'
    });
    return response;
  },
  (error) => {
    console.log('🚨 AXIOS INTERCEPTOR - Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url,
      method: error.config?.method?.toUpperCase(),
      pathname: window.location.pathname,
      hasToken: !!localStorage.getItem('token'),
      errorData: error.response?.data
    });
    
    // Don't clear localStorage for 401 errors - let the AuthContext handle authentication state
    // The interceptor should only log errors, not manage authentication
    return Promise.reject(error);
  }
);

export default axiosInstance;
