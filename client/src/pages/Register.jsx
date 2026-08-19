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

  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful!");

        setFormData({
          name: "",
          email: "",
          password: "",
        });
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error. Please try again.");
    }
  }

  return (
    <div className="register-page">
      <div className="register-box">

        <h1>Create Account</h1>

        <p className="register-subtitle">
          Register for Inventory Management System
        </p>

        <form onSubmit={handleSubmit}>

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

          <button
            type="submit"
            className="register-button"
          >
            Register
          </button>

        </form>

        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

        <p className="login-link">
          Already have an account?{" "}

          <span onClick={() => navigate("/login")}>
            Login
          </span>

        </p>

      </div>
    </div>
  );
};

export default Register;