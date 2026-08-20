import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Logged-in user ka role
  const userRole = user?.role || "staff";

  // Role ka first letter
  const roleInitial = userRole.charAt(0).toUpperCase();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">

      {/* =====================================
          LEFT - LOGO / BRAND
      ====================================== */}

      <div className="navbar-brand">

        <div className="brand-icon">
          IM
        </div>

        <div className="brand-text">
          <h2>Inventory</h2>
          <span>Management</span>
        </div>

      </div>


      {/* =====================================
          CENTER - NAVIGATION
      ====================================== */}

      <nav className="navbar-menu">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/suppliers"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Suppliers
        </NavLink>

        <NavLink
          to="/purchases"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Purchases
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Sales
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          Reports
        </NavLink>

      </nav>


      {/* =====================================
          RIGHT - ROLE + LOGOUT
      ====================================== */}

      <div className="navbar-right">

        {/* Logged-in Role */}

        <div className="user-info">

          <div className="user-avatar">
            {roleInitial}
          </div>

          <div className="user-details">
            <span className="user-role">
              {userRole}
            </span>
          </div>

        </div>


        {/* Logout Button */}

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="logout-icon">↪</span>
          <span>Logout</span>
        </button>

      </div>

    </header>
  );
};

export default Navbar;