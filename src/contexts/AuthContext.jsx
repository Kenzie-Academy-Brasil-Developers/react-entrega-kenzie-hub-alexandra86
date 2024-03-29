import { useEffect, useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/axiosClient";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [newLoading, setNewLoading] = useState(true);
  const navigate = useNavigate();

  async function getUser() {
    const tokenValidate = localStorage.getItem("@TOKEN");

    if (!tokenValidate) {
      setNewLoading(false);
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${tokenValidate}`;

    try {
      const response = await api.get("/profile");

      setUser(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setNewLoading(false);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  async function NewRegister(data) {
    try {
      setLoading(true);
      const response = await api.post("/users", data);
      toast.success("Cadastro relizado com sucesso!");
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (error) {
      toast.error("Usuário já cadastrado!");
    } finally {
      setLoading(false);
    }
  }

  async function NewLogin(data) {
    try {
      setLoading(true);
      const response = await api.post("/sessions", data);
      localStorage.setItem("@TOKENUSER", response.data.token);
      const { token, user: userResponse } = response.data;
      setUser(userResponse);
      localStorage.setItem("@TOKEN", token);
      toast.success("Login relizado com sucesso!");

      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      setTimeout(() => {
        navigate("/home");
      }, 3000);
    } catch (error) {
      toast.error("Usuário não encontrado!");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        NewLogin,
        loading,
        user,
        setLoading,
        NewRegister,
        newLoading,
        setNewLoading,
        toast,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
