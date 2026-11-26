
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // LOGIN USER
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  // USER ROLE
  const userRole = String(user?.role || "staff").toLowerCase();

  // ROLE INITIAL
  const roleInitial = userRole.charAt(0).toUpperCase();

  // ADMIN CHECK
  const isAdmin = userRole === "admin";

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsOpen(false);

    navigate("/login", { replace: true });
  };

  // CLOSE MOBILE MENU
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // NAVIGATION LINKS
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Products", path: "/products" },
    { name: "Suppliers", path: "/suppliers" },
    { name: "Purchases", path: "/purchases" },
    { name: "Sales", path: "/sales" },
    { name: "Reports", path: "/reports" },
    ...(isAdmin ? [{ name: "UsersManagement", path: "/users" }] : []),
  ];

  return (
    <>
      {/* ================================
          MAIN NAVBAR
      ================================= */}
      <header className="navbar">

        {/* LOGO */}
        <div className="navbar-brand">
          <div className="brand-icon">
            IM
          </div>

          <div className="brand-text">
            <h2>Inventory</h2>
            <span>Management</span>
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          aria-expanded={isOpen}
        >
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
        </button>

        {/* DESKTOP NAVIGATION */}
        <nav className="navbar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="navbar-right">

          {/* USER INFO */}
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

          {/* LOGOUT */}
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="logout-icon">↪</span>
            <span>Logout</span>
          </button>

        </div>
      </header>

      {/* =================================
          MOBILE OVERLAY
      ================================== */}
      <div
        className={`mobile-sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* =================================
          MOBILE SIDEBAR
      ================================== */}
      <div className={`mobile-sidebar ${isOpen ? "active" : ""}`}>

        {/* SIDEBAR HEADER */}
        <div className="sidebar-header">
          <h3>Menu</h3>

          <button
            type="button"
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* MOBILE LINKS */}
        <nav className="sidebar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* MOBILE FOOTER */}
        <div className="sidebar-footer">

          {/* USER */}
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

          {/* LOGOUT */}
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="logout-icon">↪</span>
            <span>Logout</span>
          </button>

        </div>

      </div>
    </>
  );
};

export default Navbar;
