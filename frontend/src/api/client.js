import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const requestUrl = err.config?.url || "";
      const requestPath = (() => {
        try {
          return new URL(requestUrl, window.location.origin).pathname;
        } catch {
          return requestUrl;
        }
      })();
      const isAuthRequest = ["/auth/login", "/auth/register", "/auth/forgot-password"].some((path) => requestPath.endsWith(path) || requestPath.includes(path));
      if (!isAuthRequest) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default client;
