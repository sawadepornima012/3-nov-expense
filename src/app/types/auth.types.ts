export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  confirmPassword: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  name: string;
  email: string;
  token?: string;
}