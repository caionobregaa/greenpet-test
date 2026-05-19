import { api } from "./client";
import type { LoginResponse } from "@/lib/types/auth";

export const apiAuth = {
  login: async (email: string, senha: string): Promise<LoginResponse> => {
    const { data } = await api.post<{ data: LoginResponse }>("/auth/login", { email, password: senha });
    return data.data;
  },

  refresh: async (refreshToken: string) => {
    const { data } = await api.post("/auth/refresh", { refreshToken });
    return data;
  },

  logout: async (refreshToken: string) => {
    await api.post("/auth/logout", { refreshToken });
  },
};
