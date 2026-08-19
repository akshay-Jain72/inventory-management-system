import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar";
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

import "./App.css";

// ======================================
// Protected Route
// ======================================

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Login nahi hai
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User data nahi mila
  if (!user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  return children;
};

// ======================================
// App
// ======================================

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================
            PUBLIC ROUTES
        ================================= */}

        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />


        {/* =================================
            PROTECTED ROUTES
        ================================= */}

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
// Dashboard Layout
// ======================================

const DashboardLayout = () => {

  return (
    <div className="app-layout">

      {/* ================================
          SIDEBAR
      ================================= */}

      <Sidebar />


      <div className="main-area">

        {/* ================================
            NAVBAR
        ================================= */}

        <Navbar />


        {/* ================================
            PAGE CONTENT
        ================================= */}

        <main className="page-content">

          <Routes>

            {/* =================================
                DEFAULT
            ================================= */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />


            {/* =================================
                DASHBOARD
            ================================= */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            {/* =================================
                PRODUCTS

                Staff:
                View products only

                Manager/Admin:
                Add/Edit/Delete
            ================================= */}

            <Route
              path="/products"
              element={<Products />}
            />


            {/* =================================
                PURCHASES

                Staff:
                View only

                Manager/Admin:
                Add/Edit/Delete
            ================================= */}

            <Route
              path="/purchases"
              element={<Purchases />}
            />


            {/* =================================
                SALES

                Staff:
                Add/View sales

                Manager/Admin:
                Add/Edit/Delete
            ================================= */}

            <Route
              path="/sales"
              element={<Sales />}
            />


            {/* =================================
                SUPPLIERS

                Staff:
                View suppliers

                Manager/Admin:
                Add/Edit/Delete
            ================================= */}

            <Route
              path="/suppliers"
              element={<Suppliers />}
            />


            {/* =================================
                REPORTS

                Staff:
                Basic reports

                Manager/Admin:
                Full reports
            ================================= */}

            <Route
              path="/reports"
              element={<Reports />}
            />


            {/* =================================
                UNKNOWN URL
            ================================= */}

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

    </div>
  );
};

export default App;