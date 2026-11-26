import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  
const fetchDashboard = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const response = await fetch(
      "https://inventory-management-system-lzyk.onrender.com/dashboard",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Dashboard Status:", response.status);
    console.log("Dashboard Response:", data);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
      return;
    }

    if (response.status === 403) {
      setError("Access denied. Your account does not have permission.");
      return;
    }

    if (!response.ok) {
      setError(data.message || "Failed to load dashboard");
      return;
    }

    setDashboard(data);
  } catch (error) {
    console.log("Dashboard Error:", error);
    setError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
}, [navigate]);

  useEffect(() => {
  const loadDashboard = async () => {
    await fetchDashboard();
  };

  loadDashboard();
}, []);
  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>{error}</h2>

        <button onClick={fetchDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  // =========================
  // Dashboard
  // =========================

  return (
    <div className="dashboard-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="dashboard-title">

        <div>
          <h1>Dashboard</h1>

          <p>
            Inventory overview and sales summary
          </p>
        </div>

        <button
          className="refresh-dashboard-btn"
          onClick={fetchDashboard}
        >
          Refresh
        </button>

      </div>


      {/* =========================
          STATISTICS CARDS
      ========================= */}

      <div className="dashboard-cards">

        {/* Total Products */}

        <div className="dashboard-card">

          <div className="card-icon">
            📦
          </div>

          <div>
            <h3>Total Products</h3>

            <h2>
              {dashboard?.totalProducts || 0}
            </h2>
          </div>

        </div>


        {/* Total Categories */}

        <div className="dashboard-card">

          <div className="card-icon">
            🗂️
          </div>

          <div>
            <h3>Total Categories</h3>

            <h2>
              {dashboard?.totalCategories || 0}
            </h2>
          </div>

        </div>


        {/* Low Stock */}

        <div className="dashboard-card">

          <div className="card-icon">
            ⚠️
          </div>

          <div>
            <h3>Low Stock</h3>

            <h2>
              {dashboard?.lowStockCount || 0}
            </h2>
          </div>

        </div>


        {/* Total Sales */}

        <div className="dashboard-card">

          <div className="card-icon">
            🛒
          </div>

          <div>
            <h3>Total Sales</h3>

            <h2>
              {dashboard?.totalSales || 0}
            </h2>
          </div>

        </div>


        {/* Inventory Value */}

        <div className="dashboard-card">

          <div className="card-icon">
            💰
          </div>

          <div>
            <h3>Inventory Value</h3>

            <h2>
              ₹
              {Number(
                dashboard?.inventoryValue || 0
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

        </div>


        {/* Today's Revenue */}

        <div className="dashboard-card">

          <div className="card-icon">
            📈
          </div>

          <div>
            <h3>Today's Revenue</h3>

            <h2>
              ₹
              {Number(
                dashboard?.todayRevenue || 0
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

        </div>


        {/* Monthly Orders */}

        <div className="dashboard-card">

          <div className="card-icon">
            📋
          </div>

          <div>
            <h3>Monthly Orders</h3>

            <h2>
              {dashboard?.monthlyOrders || 0}
            </h2>
          </div>

        </div>


        {/* Monthly Revenue */}

        <div className="dashboard-card">

          <div className="card-icon">
            💵
          </div>

          <div>
            <h3>Monthly Revenue</h3>

            <h2>
              ₹
              {Number(
                dashboard?.monthlyRevenue || 0
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

        </div>

      </div>


      {/* =========================
          LOW STOCK SECTION
      ========================= */}

      <div className="low-stock-section">

        <div className="section-header">

          <div>

            <h2>
              Low Stock Products
            </h2>

            <p>
              Products with quantity less than
              or equal to 5
            </p>

          </div>

          <button
            onClick={() => navigate("/products")}
          >
            View Products
          </button>

        </div>


        {/* No Low Stock */}

        {!dashboard?.lowStockProducts ||
        dashboard.lowStockProducts.length === 0 ? (

          <div className="empty-message">

            <div className="empty-icon">
              ✓
            </div>

            <h3>
              All Stock Levels Are Good
            </h3>

            <p>
              There are no low-stock products
              right now.
            </p>

          </div>

        ) : (

          /* Low Stock Table */

          <div className="low-stock-table">

            <table>

              <thead>

                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>

              </thead>


              <tbody>

                {dashboard.lowStockProducts.map(
                  (product) => (

                    <tr key={product._id}>

                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>

                      <td>
                        {product.sku || "-"}
                      </td>

                      <td>
                        {product.category || "-"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>

                        <span className="stock-danger">

                          {product.quantity}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Dashboard;