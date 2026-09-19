import axios from "axios";
import apiClient from "./apiClient";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const registerUser = async (
  data: RegisterData,
): Promise<User> => {
  const response = await axios.post<User>(
    `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"}/auth/register`,
    data,
  );

  return response.data;
};

export const loginUser = async (
  data: LoginData,
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"}/auth/login`,
    data,
  );

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(
    "/users/me",
  );

  return response.data;
};

