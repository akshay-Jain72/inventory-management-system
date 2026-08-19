
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Suppliers.css";

const API_URL = "https://inventory-management-system-lzyk.onrender.com";

const Suppliers = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // USER / ROLE
  // =========================

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const role = user?.role;

  const canManageSuppliers =
    role === "admin" || role === "manager";

  // =========================
  // AUTH ERROR
  // =========================

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");

      return true;
    }

    return false;
  };

  // =========================
  // FETCH SUPPLIERS
  // =========================

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/suppliers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (handleAuthError(response.status)) {
        return;
      }

      if (!response.ok) {
        setError(
          data.message || "Failed to fetch suppliers"
        );
        return;
      }

      setSuppliers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.log(error);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    });

    setEditingId(null);
  };

  // =========================
  // ADD / UPDATE SUPPLIER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canManageSuppliers) {
      return;
    }

    setError("");
    setMessage("");

    if (
      !formData.companyName.trim() ||
      !formData.contactPerson.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.address.trim()
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      setFormLoading(true);

      const url = editingId
        ? `${API_URL}/suppliers/${editingId}`
        : `${API_URL}/suppliers`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: formData.companyName.trim(),
          contactPerson: formData.contactPerson.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
        }),
      });

      const data = await response.json();

      if (handleAuthError(response.status)) {
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            (editingId
              ? "Failed to update supplier"
              : "Failed to add supplier")
        );

        return;
      }

      setMessage(
        data.message ||
          (editingId
            ? "Supplier updated successfully."
            : "Supplier added successfully.")
      );

      resetForm();

      await fetchSuppliers();
    } catch (error) {
      console.log(error);
      setError("Server error. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // EDIT SUPPLIER
  // =========================

  const handleEdit = (supplier) => {
    if (!canManageSuppliers) {
      return;
    }

    setError("");
    setMessage("");

    setEditingId(supplier._id);

    setFormData({
      companyName: supplier.companyName || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE SUPPLIER
  // =========================

  const handleDelete = async (id) => {
    if (!canManageSuppliers) {
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/suppliers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (handleAuthError(response.status)) {
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to delete supplier"
        );

        return;
      }

      setMessage(
        data.message ||
          "Supplier deleted successfully."
      );

      await fetchSuppliers();
    } catch (error) {
      console.log(error);
      setError("Server error. Please try again.");
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="suppliers-loading">
        <div className="loading-spinner"></div>

        <h2>Loading Suppliers...</h2>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="suppliers-page">

      {/* HEADER */}

      <div className="suppliers-header">

        <div>
          <h1>Suppliers</h1>

          <p>
            Manage and track your suppliers
          </p>
        </div>

        <div className="supplier-role">
          Role: <strong>{role || "User"}</strong>
        </div>

      </div>

      {/* MESSAGES */}

      {message && (
        <div className="supplier-success">
          {message}
        </div>
      )}

      {error && (
        <div className="supplier-error">
          {error}
        </div>
      )}

      {/* FORM - ADMIN + MANAGER ONLY */}

      {canManageSuppliers && (
        <div className="supplier-form-card">

          <div className="supplier-form-header">

            <div>
              <h2>
                {editingId
                  ? "Update Supplier"
                  : "Add Supplier"}
              </h2>

              <p>
                {editingId
                  ? "Update supplier information"
                  : "Add a new supplier"}
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="supplier-form-grid">

              {/* COMPANY */}

              <div className="form-group">

                <label>
                  Company Name
                </label>

                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />

              </div>

              {/* CONTACT */}

              <div className="form-group">

                <label>
                  Contact Person
                </label>

                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Enter contact person"
                  required
                />

              </div>

              {/* PHONE */}

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />

              </div>

              {/* ADDRESS */}

              <div className="form-group full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter supplier address"
                  rows="3"
                  required
                />

              </div>

            </div>

            {/* BUTTONS */}

            <div className="supplier-form-buttons">

              <button
                type="submit"
                className="save-supplier-btn"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editingId
                  ? "Update Supplier"
                  : "Add Supplier"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-supplier-btn"
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

      {/* SUPPLIERS TABLE */}

      <div className="supplier-table-card">

        <div className="table-header">

          <div>
            <h2>All Suppliers</h2>

            <p>
              All supplier records
            </p>
          </div>

          <span className="supplier-count">
            Total: {suppliers.length}
          </span>

        </div>

        {suppliers.length === 0 ? (

          <div className="no-suppliers">

            <h3>
              No Suppliers Found
            </h3>

            <p>
              There are no suppliers in your system.
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>

                  {canManageSuppliers && (
                    <th>Actions</th>
                  )}
                </tr>

              </thead>

              <tbody>

                {suppliers.map(
                  (supplier, index) => (

                    <tr key={supplier._id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {supplier.companyName}
                        </strong>
                      </td>

                      <td>
                        {supplier.contactPerson}
                      </td>

                      <td>
                        {supplier.phone}
                      </td>

                      <td>
                        {supplier.email}
                      </td>

                      <td>
                        {supplier.address}
                      </td>

                      {canManageSuppliers && (
                        <td>

                          <div className="action-buttons">

                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  supplier
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  supplier._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>
                      )}

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

export default Suppliers;

