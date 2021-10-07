import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../connection/api";
import { AxiosResponse } from "axios";

import { SignInForm } from "../pages/authentication/SignIn";
import showToast from "../utils/showToast";
import { SignUpForm } from "../pages/authentication/SignUp";

interface AuthContextData {
  isSigned: boolean;
  token: string | null;
  signIn: (formData: SignInForm) => Promise<number>;
  signOut: () => void;
  signUp: (formData: SignUpForm) => Promise<number>;
  confirmToken: (verification_token: string) => Promise<number>;
  phone: string | null;
}

interface SignInResponse {
  message: string;
  token: string;
}

interface SignUpResponse {
  message: string;
  token: string;
}

export const AuthContext = React.createContext<AuthContextData>(
  {} as AuthContextData
);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [isSigned, setIsSigned] = React.useState<boolean>(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [phone, setPhone] = React.useState<string | null>(null);

  const getTokenFromStorage = async () => {
    const token = await AsyncStorage.getItem("@Cantinho:token");

    if (token) {
      setToken(token);
      setIsSigned(true);
    } else {
      setToken(null);
      setIsSigned(false);
    }
  };

  React.useEffect(() => {
    getTokenFromStorage();
  }, []);

  async function signIn(formData: SignInForm) {
    try {
      const response = (await api.post(
        "/auth/signin",
        formData
      )) as AxiosResponse<SignInResponse>;
      setPhone(formData.phone);
      if (response.status === 200 && response.data.token) {
        await AsyncStorage.setItem("@Cantinho:token", response.data.token);
        setToken(response.data.token);
        return 200;
      }
    } catch (err: any) {
      if (err.response.status === 400) {
        showToast("Telefone ou senha incorretos.");
      }
      if (err.response.status === 404) {
        showToast("Telefone não cadastrado.");
      }
      if (err.response.status === 422) {
        showToast("Telefone não verificado.");
      }
      return err.response.status;
    }
    return 0;
  }

  async function signUp(formData: SignUpForm): Promise<number> {
    try {
      const response = (await api.post("/users", {
        phone: formData.phone,
        password: formData.password,
      })) as AxiosResponse<SignUpResponse>;

      if (response.status === 200) {
        setPhone(formData.phone);
        return 200;
      }
    } catch (err: any) {
      if (err.response.status === 422) {
        showToast("Usuário já cadastrado.");
      }
      return err.response.status;
    }
    return 0;
  }

  async function confirmToken(verification_token: string) {
    try {
      const response = (await api.post("/auth/verify", {
        phone,
        verification_token,
      })) as AxiosResponse<{ message: string; token: string }>;
      if (response.status === 200) {
        setToken(response.data.token);
      }
    } catch (err: any) {
      if (err.response.status === 404) {
        showToast("Não existe usuário com esse telefone.");
      }
      if (err.response.status === 422) {
        showToast("Token incorreto.");
      }
      return err.response.status;
    }
  }

  async function signOut() {
    setToken(null);
    setIsSigned(false);
    await AsyncStorage.removeItem("@Cantinho:token");
  }

  return (
    <AuthContext.Provider
      value={{ isSigned, token, signIn, signOut, signUp, confirmToken, phone }}
    >
      {children}
    </AuthContext.Provider>
  );
};
