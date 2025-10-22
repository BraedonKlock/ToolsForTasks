import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hydrate from sessionStorage on first load
  useEffect(() => {
    const savedToken = sessionStorage.getItem("tft_token") || "";
    const savedUser = sessionStorage.getItem("tft_user");
    try {
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      setAccessToken(savedToken);
      setUser(parsedUser);
      setIsLoggedIn(!!savedToken);
    } catch {
    }
  }, []);

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
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
