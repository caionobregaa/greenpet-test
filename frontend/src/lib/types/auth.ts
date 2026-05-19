export interface User {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}
