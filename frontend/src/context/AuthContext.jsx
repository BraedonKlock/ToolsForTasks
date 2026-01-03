import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Hydrate synchronously on FIRST render (no useEffect needed)
  const [accessToken, setAccessToken] = useState(() => {
    return sessionStorage.getItem("tft_token") || "";
  });

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("tft_user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!sessionStorage.getItem("tft_token");
  });

  const navigate = useNavigate();

  const login = (token, userObj) => {
    sessionStorage.setItem("tft_token", token);
    sessionStorage.setItem("tft_user", JSON.stringify(userObj));

    setAccessToken(token);
    setUser(userObj);
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem("tft_token");
    sessionStorage.removeItem("tft_user");

    setAccessToken("");
    setUser(null);
    setIsLoggedIn(false);

    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
