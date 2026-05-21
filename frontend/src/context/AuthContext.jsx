// Auth context — stores the logged in user, token, login/register/logout

import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load: if we have a token, fetch the current user
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);

      setUser(data);

      toast.success("Welcome back!");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  // REGISTER
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", data.token);

      setUser(data);

      toast.success("Account created!");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Register failed"
      );
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");

    setUser(null);

    toast.success("Logged out");
  };

  // Update local user state after profile update
  const updateUser = (data) => {
    setUser((u) => ({
      ...u,
      ...data,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

