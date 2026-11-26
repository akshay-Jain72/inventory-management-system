
// import { useNavigate, useLocation } from "react-router-dom";
// import "./Sidebar.css";

// const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // LOGIN USER
//   const user = (() => {
//   try {
//     return JSON.parse(localStorage.getItem("user") || "{}");
//   } catch {
//     return {};
//   }
// })();

// const role = String(user?.role || "staff").toLowerCase();

//   // MENU ITEMS
//   const menuItems = [
//     {
//       name: "Dashboard",
//       path: "/dashboard",
//       roles: ["admin", "manager", "staff"],
//     },
//     {
//       name: "Products",
//       path: "/products",
//       roles: ["admin", "manager", "staff"],
//     },
//     {
//       name: "Suppliers",
//       path: "/suppliers",
//       roles: ["admin", "manager", "staff"],
//     },
//     {
//       name: "Purchases",
//       path: "/purchases",
//       roles: ["admin", "manager", "staff"],
//     },
//     {
//       name: "Sales",
//       path: "/sales",
//       roles: ["admin", "manager", "staff"],
//     },
//     {
//       name: "Reports",
//       path: "/reports",
//       roles: ["admin", "manager", "staff"],
//     },
//     {
//       name: "Users",
//       path: "/users",
//       roles: ["admin"],
//     },
//   ];

//   // FILTER MENU BY ROLE
//   const allowedMenuItems = menuItems.filter((item) =>
//     item.roles.includes(role)
//   );

//   // NAVIGATION
//   const handleMenuClick = (path) => {
//     navigate(path);
//     setSidebarOpen(false);
//   };

//   // LOGOUT
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     setSidebarOpen(false);

//     navigate("/login", { replace: true });
//   };

//   return (
//     <aside
//       className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
//     >
//       {/* HEADER */}
//       <div className="sidebar-header">
//         <div className="sidebar-logo">
//           <h2>Inventory</h2>
//           <span>Management System</span>
//         </div>

//         {/* MOBILE CLOSE */}
//         <button
//           type="button"
//           className="sidebar-close-button"
//           onClick={() => setSidebarOpen(false)}
//           aria-label="Close menu"
//         >
//           ×
//         </button>
//       </div>

//       {/* NAVIGATION */}
//       <div className="sidebar-navigation">
//         <p className="menu-title">MENU</p>

//         <nav className="sidebar-menu">
//           {allowedMenuItems.map((item) => {
//             const isActive =
//               location.pathname === item.path ||
//               location.pathname.startsWith(`${item.path}/`);

//             return (
//               <button
//                 key={item.name}
//                 type="button"
//                 className={`sidebar-item ${isActive ? "active" : ""}`}
//                 onClick={() => handleMenuClick(item.path)}
//               >
//                 <span className="sidebar-item-text">
//                   {item.name}
//                 </span>
//               </button>
//             );
//           })}
//         </nav>
//       </div>

//       {/* USER PROFILE */}
//       <div className="sidebar-user-info">
//         <div className="sidebar-user-avatar">
//           {(user?.name || "U").charAt(0).toUpperCase()}
//         </div>

//         <div className="sidebar-user-details">
//           <strong>{user?.name || "User"}</strong>
//           <span>{role}</span>
//         </div>
//       </div>

//       {/* LOGOUT */}
//       <div className="sidebar-bottom">
//         <button
//           type="button"
//           className="logout-button"
//           onClick={handleLogout}
//         >
//           <span>↪</span>
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
