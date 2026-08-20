import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://inventory-management-system-lzyk.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      // IMPORTANT DEBUG
      console.log("REGISTER STATUS:", response.status);
      console.log("REGISTER RESPONSE:", data);
      console.log("TOKEN FROM BACKEND:", data.token);
      console.log("USER FROM BACKEND:", data.user);

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      // Token check
      if (!data.token) {
        console.error("TOKEN NOT RECEIVED FROM BACKEND");
        setMessage(
          "Registration successful, but token was not received."
        );
        return;
      }

      // User check
      if (!data.user) {
        console.error("USER DATA NOT RECEIVED FROM BACKEND");
        setMessage(
          "Registration successful, but user data was not received."
        );
        return;
      }

      // Save token
      localStorage.setItem("token", data.token);

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Verify
      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("token")
      );

      console.log(
        "USER SAVED:",
        localStorage.getItem("user")
      );

      setMessage("Registration successful!");

      // Form clear
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      // Dashboard
      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error("REGISTER ERROR:", error);

      setMessage(
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-box">

        <h1>Create Account</h1>

        <p className="register-subtitle">
          Register for Inventory Management System
        </p>

        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="form-group">

            <label>Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>

          {/* EMAIL */}
          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>

        </form>

        {/* MESSAGE */}
        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

        {/* LOGIN LINK */}
        <p className="login-link">
          Already have an account?{" "}

          <span
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>

      </div>

    </div>
  );
};

export default Register;