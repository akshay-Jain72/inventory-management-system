
import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Components
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Users from "./pages/Users";

import "./App.css";

// ======================================
// BLOCKED USER CHECKER
// ======================================

const BlockedUserChecker = () => {

  useEffect(() => {

    const checkUser = async () => {

      const token = localStorage.getItem("token");

      if (!token) return;

      try {

        const response = await fetch(
          "https://inventory-management-system-lzyk.onrender.com/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Blocked user OR expired/invalid token
        if (response.status === 403 || response.status === 401) {

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.location.href = "/login";

        }

      } catch (error) {

        console.error("User status check failed:", error);

      }

    };

    // Check immediately
    checkUser();

    // Check every 10 seconds
    const interval = setInterval(checkUser, 10000);

    return () => clearInterval(interval);

  }, []);

  return null;
};

// ======================================
// PROTECTED ROUTE
// ======================================

const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!userData) {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;

  }

  try {

    JSON.parse(userData);

  } catch {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;

  }

  return children;

};

// ======================================
// APP
// ======================================

const App = () => {

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* PROTECTED ROUTES */}

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

};

// ======================================
// DASHBOARD LAYOUT
// ======================================

const DashboardLayout = () => {

  return (

    <div className="app-layout">

      {/* BLOCK CHECKER */}

      <BlockedUserChecker />

      {/* NAVBAR */}

      <Navbar />

      {/* PAGE CONTENT */}

      <main className="page-content">

        <Routes>

          {/* DEFAULT */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* PRODUCTS */}

          <Route
            path="/products"
            element={<Products />}
          />

          {/* PURCHASES */}

          <Route
            path="/purchases"
            element={<Purchases />}
          />

          {/* SALES */}

          <Route
            path="/sales"
            element={<Sales />}
          />

          {/* SUPPLIERS */}

          <Route
            path="/suppliers"
            element={<Suppliers />}
          />

          {/* REPORTS */}

          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* USERS */}

          <Route
            path="/users"
            element={<Users />}
          />

          {/* UNKNOWN URL */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>

  );

};

export default App;
