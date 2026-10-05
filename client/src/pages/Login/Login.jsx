import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./Login.scss";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        formData.email,
        formData.password
      );

      if (!response.success) {
        setError(
          response.message || "Login failed."
        );
        return;
      }

      // Where the user originally tried to go
      const from =
        location.state?.from?.pathname ||
        "/admin/products";

      navigate(from, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            E
          </div>

          <h1>Welcome Back</h1>

          <p>
            Sign in to your account
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Login;