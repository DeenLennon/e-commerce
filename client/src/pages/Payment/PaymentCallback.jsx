import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";

import { verifyPayment } from "../../services/paymentService";

import "./PaymentCallback.scss";

const PaymentCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState(
        "Please wait while we confirm your payment."
    );
    const [order, setOrder] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const verifyTransaction = async () => {
            // Paystack normally returns `reference`.
            // `trxref` is also commonly present, so support both.
            const reference =
                searchParams.get("reference") ||
                searchParams.get("trxref");

            if (!reference) {
                if (!isMounted) return;

                setStatus("error");
                setMessage(
                    "No payment reference was found. We could not verify this transaction."
                );

                return;
            }

            try {
                if (isMounted) {
                    setStatus("verifying");
                    setMessage(
                        "Verifying your payment securely with Paystack..."
                    );
                }

                const response = await verifyPayment(reference);

                if (!isMounted) return;

                if (!response?.success) {
                    setStatus("error");

                    setMessage(
                        response?.message ||
                            "Payment verification failed."
                    );

                    return;
                }

                /*
                 * Our backend can return the order in different
                 * locations depending on the controller response.
                 */
                const verifiedOrder =
                    response.order ||
                    response.payment?.order ||
                    null;

                const orderId =
                    response.order_id ||
                    response.payment?.order_id ||
                    verifiedOrder?.id ||
                    null;

                const orderNumber =
                    response.order_number ||
                    response.payment?.order_number ||
                    verifiedOrder?.order_number ||
                    null;

                setOrder({
                    id: orderId,
                    order_number: orderNumber,
                    reference,
                    payment_status:
                        response.payment?.status ||
                        "successful",
                });

                setStatus("success");

                setMessage(
                    "Your payment has been successfully verified."
                );
            } catch (error) {
                console.error(
                    "Payment verification error:",
                    error
                );

                if (!isMounted) return;

                const backendMessage =
                    error?.response?.data?.message;

                setStatus("error");

                setMessage(
                    backendMessage ||
                        "We could not verify your payment at this time. Please check your order before trying again."
                );
            }
        };

        verifyTransaction();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    const handleViewOrder = () => {
        if (order?.id) {
            navigate(`/orders/${order.id}`, {
                state: {
                    paymentSuccess: true,
                },
            });

            return;
        }

        navigate("/orders");
    };

    if (status === "verifying") {
        return (
            <main className="payment-callback">
                <div className="payment-callback__card">
                    <div className="payment-callback__icon payment-callback__icon--loading">
                        <FiLoader />
                    </div>

                    <h1>Verifying Payment</h1>

                    <p>
                        {message}
                    </p>

                    <div className="payment-callback__loader">
                        <span />
                        <span />
                        <span />
                    </div>

                    <small>
                        Please do not close this page.
                    </small>
                </div>
            </main>
        );
    }

    if (status === "success") {
        return (
            <main className="payment-callback">
                <div className="payment-callback__card payment-callback__card--success">
                    <div className="payment-callback__icon payment-callback__icon--success">
                        <FiCheckCircle />
                    </div>

                    <h1>Payment Successful</h1>

                    <p>
                        {message}
                    </p>

                    {order?.order_number && (
                        <div className="payment-callback__details">
                            <div>
                                <span>Order Number</span>
                                <strong>
                                    {order.order_number}
                                </strong>
                            </div>

                            <div>
                                <span>Payment Reference</span>
                                <strong>
                                    {order.reference}
                                </strong>
                            </div>

                            <div>
                                <span>Payment Status</span>
                                <strong className="payment-status">
                                    Successful
                                </strong>
                            </div>
                        </div>
                    )}

                    <div className="payment-callback__actions">
                        <button
                            type="button"
                            className="payment-callback__primary"
                            onClick={handleViewOrder}
                        >
                            View Order
                        </button>

                        <Link
                            to="/"
                            className="payment-callback__secondary"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="payment-callback">
            <div className="payment-callback__card payment-callback__card--error">
                <div className="payment-callback__icon payment-callback__icon--error">
                    <FiAlertCircle />
                </div>

                <h1>Payment Could Not Be Verified</h1>

                <p>
                    {message}
                </p>

                <div className="payment-callback__warning">
                    <strong>
                        Important
                    </strong>

                    <span>
                        Your payment was not marked as
                        successful until Paystack
                        verification completed.
                    </span>
                </div>

                <div className="payment-callback__actions">
                    <Link
                        to="/orders"
                        className="payment-callback__primary"
                    >
                        View My Orders
                    </Link>

                    <Link
                        to="/"
                        className="payment-callback__secondary"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default PaymentCallback;