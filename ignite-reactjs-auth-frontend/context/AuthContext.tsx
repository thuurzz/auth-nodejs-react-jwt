import Router from "next/router";
import { parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type SingInCredentials = {
  email: string;
  password: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type AuthContextData = {
  singIn(credentials: SingInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User | undefined;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  // usuario so estara presente, caso autenticacao true
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();
    if (token) {
      api.get("/me").then((resp) => {
        const { email, roles, permissions } = resp.data;
        setUser({ email, roles, permissions });
      });
    }
  }, []);

  async function singIn({ email, password }: SingInCredentials) {
    try {
      // realiza chamada para a api que autentica no backend
      const resp = await api.post("sessions", {
        email,
        password,
      });

      // extrai lista de permissions e roles
      const { token, refreshToken, permissions, roles } = resp.data;

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias,
        path: "/",
      });
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias,
        path: "/",
      });

      // caso tudo retorne, cria usuario
      setUser({
        email,
        permissions,
        roles,
      });

      // atualiza headers ante de redirecionar usuario
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      // redireciona usuario para a rota
      Router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ singIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
