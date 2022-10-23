import Router from "next/router";
import { createContext, ReactNode, useState } from "react";
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

  async function singIn({ email, password }: SingInCredentials) {
    try {
      // realiza chamada para a api que autentica no backend
      const resp = await api.post("sessions", {
        email,
        password,
      });

      // extrai lista de permissions e roles
      const { token, refreshToken, permissions, roles } = resp.data;

      // caso tudo retorne, cria usuario
      setUser({
        email,
        permissions,
        roles,
      });

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
