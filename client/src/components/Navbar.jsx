import React from "react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  // URL ke according page name
  const getPageName = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard";

      case "/products":
        return "Products";

      case "/purchases":
        return "Purchases";

      case "/sales":
        return "Sales";

      case "/suppliers":
        return "Suppliers";

      case "/reports":
        return "Reports";

      default:
        return "Dashboard";
    }
  };

  const pageName = getPageName();

  return (
    <header className="navbar">

      {/* Left */}
      <div className="navbar-left">
        <h2>{pageName}</h2>
      </div>

      {/* Right */}
      <div className="navbar-right">

        {/* User Info */}
        <div className="user-info">

          <div className="user-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="user-details">

            <p className="user-name">
              {user?.name || "User"}
            </p>

            <p className="user-role">
              {user?.role || "staff"}
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;