import React from "react";

type AdminLevelContextValue = {
  adminLevel: number;
  loggedIn: boolean;
  windowHeight: number;
  isMobile: boolean;
  expandNavbar: boolean;
  setExpandNavbar: (expand: boolean) => void;
};

const AdminLevelContext = React.createContext<AdminLevelContextValue>({
  adminLevel: 0,
  loggedIn: false,
  windowHeight: 1080,
  isMobile: false,
  expandNavbar: false,
  setExpandNavbar: () => {},
});

export default AdminLevelContext;
