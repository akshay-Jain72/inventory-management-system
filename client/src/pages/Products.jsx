
import { useEffect, useState } from "react";
import "./Products.css";

const API = "https://inventory-management-system-lzyk.onrender.com";

function getUserRole() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    return String(storedUser.role || "").toLowerCase();
  } catch {
    return "";
  }
}

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const [editData, setEditData] = useState({
    name: "",
    sku: "",
    price: "",
    quantity: "",
    category: "",
  });

  const role = getUserRole();

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isStaff = role === "staff";

  const canAddProduct = isAdmin || isManager || isStaff;
  const canEditProduct = isAdmin || isManager;
  const canDeleteProduct = isAdmin;
  const canViewPrice = isAdmin || isManager || isStaff;

  const token = localStorage.getItem("token");

  // FETCH PRODUCTS
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch(`${API}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch products");
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];

        if (!cancelled) {
          setProducts(list);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setError(err.message || "Unable to fetch products");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, token]);

  // REFRESH
  const refreshProducts = () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setRefreshKey((previous) => previous + 1);
  };

  // RESET ADD FORM
  const resetForm = () => {
    setName("");
    setSku("");
    setPrice("");
    setQuantity("");
    setCategory("");
  };

  // ADD PRODUCT
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !sku.trim() ||
      !category.trim() ||
      quantity === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (canViewPrice && price === "") {
      setError("Please enter product price.");
      return;
    }

    if (
      Number(quantity) < 0 ||
      (canViewPrice && Number(price) < 0)
    ) {
      setError("Price and quantity cannot be negative.");
      return;
    }

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const productData = {
        name: name.trim(),
        sku: sku.trim(),
        category: category.trim(),
        quantity: Number(quantity),
        price: canViewPrice ? Number(price) : 0,
      };

      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add product");
      }

      resetForm();
      setSuccess("Product added successfully!");
      refreshProducts();
    } catch (err) {
      setError(err.message || "Failed to add product");
    } finally {
      setAdding(false);
    }
  };

  // OPEN EDIT
  const handleEdit = (product) => {
    setError("");
    setSuccess("");
    setEditId(product._id);

    setEditData({
      name: product.name || "",
      sku: product.sku || "",
      price: product.price ?? "",
      quantity: product.quantity ?? "",
      category: product.category || "",
    });
  };

  // CANCEL EDIT
  const cancelEdit = () => {
    setEditId(null);

    setEditData({
      name: "",
      sku: "",
      price: "",
      quantity: "",
      category: "",
    });
  };

  // UPDATE PRODUCT
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      !editData.name.trim() ||
      !editData.sku.trim() ||
      !editData.category.trim() ||
      editData.price === "" ||
      editData.quantity === ""
    ) {
      setError("Please fill all edit fields.");
      return;
    }

    if (
      Number(editData.price) < 0 ||
      Number(editData.quantity) < 0
    ) {
      setError("Price and quantity cannot be negative.");
      return;
    }

    setSavingEdit(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/products/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name.trim(),
          sku: editData.sku.trim(),
          category: editData.category.trim(),
          price: Number(editData.price),
          quantity: Number(editData.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update product");
      }

      cancelEdit();
      setSuccess("Product updated successfully!");
      refreshProducts();
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setSavingEdit(false);
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete product");
      }

      setSuccess("Product deleted successfully!");
      refreshProducts();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setDeletingId("");
    }
  };

  // STOCK STATUS
  const getStockStatus = (qty) => {
    if (qty <= 0) return "out";
    if (qty <= 5) return "low";
    return "available";
  };

  return (
    <div className="products-page">

      {/* HEADER */}
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory products</p>
        </div>

        <button
          className="products-refresh-btn"
          onClick={refreshProducts}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="products-alert products-error">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="products-alert products-success">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* ADD PRODUCT */}
      {canAddProduct && (
        <section className="products-form-card">
          <h2>Add New Product</h2>

          <form onSubmit={handleAddProduct}>
            <div className="products-form-grid">

              <div className="products-field">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="products-field">
                <label>SKU</label>
                <input
                  type="text"
                  placeholder="Enter SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              {canViewPrice && (
                <div className="products-field">
                  <label>Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="products-field">
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="products-field">
                <label>Category</label>
                <input
                  type="text"
                  placeholder="Enter category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="products-add-btn"
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Product"}
            </button>
          </form>
        </section>
      )}

      {/* EDIT PRODUCT */}
      {editId && canEditProduct && (
        <section className="products-form-card products-edit-card">
          <h2>Edit Product</h2>

          <form onSubmit={handleUpdate}>
            <div className="products-form-grid">

              <div className="products-field">
                <label>Product Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((previous) => ({
                      ...previous,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="products-field">
                <label>SKU</label>
                <input
                  type="text"
                  value={editData.sku}
                  onChange={(e) =>
                    setEditData((previous) => ({
                      ...previous,
                      sku: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="products-field">
                <label>Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editData.price}
                  onChange={(e) =>
                    setEditData((previous) => ({
                      ...previous,
                      price: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="products-field">
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editData.quantity}
                  onChange={(e) =>
                    setEditData((previous) => ({
                      ...previous,
                      quantity: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="products-field">
                <label>Category</label>
                <input
                  type="text"
                  value={editData.category}
                  onChange={(e) =>
                    setEditData((previous) => ({
                      ...previous,
                      category: e.target.value,
                    }))
                  }
                  required
                />
              </div>

            </div>

            <div className="products-edit-actions">
              <button
                type="submit"
                className="products-add-btn"
                disabled={savingEdit}
              >
                {savingEdit ? "Updating..." : "Update Product"}
              </button>

              <button
                type="button"
                className="products-cancel-btn"
                onClick={cancelEdit}
                disabled={savingEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PRODUCT LIST */}
      <section className="products-table-card">

        <div className="products-table-header">
          <div>
            <h2>Product Inventory</h2>
            <p>{products.length} products found</p>
          </div>
        </div>

        {loading ? (
          <div className="products-loading">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <h3>No products found</h3>
            <p>Add your first product to get started.</p>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>

                  {canViewPrice && <th>Price</th>}

                  <th>Status</th>

                  {(canEditProduct || canDeleteProduct) && (
                    <th>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const status = getStockStatus(
                    Number(product.quantity)
                  );

                  return (
                    <tr key={product._id}>

                      <td className="products-name-cell">
                        {product.name}
                      </td>

                      <td>{product.sku}</td>

                      <td>{product.category}</td>

                      <td>{product.quantity}</td>

                      {canViewPrice && (
                        <td>
                          ₹
                          {Number(product.price || 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                      )}

                      <td>
                        <span
                          className={`products-stock-badge ${status}`}
                        >
                          {status === "available"
                            ? "In Stock"
                            : status === "low"
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
                      </td>

                      {(canEditProduct || canDeleteProduct) && (
                        <td className="products-actions-cell">

                          {canEditProduct && (
                            <button
                              className="products-edit-btn"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </button>
                          )}

                          {canDeleteProduct && (
                            <button
                              className="products-delete-btn"
                              onClick={() =>
                                handleDelete(product._id)
                              }
                              disabled={
                                deletingId === product._id
                              }
                            >
                              {deletingId === product._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}

                        </td>
                      )}

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
