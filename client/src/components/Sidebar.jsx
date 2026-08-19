import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.role || "staff";

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: ["admin", "manager", "staff"],
    },
    {
      name: "Products",
      path: "/products",
      roles: ["admin", "manager", "staff"],
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      roles: ["admin", "manager", "staff"],
    },
     {
      name: "Purchases",
      path: "/purchases",
      roles: ["admin", "manager", "staff"],
    },

    {
      name: "Sales",
      path: "/sales",
      roles: ["admin", "manager", "staff"],
    },
   
    
    {
      name: "Reports",
      path: "/reports",
      roles: ["admin", "manager", "staff"],
    },
  ];

  const allowedMenuItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-header">

        <div className="sidebar-logo">
          <h2>Inventory</h2>
          <span>Management System</span>
        </div>

      </div>


      {/* User Profile */}
      <div className="sidebar-profile">

        <div className="profile-avatar">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="profile-details">

          <strong>
            {user?.name || "User"}
          </strong>

          <span>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>

        </div>

      </div>


      {/* Navigation */}
      <div className="sidebar-navigation">

        <p className="menu-title">
          MENU
        </p>

        <nav className="sidebar-menu">

          {allowedMenuItems.map((item) => {

            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(
                `${item.path}/`
              );

            return (
              <button
                key={item.name}
                className={`sidebar-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >

                <span className="sidebar-item-text">
                  {item.name}
                </span>

              </button>
            );
          })}

        </nav>

      </div>


      {/* Bottom */}
      <div className="sidebar-bottom">

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;