const crypto = require("crypto");

const pool = require("../config/db");

const {
    initializePaystackTransaction,
    verifyPaystackTransaction,
} = require("../services/paymentService");

/*
|--------------------------------------------------------------------------
| Generate Payment Reference
|--------------------------------------------------------------------------
*/

const generatePaymentReference = () => {
    return `PAY-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;
};

/*
|--------------------------------------------------------------------------
| Initialize Payment
|--------------------------------------------------------------------------
*/

const initializePayment = async (req, res) => {
    try {
        const userId = req.user.id;

        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get order
        |--------------------------------------------------------------------------
        */

        const [orders] = await pool.query(
            `
            SELECT
                id,
                user_id,
                order_number,
                total_amount,
                payment_status,
                shipping_first_name,
                shipping_last_name
            FROM orders
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
            `,
            [order_id, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        const order = orders[0];

        /*
        |--------------------------------------------------------------------------
        | Prevent paying an already-paid order
        |--------------------------------------------------------------------------
        */

        if (order.payment_status === "paid") {
            return res.status(400).json({
                success: false,
                message: "This order has already been paid.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get customer email
        |--------------------------------------------------------------------------
        */

        const [users] = await pool.query(
            `
            SELECT
                id,
                email,
                first_name,
                last_name
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });
        }

        const user = users[0];

        /*
        |--------------------------------------------------------------------------
        | Generate unique payment reference
        |--------------------------------------------------------------------------
        */

        const reference = generatePaymentReference();

        /*
        |--------------------------------------------------------------------------
        | Create pending payment record
        |--------------------------------------------------------------------------
        */

        const [paymentResult] = await pool.query(
            `
            INSERT INTO payments
            (
                order_id,
                reference,
                provider,
                amount,
                currency,
                status
            )
            VALUES (?, ?, 'paystack', ?, 'NGN', 'pending')
            `,
            [
                order.id,
                reference,
                order.total_amount,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Paystack callback URL
        |--------------------------------------------------------------------------
        */

        const callbackUrl =
            `${process.env.CLIENT_URL}/payment/callback`;

        /*
        |--------------------------------------------------------------------------
        | Initialize Paystack
        |--------------------------------------------------------------------------
        */

        let paystackResponse;

        try {
            paystackResponse =
                await initializePaystackTransaction({
                    email: user.email,
                    amount: order.total_amount,
                    reference,
                    callbackUrl,
                });
        } catch (paystackError) {
            /*
            |--------------------------------------------------------------------------
            | Remove pending payment if Paystack initialization fails
            |--------------------------------------------------------------------------
            */

            await pool.query(
                `
                DELETE FROM payments
                WHERE id = ?
                `,
                [paymentResult.insertId]
            );

            console.error(
                "Paystack initialization error:",
                paystackError.response?.data ||
                    paystackError.message
            );

            return res.status(502).json({
                success: false,
                message:
                    paystackError.response?.data
                        ?.message ||
                    "Unable to initialize payment.",
            });
        }

        if (!paystackResponse?.status) {
            await pool.query(
                `
                DELETE FROM payments
                WHERE id = ?
                `,
                [paymentResult.insertId]
            );

            return res.status(502).json({
                success: false,
                message:
                    paystackResponse?.message ||
                    "Paystack payment initialization failed.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Return payment information
        |--------------------------------------------------------------------------
        */

        return res.status(201).json({
            success: true,
            message: "Payment initialized successfully.",
            payment: {
                id: paymentResult.insertId,
                reference,
                order_id: order.id,
                order_number: order.order_number,
                amount: Number(order.total_amount),
                currency: "NGN",
                authorization_url:
                    paystackResponse.data.authorization_url,
                access_code:
                    paystackResponse.data.access_code,
            },
        });
    } catch (error) {
        console.error(
            "Initialize payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to initialize payment.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Verify Payment
|--------------------------------------------------------------------------
*/

const verifyPayment = async (req, res) => {
    try {
        const userId = req.user.id;

        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Payment reference is required.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get payment
        |--------------------------------------------------------------------------
        */

        const [payments] = await pool.query(
            `
            SELECT
                p.id,
                p.order_id,
                p.reference,
                p.provider,
                p.amount,
                p.currency,
                p.status,
                o.user_id,
                o.order_number,
                o.total_amount,
                o.payment_status
            FROM payments p
            INNER JOIN orders o
                ON p.order_id = o.id
            WHERE p.reference = ?
              AND o.user_id = ?
            LIMIT 1
            `,
            [reference, userId]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found.",
            });
        }

        const payment = payments[0];

        /*
        |--------------------------------------------------------------------------
        | Already successful
        |--------------------------------------------------------------------------
        */

        if (
            payment.status === "successful" &&
            payment.payment_status === "paid"
        ) {
            return res.json({
                success: true,
                message: "Payment has already been verified.",
                payment,
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Verify with Paystack
        |--------------------------------------------------------------------------
        */

        let paystackResponse;

        try {
            paystackResponse =
                await verifyPaystackTransaction(
                    reference
                );
        } catch (paystackError) {
            console.error(
                "Paystack verification error:",
                paystackError.response?.data ||
                    paystackError.message
            );

            return res.status(502).json({
                success: false,
                message:
                    paystackError.response?.data
                        ?.message ||
                    "Unable to verify payment.",
            });
        }

        if (!paystackResponse?.status) {
            return res.status(400).json({
                success: false,
                message:
                    paystackResponse?.message ||
                    "Payment verification failed.",
            });
        }

        const transaction =
            paystackResponse.data;

        /*
        |--------------------------------------------------------------------------
        | Validate amount
        |--------------------------------------------------------------------------
        */

        const expectedAmount =
            Math.round(
                Number(payment.amount) * 100
            );

        const paidAmount =
            Number(transaction.amount);

        if (paidAmount !== expectedAmount) {
            await pool.query(
                `
                UPDATE payments
                SET status = 'failed'
                WHERE id = ?
                `,
                [payment.id]
            );

            return res.status(400).json({
                success: false,
                message:
                    "Payment amount does not match the order amount.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Successful payment
        |--------------------------------------------------------------------------
        */

        if (transaction.status === "success") {
            const connection =
                await pool.getConnection();

            try {
                await connection.beginTransaction();

                /*
                |--------------------------------------------------------------------------
                | Update payment
                |--------------------------------------------------------------------------
                */

                await connection.query(
                    `
                    UPDATE payments
                    SET
                        status = 'successful',
                        paid_at = NOW()
                    WHERE id = ?
                    `,
                    [payment.id]
                );

                /*
                |--------------------------------------------------------------------------
                | Update order
                |--------------------------------------------------------------------------
                */

                await connection.query(
                    `
                    UPDATE orders
                    SET
                        payment_status = 'paid'
                    WHERE id = ?
                    `,
                    [payment.order_id]
                );

                await connection.commit();

                return res.json({
                    success: true,
                    message:
                        "Payment verified successfully.",
                    payment: {
                        id: payment.id,
                        reference:
                            payment.reference,
                        status: "successful",
                        amount:
                            Number(payment.amount),
                        currency:
                            payment.currency,
                    },
                    order: {
                        id: payment.order_id,
                        order_number:
                            payment.order_number,
                        payment_status: "paid",
                    },
                });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Failed / abandoned / other status
        |--------------------------------------------------------------------------
        */

        await pool.query(
            `
            UPDATE payments
            SET status = 'failed'
            WHERE id = ?
            `,
            [payment.id]
        );

        return res.status(400).json({
            success: false,
            message:
                `Payment was not successful. Paystack status: ${transaction.status}`,
            payment_status: transaction.status,
        });
    } catch (error) {
        console.error(
            "Verify payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify payment.",
        });
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
};