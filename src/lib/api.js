// src/lib/api.js
import axios from "axios";
import { API_KEY, BASE_URL } from "../utils/env";

const api = axios.create({
  baseURL: BASE_URL,
});
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  // apiKey selalu dikirim
  config.headers.apiKey = API_KEY;

  // auth token
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ⬇️ BEDAKAN antara FormData dan JSON
  if (config.data instanceof FormData) {
    // Biarkan axios/browser yg set Content-Type + boundary
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    // Default utk request biasa
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default api;
