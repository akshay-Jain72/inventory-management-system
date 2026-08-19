import React, { useEffect, useState } from "react";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // =========================
  // Logged-in User
  // =========================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // Admin and Manager can add products
  // Staff can only view products
  const canAddProduct =
    user?.role === "admin" ||
    user?.role === "manager";

  // =========================
  // Fetch Products
  // =========================

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // Token expired / unauthorized
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        setError(
          data.message || "Failed to fetch products"
        );
        return;
      }

      setProducts(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.log("Products Error:", error);
      setError(
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Add Product
  // =========================

  const handleAddProduct = async (e) => {
    e.preventDefault();

    setFormError("");

    // Frontend role protection
    if (!canAddProduct) {
      setFormError(
        "You do not have permission to add products."
      );
      return;
    }

    // Required fields
    if (
      !name.trim() ||
      !sku.trim() ||
      price === "" ||
      quantity === "" ||
      !category.trim()
    ) {
      setFormError(
        "All product fields are required"
      );
      return;
    }

    // Negative values
    if (
      Number(price) < 0 ||
      Number(quantity) < 0
    ) {
      setFormError(
        "Price and quantity cannot be negative"
      );
      return;
    }

    try {
      setFormLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setFormError(
          "Please login first"
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/products",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
            sku: sku.trim(),
            price: Number(price),
            quantity: Number(quantity),
            category: category.trim(),
          }),
        }
      );

      const data = await response.json();

      // Unauthorized / forbidden
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setFormError(
          data.message ||
            "You do not have permission."
        );
        return;
      }

      // Other backend errors
      if (!response.ok) {
        setFormError(
          data.message ||
            "Failed to create product"
        );
        return;
      }

      // Get latest products from backend
      await fetchProducts();

      // Reset form
      setName("");
      setSku("");
      setPrice("");
      setQuantity("");
      setCategory("");

      setShowForm(false);
      setFormError("");

    } catch (error) {
      console.log(
        "Add Product Error:",
        error
      );

      setFormError(
        "Server error. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // Stock Status
  // =========================

  const getStockStatus = (quantity) => {
    const stock = Number(quantity || 0);

    if (stock === 0) {
      return {
        text: "Out of Stock",
        className: "stock-out",
      };
    }

    if (stock <= 5) {
      return {
        text: "Low Stock",
        className: "stock-low",
      };
    }

    return {
      text: "In Stock",
      className: "stock-good",
    };
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="products-loading">

        <div className="loading-spinner"></div>

        <h2>
          Loading Products...
        </h2>

      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="products-page">

      {/* =========================
          Header
      ========================= */}

      <div className="products-header">

        <div>
          <h1>Products</h1>

          <p>
            Manage your inventory products
          </p>
        </div>

        {/* Only Admin / Manager */}

        {canAddProduct && (
          <button
            className="add-product-button"
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
            }}
          >
            {showForm
              ? "Close Form"
              : "+ Add Product"}
          </button>
        )}

      </div>

      {/* =========================
          General Error
      ========================= */}

      {error && (
        <div className="products-error">
          {error}
        </div>
      )}

      {/* =========================
          Add Product Form
      ========================= */}

      {showForm && canAddProduct && (
        <div className="product-form-container">

          <div className="form-header">

            <div>

              <h2>
                Add New Product
              </h2>

              <p>
                Enter the product details below
              </p>

            </div>

          </div>

          {/* Form Error */}

          {formError && (
            <div className="form-error">
              {formError}
            </div>
          )}

          <form
            onSubmit={handleAddProduct}
          >

            <div className="product-form-grid">

              {/* Product Name */}

              <div className="product-form-group">

                <label>
                  Product Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>

              {/* SKU */}

              <div className="product-form-group">

                <label>
                  SKU
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter SKU"
                  value={sku}
                  onChange={(e) =>
                    setSku(e.target.value)
                  }
                />

              </div>

              {/* Price */}

              <div className="product-form-group">

                <label>
                  Price
                  <span>*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                />

              </div>

              {/* Quantity */}

              <div className="product-form-group">

                <label>
                  Quantity
                  <span>*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                />

              </div>

              {/* Category */}

              <div className="product-form-group">

                <label>
                  Category
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Form Buttons */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product-button"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : "Save Product"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =========================
          Products Table
      ========================= */}

      <div className="products-table-container">

        {/* Table Header */}

        <div className="products-table-header">

          <div>

            <h2>
              All Products
            </h2>

            <p>
              View all products in your inventory
            </p>

          </div>

          <span className="product-count">
            Total: {products.length}
          </span>

        </div>

        {/* No Products */}

        {products.length === 0 ? (

          <div className="no-products">

            <h3>
              No Products Found
            </h3>

            <p>
              There are no products in your inventory.
            </p>

          </div>

        ) : (

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>

                  <th>#</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {products.map(
                  (product, index) => {

                    const stockStatus =
                      getStockStatus(
                        product.quantity
                      );

                    return (

                      <tr
                        key={product._id}
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <strong>
                            {product.name}
                          </strong>
                        </td>

                        <td>
                          {product.sku}
                        </td>

                        <td>
                          {product.category}
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.price || 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          {product.quantity}
                        </td>

                        <td>

                          <span
                            className={`stock-status ${stockStatus.className}`}
                          >
                            {stockStatus.text}
                          </span>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Products;