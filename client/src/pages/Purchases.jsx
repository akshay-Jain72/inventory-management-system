
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Purchases.css";

const API_URL = "https://inventory-management-system-lzyk.onrender.com";

const Purchases = () => {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    productId: "",
    supplierId: "",
    quantity: "",
    purchasePrice: "",
  });

  // USER / ROLE
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");
  const role = user?.role?.toLowerCase().trim() || "";

 const canAddPurchase =
  role === "admin" || role === "manager" || role === "staff";

const canManagePurchases =
  role === "admin" || role === "manager";

const canDeletePurchase = role === "admin";

  // SAFE RESPONSE PARSING
  const readResponse = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  // AUTH HANDLING
  const handleAuthError = (status) => {
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return true;
    }

    return false;
  };

  // FETCH PURCHASES
  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${API_URL}/purchases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        setError(data.message || "Failed to load purchases");
        return;
      }

      setPurchases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load purchases. Please try again.");
    }
  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        setError(data.message || "Failed to load products");
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    }
  };

  // FETCH SUPPLIERS
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        setError(data.message || "Failed to load suppliers");
        return;
      }

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers.");
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      await Promise.all([
        fetchPurchases(),
        fetchProducts(),
        fetchSuppliers(),
      ]);

      if (!cancelled) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };

    // Initial load for the current token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      productId: "",
      supplierId: "",
      quantity: "",
      purchasePrice: "",
    });

    setEditingId(null);
    setMessage("");
    setError("");
  };

  // SUBMIT PURCHASE
  const handleSubmit = async (e) => {
    e.preventDefault();

   if (editingId && !canManagePurchases) {
  setError("You do not have permission to edit purchases.");
  return;
}

if (!editingId && !canAddPurchase) {
  setError("You do not have permission to add purchases.");
  return;
}

    setMessage("");
    setError("");

    if (
      !formData.productId ||
      !formData.supplierId ||
      formData.quantity === "" ||
      formData.purchasePrice === ""
    ) {
      setError("All fields are required.");
      return;
    }

    const quantity = Number(formData.quantity);
    const purchasePrice = Number(formData.purchasePrice);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      setError("Purchase price cannot be negative.");
      return;
    }

    try {
      setFormLoading(true);

      const url = editingId
        ? `${API_URL}/purchases/${editingId}`
        : `${API_URL}/purchases`;

      const method = editingId ? "PUT" : "POST";

      const body = editingId
        ? {
            supplierId: formData.supplierId,
            quantity,
            purchasePrice,
          }
        : {
            productId: formData.productId,
            supplierId: formData.supplierId,
            quantity,
            purchasePrice,
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

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        setError(
          data.message ||
            (editingId
              ? "Failed to update purchase."
              : "Failed to add purchase.")
        );
        return;
      }

      setMessage(
        data.message ||
          (editingId
            ? "Purchase updated successfully."
            : "Purchase added successfully.")
      );

      resetForm();

      await Promise.all([
        fetchPurchases(),
        fetchProducts(),
      ]);
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // EDIT PURCHASE
  const handleEdit = (purchase) => {
    if (!canManagePurchases) return;

    setMessage("");
    setError("");
    setEditingId(purchase._id);

    setFormData({
      productId:
        purchase.product?._id ||
        purchase.product ||
        "",

      supplierId:
        purchase.supplier?._id ||
        purchase.supplier ||
        "",

      quantity: purchase.quantity ?? "",

      purchasePrice: purchase.purchasePrice ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE PURCHASE
 const handleDelete = async (id) => {
  if (!canDeletePurchase) {
    setError("Only Admin can delete purchases.");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this purchase?"
  );

  if (!confirmDelete) return;

  // Baaki tumhara existing delete function same rahega

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/purchases/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (handleAuthError(response.status)) return;

      if (!response.ok) {
        setError(data.message || "Failed to delete purchase.");
        return;
      }

      setMessage(data.message || "Purchase deleted successfully.");

      await Promise.all([
        fetchPurchases(),
        fetchProducts(),
      ]);
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="purchases-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Purchases...</h2>
      </div>
    );
  }

  // PAGE
  return (
    <div className="purchases-page">
      {/* HEADER */}
      <div className="purchases-header">
        <div>
          <h1>Purchases</h1>
          <p>Manage and track your purchase records</p>
        </div>

        <div className="purchase-summary">
          <span>
            Total Purchases: <strong>{purchases.length}</strong>
          </span>
        </div>
      </div>

      {/* MESSAGES */}
      {message && (
        <div className="purchase-success">
          {message}
        </div>
      )}

      {error && (
        <div className="purchase-error">
          {error}
        </div>
      )}

      {/* FORM: ADMIN + MANAGER */}
      {canAddPurchase && (
        <div className="purchase-form-card">
          <div className="purchase-form-header">
            <div>
              <h2>
                {editingId ? "Update Purchase" : "Add New Purchase"}
              </h2>

              <p>
                {editingId
                  ? "Update the selected purchase record"
                  : "Add new stock to your inventory"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="purchase-form-grid">
              {/* PRODUCT */}
              <div className="form-group">
                <label>Product</label>

                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  disabled={editingId !== null}
                  required
                >
                  <option value="">Select Product</option>

                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                {editingId && (
                  <small className="input-help">
                    Product cannot be changed while editing.
                  </small>
                )}
              </div>

              {/* SUPPLIER */}
              <div className="form-group">
                <label>Supplier</label>

                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Supplier</option>

                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* QUANTITY */}
              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </div>

              {/* PURCHASE PRICE */}
              <div className="form-group">
                <label>Purchase Price</label>

                <input
                  type="number"
                  name="purchasePrice"
                  placeholder="Enter purchase price"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="purchase-form-buttons">
              <button
                type="submit"
                className="save-purchase-btn"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editingId
                  ? "Update Purchase"
                  : "Add Purchase"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-purchase-btn"
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

      {/* PURCHASE HISTORY */}
      <div className="purchase-table-card">
        <div className="table-header">
          <div>
            <h2>Purchase History</h2>
            <p>All purchase transactions</p>
          </div>

          <span className="purchase-count">
            {purchases.length} Records
          </span>
        </div>

        {purchases.length === 0 ? (
          <div className="no-data">
            <h3>No Purchases Found</h3>
            <p>No purchase records are available.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Total Amount</th>
                  <th>Date</th>

                  {canManagePurchases && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {purchases.map((purchase, index) => (
                  <tr key={purchase._id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>
                        {purchase.product?.name || "Product deleted"}
                      </strong>
                    </td>

                    <td>
                      {purchase.supplier?.companyName ||
                        "Supplier deleted"}
                    </td>

                    <td>{purchase.quantity}</td>

                    <td>
                      ₹
                      {Number(
                        purchase.purchasePrice || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          purchase.totalAmount || 0
                        ).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      {purchase.createdAt
                        ? new Date(
                            purchase.createdAt
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    {canManagePurchases && (
  <td>
    <div className="action-buttons">

      {/* ADMIN AND MANAGER - EDIT */}
      <button
        type="button"
        className="edit-btn"
        onClick={() => handleEdit(purchase)}
      >
        Edit
      </button>

      {/* ONLY ADMIN - DELETE */}
      {canDeletePurchase && (
        <button
          type="button"
          className="delete-btn"
          onClick={() => handleDelete(purchase._id)}
        >
          Delete
        </button>
      )}

    </div>
  </td>
)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
