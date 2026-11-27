
import  { useEffect, useState } from "react";
import "./Sales.css";

const API_URL = "https://inventory-management-system-lzyk.onrender.com";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    sellingPrice: "",
  });

  // ==============================
  // USER / ROLE
  // ==============================

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");
  const role = user?.role?.toLowerCase().trim() || "staff";

  // ADMIN + MANAGER + STAFF CAN ADD SALE
  const canCreateSales =
    role === "admin" ||
    role === "manager" ||
    role === "staff";

  // ADMIN + MANAGER CAN EDIT
const canEditSales =
  role === "admin" || role === "manager";

// ADMIN ONLY CAN DELETE
const canDeleteSales =
  role === "admin";

// ADMIN + MANAGER CAN VIEW FINANCIAL DATA
const canViewFinancialData =
  role === "admin" || role === "manager";

  // ==============================
  // SAFE RESPONSE PARSING
  // ==============================

  const readResponse = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  // ==============================
  // AUTH ERROR
  // ==============================

  const handleAuthError = (status) => {
    // Only 401 should log the user out.
    // 403 means permission denied, not necessarily expired login.

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return true;
    }

    return false;
  };

  // ==============================
  // FETCH SALES
  // ==============================

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (handleAuthError(response.status)) {
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to fetch sales");
        return;
      }

      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load sales. Please try again.");
    }
  };

  // ==============================
  // FETCH PRODUCTS
  // ==============================

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (handleAuthError(response.status)) {
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to fetch products");
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
    }
  };

  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!token) {
        window.location.href = "/login";
        return;
      }

      await Promise.all([
        fetchSales(),
        fetchProducts(),
      ]);

      if (!cancelled) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };

    // Initial loading for the current token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ==============================
  // INPUT CHANGE
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==============================
  // RESET FORM
  // ==============================

  const resetForm = () => {
    setFormData({
      productId: "",
      quantity: "",
      sellingPrice: "",
    });

    setEditingId(null);
    setMessage("");
    setError("");
  };

  // ==============================
  // SUBMIT SALE
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCreateSales) {
      setError("You are not allowed to add sales.");
      return;
    }

    setMessage("");
    setError("");

    // Product validation for new sale
    if (!editingId && !formData.productId) {
      setError("Please select a product.");
      return;
    }

    // Quantity validation
    const quantity = Number(formData.quantity);

    if (
      formData.quantity === "" ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError("Quantity must be greater than 0.");
      return;
    }

    // Selling price validation
    const sellingPrice = Number(formData.sellingPrice);

    if (
      formData.sellingPrice === "" ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      setError("Please enter a valid selling price.");
      return;
    }

    try {
      setFormLoading(true);

      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_URL}/sales/${editingId}`
        : `${API_URL}/sales`;

      const method = isEditing ? "PUT" : "POST";

      const body = isEditing
        ? {
            quantity,
            sellingPrice,
          }
        : {
            productId: formData.productId,
            quantity,
            sellingPrice,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await readResponse(response);

      if (handleAuthError(response.status)) {
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            (isEditing
              ? "Failed to update sale."
              : "Failed to add sale.")
        );
        return;
      }

      setMessage(
        data.message ||
          (isEditing
            ? "Sale updated successfully."
            : "Sale added successfully.")
      );

      resetForm();

      await Promise.all([
        fetchSales(),
        fetchProducts(),
      ]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // ==============================
  // EDIT SALE
  // ==============================

  const handleEdit = (sale) => {
  if (!canEditSales) {
    return;
  }

    setMessage("");
    setError("");

    setEditingId(sale._id);

    setFormData({
      productId:
        sale.product?._id ||
        sale.product ||
        "",

      quantity: sale.quantity ?? "",

      sellingPrice: sale.sellingPrice ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // DELETE SALE
  // ==============================

  const handleDelete = async (id) => {
  if (!canDeleteSales) {
    return;
  }

    const confirmed = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/sales/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (handleAuthError(response.status)) {
        return;
      }

      if (!response.ok) {
        setError(data.message || "Failed to delete sale.");
        return;
      }

      setMessage(
        data.message || "Sale deleted successfully."
      );

      await Promise.all([
        fetchSales(),
        fetchProducts(),
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to delete sale. Please try again.");
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="sales-page">
        <div className="sales-loading">
          <div className="loading-spinner"></div>

          <h2>Loading Sales</h2>

          <p>
            Please wait while we load sales data.
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="sales-page">

      {/* HEADER */}

      <div className="sales-header">

        <div>
          <h1>Sales</h1>

          <p>
            Manage and track sales transactions.
          </p>
        </div>

        <div className="sales-stat">
          <span>Total Transactions</span>
          <strong>{sales.length}</strong>
        </div>

      </div>

      {/* ALERTS */}

      {error && (
        <div className="sales-alert error">
          <strong>Error</strong>
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="sales-alert success">
          <strong>Success</strong>
          <span>{message}</span>
        </div>
      )}

      {/* ADD / EDIT FORM */}

      {canCreateSales && (
        <div className="sales-card">

          <div className="card-header">

            <div>
              <span className="section-label">
                {editingId
                  ? "EDIT TRANSACTION"
                  : "NEW TRANSACTION"}
              </span>

              <h2>
                {editingId
                  ? "Update Sale"
                  : "Add Sale"}
              </h2>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* PRODUCT */}

              <div className="form-group">

                <label>
                  Product
                </label>

                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  disabled={editingId !== null}
                  required
                >

                  <option value="">
                    Select Product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                      disabled={
                        Number(product.quantity) <= 0
                      }
                    >
                      {product.name} — Stock:{" "}
                      {product.quantity}
                    </option>
                  ))}

                </select>

                {editingId && (
                  <small>
                    Product cannot be changed
                    while editing.
                  </small>
                )}

              </div>

              {/* QUANTITY */}

              <div className="form-group">

                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="1"
                  step="1"
                  required
                />

              </div>

              {/* SELLING PRICE */}

              <div className="form-group">

                <label>
                  Selling Price
                </label>

                <div className="price-input">

                  <span>₹</span>

                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />

                </div>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editingId
                  ? "Update Sale"
                  : "Add Sale"}
              </button>

             {editingId && canEditSales && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                  disabled={formLoading}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>
      )}

      {/* SALES HISTORY */}

      <div className="sales-card">

        <div className="table-header">

          <div>
            <span className="section-label">
              TRANSACTIONS
            </span>

            <h2>
              Sales History
            </h2>

            <p>
              Complete list of sales transactions.
            </p>
          </div>

          <span className="record-count">
            {sales.length}{" "}
            {sales.length === 1
              ? "Record"
              : "Records"}
          </span>

        </div>

        {/* EMPTY */}

        {sales.length === 0 ? (
          <div className="empty-state">

            <h3>
              No Sales Found
            </h3>

            <p>
              {canCreateSales
                ? "Add your first sale using the form above."
                : "No sales records are available."}
            </p>

          </div>
        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Quantity</th>

                  {canViewFinancialData && (
                    <>
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Total Amount</th>
                      <th>Profit</th>
                    </>
                  )}

                  <th>Date</th>

                 {canEditSales && (
  <th>Actions</th>
)}
                </tr>

              </thead>

              <tbody>

                {sales.map((sale, index) => {

                  const profit =
                    Number(sale.profit) || 0;

                  return (
                    <tr key={sale._id}>

                      {/* NUMBER */}

                      <td>
                        <span className="row-number">
                          {index + 1}
                        </span>
                      </td>

                      {/* PRODUCT */}

                      <td>
                        <strong>
                          {sale.product?.name ||
                            "Product deleted"}
                        </strong>
                      </td>

                      {/* QUANTITY */}

                      <td>
                        <span className="quantity">
                          {sale.quantity}
                        </span>
                      </td>

                      {/* FINANCIAL DATA */}

                      {canViewFinancialData && (
                        <>
                          <td>
                            ₹
                            {Number(
                              sale.purchasePrice || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            ₹
                            {Number(
                              sale.sellingPrice || 0
                            ).toFixed(2)}
                          </td>

                          <td>
                            <strong>
                              ₹
                              {Number(
                                sale.totalAmount || 0
                              ).toFixed(2)}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={
                                profit >= 0
                                  ? "profit-positive"
                                  : "profit-negative"
                              }
                            >
                              {profit >= 0
                                ? "+"
                                : "-"}
                              ₹
                              {Math.abs(
                                profit
                              ).toFixed(2)}
                            </span>
                          </td>
                        </>
                      )}

                      {/* DATE */}

                      <td>
                        {sale.createdAt
                          ? new Date(
                              sale.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </td>

                      {/* ACTIONS */}

{canEditSales && (
  <td>
    <div className="action-buttons">

      <button
        type="button"
        className="edit-btn"
        onClick={() => handleEdit(sale)}
      >
        Edit
      </button>

      {canDeleteSales && (
        <button
          type="button"
          className="delete-btn"
          onClick={() => handleDelete(sale._id)}
        >
          Delete
        </button>
      )}

    </div>
  </td>
)}

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default Sales;
