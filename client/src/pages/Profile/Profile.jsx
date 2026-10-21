import React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Person,
  Email,
  Phone,
  ShoppingBag,
  LocationOn,
  ArrowForward,
  Logout,
  Edit,
  Security,
  Home,
} from "@mui/icons-material";

import useAuth from "../../hooks/useAuth";

import "./Profile.scss";

const Profile = () => {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  const firstName =
    user.first_name ||
    user.firstName ||
    "";

  const lastName =
    user.last_name ||
    user.lastName ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    user.name ||
    "Customer";

  const initials =
    `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Breadcrumb */}
        <div className="profile-breadcrumb">
          <Link to="/">
            <Home />
            Home
          </Link>

          <span>/</span>

          <strong>My Account</strong>
        </div>

        {/* Header */}
        <section className="profile-header-card">

          <div className="profile-avatar">
            {user.avatar || user.profile_image ? (
              <img
                src={
                  user.avatar ||
                  user.profile_image
                }
                alt={fullName}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="profile-heading">
            <span className="profile-welcome">
              Welcome back
            </span>

            <h1>{fullName}</h1>

            <p>
              Manage your account and shopping
              preferences.
            </p>
          </div>

          <div className="profile-status">
            <span className="status-dot"></span>
            Active Account
          </div>

        </section>

        {/* Main */}
        <div className="profile-grid">

          {/* Account information */}
          <section className="profile-card">

            <div className="profile-card-header">
              <div>
                <h2>
                  <Person />
                  Personal Information
                </h2>

                <p>
                  Your account information
                </p>
              </div>

              <button
                type="button"
                className="edit-profile-button"
                onClick={() =>
                  alert(
                    "Profile editing will be connected to your account API."
                  )
                }
              >
                <Edit />
                Edit
              </button>
            </div>

            <div className="profile-information">

              <div className="information-item">
                <div className="information-icon">
                  <Person />
                </div>

                <div>
                  <span>Full Name</span>
                  <strong>{fullName}</strong>
                </div>
              </div>

              <div className="information-item">
                <div className="information-icon">
                  <Email />
                </div>

                <div>
                  <span>Email Address</span>
                  <strong>
                    {user.email || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="information-item">
                <div className="information-icon">
                  <Phone />
                </div>

                <div>
                  <span>Phone Number</span>
                  <strong>
                    {user.phone || "Not provided"}
                  </strong>
                </div>
              </div>

            </div>
          </section>

          {/* Quick actions */}
          <section className="profile-card">

            <div className="profile-card-header">
              <div>
                <h2>My Account</h2>

                <p>
                  Quick access to your account
                </p>
              </div>
            </div>

            <div className="profile-actions">

              <Link
                to="/orders"
                className="profile-action"
              >
                <div className="action-icon orange">
                  <ShoppingBag />
                </div>

                <div>
                  <strong>My Orders</strong>
                  <span>
                    View and track your orders
                  </span>
                </div>

                <ArrowForward />
              </Link>

              <Link
                to="/checkout"
                className="profile-action"
              >
                <div className="action-icon blue">
                  <LocationOn />
                </div>

                <div>
                  <strong>Delivery Information</strong>
                  <span>
                    Manage your delivery details
                  </span>
                </div>

                <ArrowForward />
              </Link>

              <div className="profile-action">
                <div className="action-icon purple">
                  <Security />
                </div>

                <div>
                  <strong>Account Security</strong>
                  <span>
                    Manage your account security
                  </span>
                </div>

                <ArrowForward />
              </div>

            </div>
          </section>

          {/* Account overview */}
          <section className="profile-card account-overview">

            <div className="profile-card-header">
              <div>
                <h2>Account Overview</h2>

                <p>
                  Your TECHSTORE account
                </p>
              </div>
            </div>

            <div className="overview-grid">

              <div className="overview-item">
                <span>Account Type</span>

                <strong>
                  {user.role === "admin"
                    ? "Administrator"
                    : "Customer"}
                </strong>
              </div>

              <div className="overview-item">
                <span>Account Status</span>

                <strong className="active">
                  Active
                </strong>
              </div>

              {user.created_at && (
                <div className="overview-item">
                  <span>Member Since</span>

                  <strong>
                    {new Date(
                      user.created_at
                    ).toLocaleDateString("en-NG", {
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </div>
              )}

            </div>
          </section>

        </div>

        {/* Bottom actions */}
        <div className="profile-bottom-actions">

          <Link
            to="/"
            className="continue-shopping"
          >
            <ShoppingBag />
            Continue Shopping
          </Link>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <Logout />
            Sign Out
          </button>

        </div>

      </div>
    </div>
  );
};

export default Profile;