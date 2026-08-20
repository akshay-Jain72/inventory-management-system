import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Sidebar toggle state

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

  // Link click hone par sidebar close ho jaye
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
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
            MOBILE HAMBURGER BUTTON (3 Lines)
        ====================================== */}
        <button 
          className="hamburger-btn" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isOpen ? "open" : ""}`}></span>
        </button>


        {/* =====================================
            CENTER - NAVIGATION (Desktop View)
        ====================================== */}
        <nav className="navbar-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Products
          </NavLink>
          <NavLink
            to="/suppliers"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Suppliers
          </NavLink>
          <NavLink
            to="/purchases"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Purchases
          </NavLink>
          <NavLink
            to="/sales"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Sales
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Reports
          </NavLink>
        </nav>


        {/* =====================================
            RIGHT - ROLE + LOGOUT (Desktop View)
        ====================================== */}
        <div className="navbar-right">
          <div className="user-info">
            <div className="user-avatar">{roleInitial}</div>
            <div className="user-details">
              <span className="user-role">{userRole}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Logout">
            <span className="logout-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>

      </header>


      {/* =====================================
          MOBILE SIDEBAR OVERLAY & DRAWER
      ====================================== */}
      <div className={`mobile-sidebar-overlay ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(false)}></div>
      
      <div className={`mobile-sidebar ${isOpen ? "active" : ""}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {/* Sidebar Links */}
        <nav className="sidebar-menu">
          <NavLink to="/dashboard" onClick={handleLinkClick} className="sidebar-link">
            Dashboard
          </NavLink>
          <NavLink to="/products" onClick={handleLinkClick} className="sidebar-link">
            Products
          </NavLink>
          <NavLink to="/suppliers" onClick={handleLinkClick} className="sidebar-link">
            Suppliers
          </NavLink>
          <NavLink to="/purchases" onClick={handleLinkClick} className="sidebar-link">
            Purchases
          </NavLink>
          <NavLink to="/sales" onClick={handleLinkClick} className="sidebar-link">
            Sales
          </NavLink>
          <NavLink to="/reports" onClick={handleLinkClick} className="sidebar-link">
            Reports
          </NavLink>
        </nav>

        {/* Sidebar Footer (Role & Logout) */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{roleInitial}</div>
            <div className="user-details">
              <span className="user-role">{userRole}</span>
            </div>
          </div>
          <button className="logout-button" onClick={() => { handleLinkClick(); handleLogout(); }}>
            <span className="logout-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;