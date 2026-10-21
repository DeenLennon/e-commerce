import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
  ShoppingBag,
} from "@mui/icons-material";

import api from "../../services/api";

import "./Register.scss";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      confirm_password,
    } = formData;

    if (
      !first_name.trim() ||
      !last_name.trim() ||
      !email.trim() ||
      !password ||
      !confirm_password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to create your account."
        );
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        {/* Left Side */}
        <div className="register-brand-panel">
          <div className="brand-icon">
            <ShoppingBag />
          </div>

          <h1>
            Welcome to <span>DIRECTLINKS</span>
          </h1>

          <p>
            Create your account and enjoy a faster,
            smarter shopping experience.
          </p>

          <div className="brand-features">
            <div>
              <span>✓</span>
              <p>Easy and secure checkout</p>
            </div>

            <div>
              <span>✓</span>
              <p>Track all your orders</p>
            </div>

            <div>
              <span>✓</span>
              <p>Save your delivery addresses</p>
            </div>

            <div>
              <span>✓</span>
              <p>Get access to exclusive deals</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="register-form-panel">
          <div className="register-form-header">
            <h2>Create Account</h2>

            <p>
              Join DirectLinks and start shopping today.
            </p>
          </div>

          {error && (
            <div className="register-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="register-alert success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="name-fields">

              <div className="form-group">
                <label htmlFor="first_name">
                  First Name
                </label>

                <div className="input-wrapper">
                  <Person />

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="last_name">
                  Last Name
                </label>

                <div className="input-wrapper">
                  <Person />

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                </div>
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">
                <Email />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="lennonabu21@yahoo.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
                <span>Optional</span>
              </label>

              <div className="input-wrapper">
                <Phone />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="07044559139"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <Lock />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">
                Confirm Password
              </label>

              <div className="input-wrapper">
                <Lock />

                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </button>
              </div>
            </div>

            <label className="terms-checkbox">
              <input type="checkbox" required />

              <span>
                I agree to the{" "}
                <a href="#terms">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#privacy">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowForward />
                </>
              )}
            </button>

          </form>

          <div className="login-divider">
            <span>Already have an account?</span>
          </div>

          <Link
            to="/login"
            className="login-link"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;