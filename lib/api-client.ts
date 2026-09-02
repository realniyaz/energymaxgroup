import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://straightfacedly-superjacent-kalel.ngrok-free.dev";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export const setRefreshToken = (token: string | null) => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("admin_refresh_token", token);
    } else {
      localStorage.removeItem("admin_refresh_token");
    }
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_refresh_token");
  }
  return null;
};

// Inject Bearer token & ngrok headers on every outgoing request
apiClient.interceptors.request.use((config) => {
  if (inMemoryAccessToken) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  config.headers["ngrok-skip-browser-warning"] = "true";
  return config;
});

// Response Interceptor for Token Refresh Handling
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.refresh_token) {
      setRefreshToken(response.data.refresh_token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes("/api/v1/admin/auth/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      try {
        const refreshUrl = refreshToken
          ? `${API_BASE_URL}/api/v1/admin/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`
          : `${API_BASE_URL}/api/v1/admin/auth/refresh`;

        const response = await axios.post(
          refreshUrl,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const { access_token, refresh_token: newRefresh } = response.data;
        setAccessToken(access_token);
        if (newRefresh) setRefreshToken(newRefresh);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        setRefreshToken(null);
        if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);