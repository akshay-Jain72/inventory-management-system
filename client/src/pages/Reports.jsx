
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Reports.css";

const API_URL = "https://inventory-management-system-lzyk.onrender.com";

const Reports = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [bestSelling, setBestSelling] = useState([]);
  const [profit, setProfit] = useState(null);
  const [todaySales, setTodaySales] = useState(null);
  const [lowStock, setLowStock] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // USER / ROLE
  // ================================

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const role = String(user?.role || "staff")
    .toLowerCase()
    .trim();

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isStaff = role === "staff";

  // Admin: Full financial reports
  // Manager: Operational reports + product prices
  // Staff: Operational reports without prices

  const canViewPrice = isAdmin || isManager;
  const canViewFinancialReports = isAdmin;

  // ================================
  // CURRENCY
  // ================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ================================
  // RESPONSE HANDLER
  // ================================

  const readResponse = async (response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  // ================================
  // FETCH REPORTS
  // ================================

  const fetchReports = async (isRefresh = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
      setError("");
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // ================================
      // REQUESTS
      // ================================

      const requests = [
        fetch(`${API_URL}/dashboard`, {
          method: "GET",
          headers,
        }),

        ...(canViewFinancialReports
          ? [
              fetch(`${API_URL}/monthly-revenue`, {
                method: "GET",
                headers,
              }),
            ]
          : []),

        fetch(`${API_URL}/best-selling`, {
          method: "GET",
          headers,
        }),

        ...(canViewFinancialReports
          ? [
              fetch(`${API_URL}/profit`, {
                method: "GET",
                headers,
              }),
            ]
          : []),

        fetch(`${API_URL}/today-sales`, {
          method: "GET",
          headers,
        }),

        fetch(`${API_URL}/low-stock`, {
          method: "GET",
          headers,
        }),
      ];

      const responses = await Promise.all(requests);

      // ================================
      // AUTH CHECK
      // ================================

      const unauthorized = responses.some(
        (response) => response.status === 401
      );

      if (unauthorized) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      // ================================
      // RESPONSE INDEX
      // ================================

      let index = 0;

      const dashboardResponse = responses[index++];

      let monthlyResponse = null;
      let profitResponse = null;

      if (canViewFinancialReports) {
        monthlyResponse = responses[index++];
      }

      const bestSellingResponse = responses[index++];

      if (canViewFinancialReports) {
        profitResponse = responses[index++];
      }

      const todaySalesResponse = responses[index++];
      const lowStockResponse = responses[index++];

      // ================================
      // JSON DATA
      // ================================

      const dashboardData =
        await readResponse(dashboardResponse);

      const bestSellingData =
        await readResponse(bestSellingResponse);

      const todaySalesData =
        await readResponse(todaySalesResponse);

      const lowStockData =
        await readResponse(lowStockResponse);

      let monthlyData = null;
      let profitData = null;

      if (canViewFinancialReports) {
        monthlyData =
          await readResponse(monthlyResponse);

        profitData =
          await readResponse(profitResponse);
      }

      // ================================
      // ERROR CHECK
      // ================================

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardData.message ||
            "Failed to load dashboard report"
        );
      }

      if (!bestSellingResponse.ok) {
        throw new Error(
          bestSellingData.message ||
            "Failed to load best selling report"
        );
      }

      if (!todaySalesResponse.ok) {
        throw new Error(
          todaySalesData.message ||
            "Failed to load today's sales"
        );
      }

      if (!lowStockResponse.ok) {
        throw new Error(
          lowStockData.message ||
            "Failed to load low stock report"
        );
      }

      if (
        canViewFinancialReports &&
        !monthlyResponse.ok
      ) {
        throw new Error(
          monthlyData?.message ||
            "Failed to load monthly report"
        );
      }

      if (
        canViewFinancialReports &&
        !profitResponse.ok
      ) {
        throw new Error(
          profitData?.message ||
            "Failed to load profit report"
        );
      }

      // ================================
      // SET DATA
      // ================================

      setDashboard(dashboardData);

      setBestSelling(
        Array.isArray(bestSellingData)
          ? bestSellingData
          : bestSellingData?.products || []
      );

      setTodaySales(todaySalesData);
      setLowStock(lowStockData);

      // Admin financial reports only

      if (canViewFinancialReports) {
        setMonthlyRevenue(monthlyData);
        setProfit(profitData);
      } else {
        setMonthlyRevenue(null);
        setProfit(null);
      }

      setError("");
    } catch (err) {
      console.error("Reports Error:", err);

      setError(
        err.message || "Failed to load reports"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ================================
  // INITIAL LOAD
  // ================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 0);

    return () => {
      clearTimeout(timer);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================
  // SAFE VALUES
  // ================================

  const totalProducts =
    dashboard?.totalProducts ?? 0;

  const totalCategories =
    dashboard?.totalCategories ?? 0;

  const totalSales =
    dashboard?.totalSales ?? 0;

  const inventoryValue =
    dashboard?.inventoryValue ?? 0;

  const totalRevenue =
    profit?.totalRevenue ?? 0;

  const totalCost =
    profit?.totalCost ?? 0;

  const totalProfit =
    profit?.totalProfit ?? 0;

  const lowStockCount =
    lowStock?.count ??
    (Array.isArray(lowStock)
      ? lowStock.length
      : 0);

  const todayOrders =
    todaySales?.count ??
    todaySales?.totalSales ??
    todaySales?.totalOrders ??
    0;

  const todayRevenue =
    todaySales?.totalRevenue ??
    todaySales?.revenue ??
    0;

  const monthlyOrders =
    monthlyRevenue?.totalOrders ??
    monthlyRevenue?.count ??
    0;

  const monthlyTotalRevenue =
    monthlyRevenue?.totalRevenue ??
    monthlyRevenue?.revenue ??
    0;

  const profitDetails =
    Array.isArray(profit?.profitDetails)
      ? profit.profitDetails
      : [];

  const lowStockProducts =
    Array.isArray(lowStock?.products)
      ? lowStock.products
      : Array.isArray(lowStock)
        ? lowStock
        : [];

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="loading-spinner"></div>

          <h2>Loading Reports...</h2>

          <p>
            Please wait while we fetch your reports.
          </p>
        </div>
      </div>
    );
  }

  // ================================
  // ERROR
  // ================================

  if (error) {
    return (
      <div className="reports-page">
        <div className="reports-error">
          <h2>Unable to Load Reports</h2>

          <p>{error}</p>

          <button
            className="retry-btn"
            onClick={() => fetchReports(true)}
            disabled={refreshing}
          >
            {refreshing ? "Retrying..." : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // PAGE
  // ================================

  return (
    <div className="reports-page">

      {/* ================= HEADER ================= */}

      <div className="reports-header">
        <div>
          <span className="page-label">
            INVENTORY
          </span>

          <h1>Reports</h1>

          <p>
            View inventory, sales and business reports
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={() => fetchReports(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ================= ROLE INFO ================= */}

      <div className="report-role">
        <span>Logged in as</span>

        <strong>{role}</strong>

        {isStaff && (
          <small>
            Limited reports are available for staff.
          </small>
        )}

        {isManager && (
          <small>
            Inventory and operational reports are available.
          </small>
        )}

        {isAdmin && (
          <small>
            All inventory and financial reports are available.
          </small>
        )}
      </div>

      {/* ================= MAIN SUMMARY ================= */}

      <div className="report-cards">

        {/* Everyone */}

        <div className="report-card">
          <div className="card-content">
            <p>Total Products</p>

            <h2>{totalProducts}</h2>
          </div>
        </div>

        {/* Admin Only */}

        {canViewFinancialReports && (
          <div className="report-card">
            <div className="card-content">
              <p>Total Revenue</p>

              <h2>
                {formatCurrency(totalRevenue)}
              </h2>
            </div>
          </div>
        )}

        {/* Admin Only */}

        {canViewFinancialReports && (
          <div className="report-card">
            <div className="card-content">
              <p>Total Profit</p>

              <h2>
                {formatCurrency(totalProfit)}
              </h2>
            </div>
          </div>
        )}

        {/* Everyone */}

        <div className="report-card warning-card">
          <div className="card-content">
            <p>Low Stock</p>

            <h2>{lowStockCount}</h2>
          </div>
        </div>

      </div>

      {/* ================= TODAY'S REPORT ================= */}

      <div className="report-section">
        <div className="section-title">
          <div>
            <h2>Today's Sales</h2>

            <p>
              Overview of today's sales activity
            </p>
          </div>
        </div>

        <div className="today-grid">

          {/* Everyone */}

          <div className="small-report-card">
            <span>Orders Today</span>

            <h3>{todayOrders}</h3>
          </div>

          {/* Admin Only */}

          {canViewFinancialReports && (
            <div className="small-report-card">
              <span>Today's Revenue</span>

              <h3>
                {formatCurrency(todayRevenue)}
              </h3>
            </div>
          )}

          {/* Admin Only */}

          {canViewFinancialReports && (
            <div className="small-report-card">
              <span>Monthly Orders</span>

              <h3>{monthlyOrders}</h3>
            </div>
          )}

          {/* Admin Only */}

          {canViewFinancialReports && (
            <div className="small-report-card">
              <span>Monthly Revenue</span>

              <h3>
                {formatCurrency(
                  monthlyTotalRevenue
                )}
              </h3>
            </div>
          )}

          {/* Staff */}

          {isStaff && (
            <>
              <div className="small-report-card">
                <span>Total Products</span>

                <h3>{totalProducts}</h3>
              </div>

              <div className="small-report-card">
                <span>Low Stock</span>

                <h3>{lowStockCount}</h3>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ================= PROFIT REPORT ================= */}

      {/* Admin Only */}

      {canViewFinancialReports && (
        <div className="report-section">
          <div className="section-title">
            <div>
              <h2>Profit Report</h2>

              <p>
                Revenue, cost and profit analysis
              </p>
            </div>
          </div>

          <div className="profit-summary">

            <div>
              <span>Total Revenue</span>

              <strong>
                {formatCurrency(totalRevenue)}
              </strong>
            </div>

            <div>
              <span>Total Cost</span>

              <strong>
                {formatCurrency(totalCost)}
              </strong>
            </div>

            <div>
              <span>Total Profit</span>

              <strong className="profit-value">
                {formatCurrency(totalProfit)}
              </strong>
            </div>

          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Revenue</th>
                  <th>Cost</th>
                  <th>Profit</th>
                </tr>
              </thead>

              <tbody>
                {profitDetails.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-row"
                    >
                      No profit data found
                    </td>
                  </tr>
                ) : (
                  profitDetails.map(
                    (item, index) => (
                      <tr
                        key={
                          item.saleId ||
                          item._id ||
                          index
                        }
                      >
                        <td>
                          {item.product || "-"}
                        </td>

                        <td>
                          {item.quantity ?? 0}
                        </td>

                        <td>
                          {formatCurrency(
                            item.purchasePrice
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            item.sellingPrice
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            item.revenue
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            item.cost
                          )}
                        </td>

                        <td
                          className={
                            Number(item.profit) >= 0
                              ? "profit-positive"
                              : "profit-negative"
                          }
                        >
                          {formatCurrency(
                            item.profit
                          )}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= BEST SELLING ================= */}

      <div className="report-section">
        <div className="section-title">
          <div>
            <h2>Best Selling Products</h2>

            <p>
              Products with the highest sales
            </p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Category</th>

                {/* Admin + Manager */}

                {canViewPrice && (
                  <th>Price</th>
                )}

                <th>Quantity Sold</th>

                {/* Admin Only */}

                {canViewFinancialReports && (
                  <th>Revenue</th>
                )}
              </tr>
            </thead>

            <tbody>
              {bestSelling.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      canViewFinancialReports
                        ? 6
                        : canViewPrice
                          ? 5
                          : 4
                    }
                    className="empty-row"
                  >
                    No sales data found
                  </td>
                </tr>
              ) : (
                bestSelling.map(
                  (item, index) => {
                    const product =
                      item.product || item;

                    return (
                      <tr
                        key={
                          product?.id ||
                          product?._id ||
                          item._id ||
                          index
                        }
                      >
                        <td>
                          <span className="rank">
                            #{index + 1}
                          </span>
                        </td>

                        <td>
                          {product?.name ||
                            item.productName ||
                            "Unknown"}
                        </td>

                        <td>
                          {product?.category ||
                            item.category ||
                            "-"}
                        </td>

                        {/* Admin + Manager */}

                        {canViewPrice && (
                          <td>
                            {formatCurrency(
                              product?.price ??
                                item.price ??
                                item.sellingPrice ??
                                0
                            )}
                          </td>
                        )}

                        <td>
                          {item.totalQuantity ??
                            item.quantitySold ??
                            item.quantity ??
                            0}
                        </td>

                        {/* Admin Only */}

                        {canViewFinancialReports && (
                          <td>
                            {formatCurrency(
                              item.totalRevenue ??
                                item.revenue ??
                                item.totalAmount ??
                                0
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= LOW STOCK ================= */}

      <div className="report-section">
        <div className="section-title">
          <div>
            <h2>Low Stock Products</h2>

            <p>
              Products that need restocking
            </p>
          </div>

          <span className="warning-count">
            {lowStockCount} Products
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>

                {/* Admin + Manager */}

                {canViewPrice && (
                  <th>Price</th>
                )}

                <th>Current Stock</th>
              </tr>
            </thead>

            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      canViewPrice ? 5 : 4
                    }
                    className="empty-row"
                  >
                    No low stock products
                  </td>
                </tr>
              ) : (
                lowStockProducts.map(
                  (product, index) => (
                    <tr
                      key={
                        product._id ||
                        product.id ||
                        index
                      }
                    >
                      <td>
                        {product.name || "-"}
                      </td>

                      <td>
                        {product.sku || "-"}
                      </td>

                      <td>
                        {product.category || "-"}
                      </td>

                      {/* Admin + Manager */}

                      {canViewPrice && (
                        <td>
                          {formatCurrency(
                            product.price ?? 0
                          )}
                        </td>
                      )}

                      <td>
                        <span className="stock-warning">
                          {product.quantity ?? 0}
                        </span>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= INVENTORY SUMMARY ================= */}

      <div className="report-section">
        <div className="section-title">
          <div>
            <h2>Inventory Summary</h2>

            <p>
              Current inventory overview
            </p>
          </div>
        </div>

        <div className="inventory-summary">

          {/* Everyone */}

          <div className="inventory-item">
            <span>Total Products</span>

            <strong>
              {totalProducts}
            </strong>
          </div>

          {/* Everyone */}

          <div className="inventory-item">
            <span>Total Categories</span>

            <strong>
              {totalCategories}
            </strong>
          </div>

          {/* Everyone */}

          <div className="inventory-item">
            <span>Total Sales</span>

            <strong>
              {totalSales}
            </strong>
          </div>

          {/* Admin Only */}

          {canViewFinancialReports && (
            <div className="inventory-item">
              <span>Inventory Value</span>

              <strong>
                {formatCurrency(
                  inventoryValue
                )}
              </strong>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Reports;
