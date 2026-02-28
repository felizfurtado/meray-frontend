import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    const companySlug = localStorage.getItem("company_slug");
    const companyName = localStorage.getItem("company_name");

    if (access && companySlug) {
      setIsAuthenticated(true);
      setUser({ username });
      setCompany({ slug: companySlug, name: companyName });
    }

    setLoading(false);
  }, []);

  const login = ({ access, refresh, username, companySlug, companyName }) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("username", username);
    localStorage.setItem("company_slug", companySlug);
    localStorage.setItem("company_name", companyName);

    setIsAuthenticated(true);
    setUser({ username });
    setCompany({ slug: companySlug, name: companyName });
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setCompany(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};