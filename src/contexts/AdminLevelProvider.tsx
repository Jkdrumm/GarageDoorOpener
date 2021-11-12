import React, { useEffect, useState } from "react";
import AdminLevelContext from "./AdminLevelContext";
import Cookies from "js-cookie";

interface AdminLevelProviderProps {
  children: React.ReactNode;
}

const AdminLevelProvider = ({ children }: AdminLevelProviderProps) => {
  const [adminLevel, setAdminLevel] = useState<number>(0);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 576);
  const [expandNavbar, setExpandNavbar] = useState<boolean>(false);

  useEffect(() => {
    const levelCookie = Cookies.get("level");
    setAdminLevel(Number(levelCookie) || 0);
    setLoggedIn(levelCookie !== undefined);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", () => {
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 576);
    });
  }, []);

  return (
    <AdminLevelContext.Provider
      value={{
        adminLevel,
        loggedIn,
        windowHeight,
        isMobile,
        expandNavbar,
        setExpandNavbar,
      }}
    >
      {children}
    </AdminLevelContext.Provider>
  );
};

export default AdminLevelProvider;
