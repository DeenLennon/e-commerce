
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ShoppingBag,
  ArrowForward,
  ReceiptLong,
} from "@mui/icons-material";

import "./OrderSuccess.scss";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = location.state?.orderId;
  const orderNumber = location.state?.orderNumber;

  const displayOrderNumber =
    orderNumber || (orderId ? `#${orderId}` : null);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
      return;
    }

    navigate("/orders");
  };

  return (
    <main className="order-success-page">
      <div className="order-success-container">
        <div className="success-card">
          {/* Success Icon */}
          <div className="success-icon-wrapper">
            <CheckCircle className="success-icon" />
          </div>

          {/* Heading */}
          <div className="success-content">
            <span className="success-label">PAYMENT SUCCESSFUL</span>

            <h1>Order Placed Successfully!</h1>

            <p className="success-message">
              Thank you for shopping with <strong>DIRECTLINKS</strong>.
              Your order has been received and is now being processed.
            </p>

            {/* Order Number */}
            {displayOrderNumber && (
              <div className="order-number">
                <ReceiptLong />

                <div>
                  <span>Order Number</span>
                  <strong>{displayOrderNumber}</strong>
                </div>
              </div>
            )}

            {/* Information */}
            <div className="success-info">
              <div className="info-item">
                <CheckCircle />
                <div>
                  <strong>Order Confirmed</strong>
                  <span>Your order has been successfully placed.</span>
                </div>
              </div>

              <div className="info-item">
                <ShoppingBag />
                <div>
                  <strong>We're Processing Your Order</strong>
                  <span>
                    We'll notify you when your order is ready for
                    delivery.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="success-actions">
              <button
                type="button"
                className="primary-action"
                onClick={handleViewOrder}
              >
                <ReceiptLong />
                View Order
                <ArrowForward />
              </button>

              <Link to="/products" className="secondary-action">
                <ShoppingBag />
                Continue Shopping
              </Link>
            </div>

            {/* Orders Link */}
            <Link to="/orders" className="orders-link">
              View all my orders
              <ArrowForward />
            </Link>
          </div>
        </div>

        {/* Bottom Support Message */}
        <div className="success-footer">
          <p>
            Need help with your order?
            <Link to="/contact"> Contact TECHSTORE Support</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;