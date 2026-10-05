import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiMapPin,
    FiPackage,
    FiShoppingBag,
} from "react-icons/fi";

import { getOrderById } from "../../services/orderService";
import { getImageUrl } from "../../utils/imageUrl";
import { initializePayment } from "../../services/paymentService";

import "./OrderDetails.scss";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const paymentSuccess = location.state?.paymentSuccess === true;

    const [order, setOrder] = useState(
        location.state?.order || null
    );
    const [loading, setLoading] = useState(!order);
    const [error, setError] = useState("");

    const [processingPayment, setProcessingPayment] =
        useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getOrderById(id);

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                        "Unable to load order."
                    );
                }

                const loadedOrder =
                    response.order ||
                    response.data ||
                    response;

                setOrder(loadedOrder);
            } catch (err) {
                console.error("Load order error:", err);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load order."
                );
            } finally {
                setLoading(false);
            }
        };

        if (!order || String(order.id) !== String(id)) {
            loadOrder();
        }
    }, [id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
        }).format(Number(amount || 0));
    };

    const handlePayment = async () => {
        try {
            setProcessingPayment(true);
            setError("");

            const response = await initializePayment(
                order.id
            );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Unable to initialize payment."
                );
            }

            const authorizationUrl =
                response.payment?.authorization_url;

            if (!authorizationUrl) {
                throw new Error(
                    "Paystack authorization URL was not returned."
                );
            }

            window.location.href =
                authorizationUrl;
        } catch (err) {
            console.error(
                "Payment initialization error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to initialize payment."
            );

            setProcessingPayment(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getStatusClass = (status) => {
        return String(status || "pending")
            .toLowerCase()
            .replace(/\s+/g, "-");
    };

    const getOrderItems = () => {
        if (Array.isArray(order?.items)) {
            return order.items;
        }

        return [];
    };

    {
        paymentSuccess && (
            <div className="order-payment-success">
                <FiCheckCircle />

                <div>
                    <strong>Payment confirmed</strong>

                    <span>
                        Your Paystack payment has been
                        successfully verified.
                    </span>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="order-details-page">
                <div className="order-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your order...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-details-page">
                <div className="order-error">
                    <FiPackage size={48} />

                    <h2>Order Not Found</h2>

                    <p>
                        {error ||
                            "We could not find this order."}
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="primary-button"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    const items = getOrderItems();

    return (
        <div className="order-details-page">
            <div className="order-container">

                {/* Back */}
                <button
                    className="back-button"
                    onClick={() => navigate("/")}
                >
                    <FiArrowLeft />
                    Continue Shopping
                </button>

                {/* Header */}
                <div className="order-header">
                    <div>
                        <div className="success-icon">
                            <FiCheckCircle />
                        </div>

                        <h1>Order Confirmed</h1>

                        <p>
                            Thank you for your order.
                            Your order has been successfully
                            created.
                        </p>
                    </div>

                    <div className="order-number">
                        <span>Order Number</span>

                        <strong>
                            {order.order_number}
                        </strong>
                    </div>
                </div>

                {/* Status cards */}
                <div className="order-status-grid">

                    <div className="status-card">
                        <FiPackage />

                        <div>
                            <span>Order Status</span>

                            <strong
                                className={`status-badge ${getStatusClass(
                                    order.order_status
                                )}`}
                            >
                                {order.order_status}
                            </strong>
                        </div>
                    </div>

                    <div className="status-card">
                        <FiCreditCard />

                        <div>
                            <span>Payment Status</span>

                            <strong
                                className={`status-badge ${getStatusClass(
                                    order.payment_status
                                )}`}
                            >
                                {order.payment_status}
                            </strong>
                        </div>
                    </div>

                    <div className="status-card">
                        <FiClock />

                        <div>
                            <span>Order Date</span>

                            <strong>
                                {formatDate(
                                    order.created_at
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="order-content">

                    {/* Main */}
                    <div className="order-main">

                        {/* Products */}
                        <section className="order-section">
                            <div className="section-heading">
                                <FiShoppingBag />

                                <div>
                                    <h2>Order Items</h2>

                                    <p>
                                        {items.length}{" "}
                                        {items.length === 1
                                            ? "item"
                                            : "items"}
                                    </p>
                                </div>
                            </div>

                            <div className="order-items">
                                {items.map((item) => (
                                    <div
                                        className="order-item"
                                        key={item.id}
                                    >
                                        <div className="item-image">
                                            {item.image_url ? (
                                                <img
                                                    src={getImageUrl(
                                                        item.image_url
                                                    )}
                                                    alt={
                                                        item.product_name
                                                    }
                                                />
                                            ) : (
                                                <FiPackage />
                                            )}
                                        </div>

                                        <div className="item-info">
                                            <h3>
                                                {
                                                    item.product_name
                                                }
                                            </h3>

                                            <p>
                                                SKU:{" "}
                                                {
                                                    item.product_sku
                                                }
                                            </p>

                                            <span>
                                                Qty:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </span>
                                        </div>

                                        <div className="item-price">
                                            <span>
                                                {formatCurrency(
                                                    item.price
                                                )}
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    item.subtotal
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Shipping */}
                        <section className="order-section">
                            <div className="section-heading">
                                <FiMapPin />

                                <div>
                                    <h2>
                                        Shipping Address
                                    </h2>

                                    <p>
                                        Your order will be
                                        delivered here
                                    </p>
                                </div>
                            </div>

                            <div className="shipping-address">
                                <strong>
                                    {order.shipping_first_name}{" "}
                                    {order.shipping_last_name}
                                </strong>

                                <p>
                                    {
                                        order.shipping_address
                                    }
                                </p>

                                <p>
                                    {order.shipping_city},{" "}
                                    {order.shipping_state}
                                </p>

                                <p>
                                    {
                                        order.shipping_country
                                    }
                                    {order.shipping_postal_code
                                        ? `, ${order.shipping_postal_code}`
                                        : ""}
                                </p>

                                <p>
                                    {
                                        order.shipping_phone
                                    }
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="order-sidebar">

                        <section className="summary-card">
                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Subtotal</span>

                                <strong>
                                    {formatCurrency(
                                        order.subtotal
                                    )}
                                </strong>
                            </div>

                            <div className="summary-row">
                                <span>Shipping</span>

                                <strong>
                                    {Number(
                                        order.shipping_fee
                                    ) === 0
                                        ? "Free"
                                        : formatCurrency(
                                            order.shipping_fee
                                        )}
                                </strong>
                            </div>

                            <div className="summary-row">
                                <span>Discount</span>

                                <strong>
                                    {Number(
                                        order.discount
                                    ) > 0
                                        ? `-${formatCurrency(
                                            order.discount
                                        )}`
                                        : formatCurrency(0)}
                                </strong>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Total</span>

                                <strong>
                                    {formatCurrency(
                                        order.total_amount
                                    )}
                                </strong>
                            </div>

                            {order.payment_status !== "paid" && (
                                <button
                                    className="payment-button"
                                    onClick={handlePayment}
                                    disabled={processingPayment}
                                >
                                    <FiCreditCard />

                                    {processingPayment
                                        ? "Connecting to Paystack..."
                                        : "Proceed to Payment"}
                                </button>
                            )}

                            <button
                                className="shopping-button"
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                <FiShoppingBag />

                                Continue Shopping
                            </button>
                        </section>

                        <section className="help-card">
                            <h3>Need Help?</h3>

                            <p>
                                If you have questions about
                                your order, please contact
                                our support team.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;