import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();
const TOKEN_NAME = "blasttype_token";
const COOKIE_EXPIRY = 7; // 7 days

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Base API URL - replace with your actual API URL when deploying
import { API_URL } from "./api";

/**
 * Login user with credentials
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

/**
 * Register a new user
 */
export const registerUser = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/signup`, credentials);
  return response.data;
};

/**
 * Store authentication token in cookie (valid for 7 days)
 */
export const storeAuthToken = (token: string): void => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY);
  
  cookies.set(TOKEN_NAME, token, {
    path: "/",
    expires: expiryDate,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });
};

/**
 * Get authentication token from cookie
 */
export const getAuthToken = (): string | null => {
  return cookies.get(TOKEN_NAME) || null;
};

/**
 * Remove authentication token from cookie
 */
export const removeAuthToken = (): void => {
  cookies.remove(TOKEN_NAME, { path: "/" });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};