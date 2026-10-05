import {
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
} from "react-icons/fi";
import { useEffect, useState } from "react";

import { getDashboardStats } from "../../services/adminService";

import "./Dashboard.scss";

const Dashboard = () => {

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const response = await getDashboardStats();

        if (response.success) {
          setDashboard(response);
        } else {
          setError(
            response.message || "Failed to load dashboard"
          );
        }
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error.response?.data?.message ||
          "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);


  return (
    <div className="dashboard">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back. Here's what's happening
            with your store today.
          </p>
        </div>

        <button className="dashboard-period">
          This Month
        </button>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}
      <div className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <FiDollarSign />
            </div>

            <span className="stat-menu">
              <FiMoreVertical />
            </span>
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Total Revenue
            </span>

            <h2>
              ₦{Number(dashboard?.stats?.totalRevenue || 0).toLocaleString()}
            </h2>

            <div className="stat-change positive">
              <FiArrowUp />
              <span>0%</span>
              <small>
                vs last month
              </small>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <FiShoppingCart />
            </div>

            <span className="stat-menu">
              <FiMoreVertical />
            </span>
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Total Orders
            </span>

            <h2>
              {dashboard?.stats?.totalOrders || 0}
            </h2>

            <div className="stat-change positive">
              <FiArrowUp />
              <span>0%</span>
              <small>
                vs last month
              </small>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <FiUsers />
            </div>

            <span className="stat-menu">
              <FiMoreVertical />
            </span>
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Customers
            </span>

            <h2>
              {dashboard?.stats?.totalCustomers || 0}
            </h2>

            <div className="stat-change positive">
              <FiArrowUp />
              <span>0%</span>
              <small>
                vs last month
              </small>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <FiBox />
            </div>

            <span className="stat-menu">
              <FiMoreVertical />
            </span>
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Products
            </span>

            <h2>
              {dashboard?.stats?.totalProducts || 0}
            </h2>

            <div className="stat-change neutral">
              <span>—</span>
              <small>
                Current inventory
              </small>
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          MAIN DASHBOARD GRID
      ===================================================== */}
      <div className="dashboard-grid">

        {/* ===================================================
            SALES OVERVIEW
        =================================================== */}
        <section className="dashboard-card sales-card">

          <div className="card-header">
            <div>
              <h2>
                Sales Overview
              </h2>

              <p>
                Revenue performance
              </p>
            </div>

            <button className="card-filter">
              Monthly
            </button>
          </div>

          <div className="sales-placeholder">

            <div className="sales-y-axis">
              <span>₦100k</span>
              <span>₦75k</span>
              <span>₦50k</span>
              <span>₦25k</span>
              <span>₦0</span>
            </div>

            <div className="sales-chart">

              <div className="chart-grid">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="chart-empty">
                <FiDollarSign />

                <span>
                  No sales data available
                </span>
              </div>

              <div className="chart-months">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            ORDER SUMMARY
        =================================================== */}
        <section className="dashboard-card order-summary-card">

          <div className="card-header">
            <div>
              <h2>
                Order Summary
              </h2>

              <p>
                Current order status
              </p>
            </div>

            <button className="view-link">
              View all
            </button>
          </div>

          <div className="order-summary">

            <div className="order-summary-item">
              <div className="order-summary-info">
                <span className="summary-dot pending" />
                <span>Pending</span>
              </div>

              <strong>
                {dashboard?.orders?.pending || 0}
              </strong>
            </div>

            <div className="order-summary-item">
              <div className="order-summary-info">
                <span className="summary-dot processing" />
                <span>Processing</span>
              </div>

              <strong>
                {dashboard?.orders?.processing || 0}
              </strong>
            </div>

            <div className="order-summary-item">
              <div className="order-summary-info">
                <span className="summary-dot shipped" />
                <span>Shipped</span>
              </div>

              <strong>
                {dashboard?.orders?.shipped || 0}
              </strong>
            </div>

            <div className="order-summary-item">
              <div className="order-summary-info">
                <span className="summary-dot completed" />
                <span>Completed</span>
              </div>

              <strong>
                {dashboard?.orders?.completed || 0}
              </strong>
            </div>

            <div className="order-summary-item">
              <div className="order-summary-info">
                <span className="summary-dot cancelled" />
                <span>Cancelled</span>
              </div>

              <strong>
                {dashboard?.orders?.cancelled || 0}
              </strong>
            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          RECENT PRODUCTS
      ===================================================== */}
      <section className="dashboard-card recent-products-card">

        <div className="card-header">

          <div>
            <h2>
              Recent Products
            </h2>

            <p>
              Recently added products
            </p>
          </div>

          <a
            href="/admin/products"
            className="view-link"
          >
            View all
          </a>

        </div>

        {dashboard?.recentProducts?.length > 0 ? (
          <div className="recent-products-list">
            {dashboard.recentProducts.map((product) => (
              <div
                className="recent-product-item"
                key={product.id}
              >
                <div className="recent-product-info">
                  <strong>{product.name}</strong>

                  <span>
                    {product.category_name || "Uncategorized"}
                  </span>
                </div>

                <div className="recent-product-meta">
                  <strong>
                    ₦{Number(product.price || 0).toLocaleString()}
                  </strong>

                  <span>
                    Stock: {product.stock_quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-dashboard">
            <FiBox />

            <h3>
              No products yet
            </h3>

            <p>
              Your recently added products
              will appear here.
            </p>

            <a
              href="/admin/products/create"
              className="dashboard-action"
            >
              Add Product
            </a>
          </div>
        )}

      </section>

      {/* =====================================================
          RECENT ORDERS
      ===================================================== */}
      <section className="dashboard-card recent-orders-card">

        <div className="card-header">

          <div>
            <h2>
              Recent Orders
            </h2>

            <p>
              Latest customer orders
            </p>
          </div>

          <button className="view-link">
            View all
          </button>

        </div>

        <div className="empty-dashboard">

          <FiShoppingCart />

          <h3>
            No orders yet
          </h3>

          <p>
            Customer orders will appear here
            when they are placed.
          </p>

        </div>

      </section>

    </div>
  );
};

export default Dashboard;