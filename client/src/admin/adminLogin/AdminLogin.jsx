
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiLock,
  FiMail,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";

import useAuth from "../../hooks/useAuth";
import "./AdminLogin.scss";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        email.trim(),
        password
      );

      if (!response?.success) {
        setError(
          response?.message || "Invalid login credentials."
        );
        return;
      }

      // The backend verify admin account.
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login">
      <section className="admin-login__card">
        <header className="admin-login__header">
          <Link to="/" className="admin-login__brand">
            <span className="admin-login__logo">DL</span>
            <span>
              DIRECT<span className="admin-login__brand-accent">LINKS</span>
            </span>
          </Link>

        </header>

        <div className="admin-login__divider" />

        <form
          className="admin-login__form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="admin-login__error" role="alert">
              {error}
            </div>
          )}

          <div className="admin-login__field">
            <label htmlFor="admin-email">
              Email address
            </label>

            <div className="admin-login__input-wrap">
              <FiMail className="admin-login__field-icon" />

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@directlinks.com"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-login__field">
            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-login__input-wrap">
              <FiLock className="admin-login__field-icon" />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />

              <button
                type="button"
                className="admin-login__password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="admin-login__options">
            <label className="admin-login__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                disabled={loading}
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="admin-login__forgot"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="admin-login__submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="admin-login__spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign in to dashboard
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <footer className="admin-login__footer">
          <FiShield />
          <span>
            Authorized administrators only
          </span>
        </footer>

        <Link to="/" className="admin-login__back">
          Back to storefront
        </Link>
      </section>

      <p className="admin-login__copyright">
        © {new Date().getFullYear()} DIRECTLINKS. All rights reserved.
      </p>
    </main>
  );
};

export default AdminLogin;
