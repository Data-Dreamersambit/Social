import axios from "axios";
import { API_BASE_URL } from "../apiUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: true,
});

// Signup
export const signup = (email, password, fullName, username) =>
  api.post("/signup", { email, password, fullName, username });

// Login
export const login = (email, password) =>
  api.post("/login", { email, password });

// Get current user (requires token)
export const getCurrentUser = (token) =>
  axios.get(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

