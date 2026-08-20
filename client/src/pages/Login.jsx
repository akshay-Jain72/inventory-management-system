import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://inventory-management-system-lzyk.onrender.com/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      // Login failed
      if (!response.ok) {
        setError(
          data.message || "Invalid email or password"
        );
        return;
      }

      // Backend token check
      if (!data.token) {
        setError(
          "Login successful, but authentication token was not received."
        );
        return;
      }

      // Backend user check
      if (!data.user) {
        setError(
          "Login successful, but user information was not received."
        );
        return;
      }

      // =====================================
      // SAVE TOKEN
      // =====================================

      localStorage.setItem(
        "token",
        data.token
      );

      // =====================================
      // SAVE USER
      // =====================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // =====================================
      // REDIRECT
      // =====================================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error("Login Error:", error);

      setError(
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* HEADER */}
        <div className="login-header">

          <h1>
            Inventory Management
          </h1>

          <p>
            Login to your account
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* REGISTER */}
        <div className="register-link">

          <p>
            Don't have an account?{" "}

            <span
              onClick={() =>
                navigate("/register")
              }
            >
              Register
            </span>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;