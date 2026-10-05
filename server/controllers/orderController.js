const pool = require("../config/db");

const {
  createOrder,
  createOrderItem,
  findOrderById,
  findOrderByNumber,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderStatistics,
  getRecentOrders,
} = require("../models/orderModel");

/*
|--------------------------------------------------------------------------
| Create New Order From Cart
|--------------------------------------------------------------------------
*/

const createNewOrder = async (req, res) => {
  const userId = req.user.id;

  const {
    shipping_address_id,
    shipping_first_name,
    shipping_last_name,
    shipping_phone,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_country,
    shipping_postal_code,
    shipping_fee = 0,
    discount = 0,
    payment_method = null,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Shipping Information
    |--------------------------------------------------------------------------
    */

    if (
      !shipping_first_name ||
      !shipping_last_name ||
      !shipping_phone ||
      !shipping_address ||
      !shipping_city ||
      !shipping_state
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping information is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Start Transaction
    |--------------------------------------------------------------------------
    */

    await connection.beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Find User Cart
    |--------------------------------------------------------------------------
    */

    const [carts] = await connection.query(
      `
      SELECT
        id,
        user_id

      FROM carts

      WHERE user_id = ?

      LIMIT 1

      FOR UPDATE
      `,
      [userId]
    );

    if (!carts.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Cart not found",
      });
    }

    const cartId = carts[0].id;

    /*
    |--------------------------------------------------------------------------
    | Get Cart Items
    |--------------------------------------------------------------------------
    */

    const [cartItems] = await connection.query(
      `
      SELECT
        ci.id AS cart_item_id,
        ci.product_id,
        ci.quantity,
        ci.price,

        p.name,
        p.sku,
        p.stock_quantity,
        p.status

      FROM cart_items ci

      INNER JOIN products p
        ON ci.product_id = p.id

      WHERE ci.cart_id = ?

      FOR UPDATE
      `,
      [cartId]
    );

    if (!cartItems.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Stock
    |--------------------------------------------------------------------------
    */

    for (const item of cartItems) {
      if (item.status !== "active") {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `${item.name} is currently unavailable`,
        });
      }

      if (item.stock_quantity < item.quantity) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available stock: ${item.stock_quantity}`,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate Subtotal
    |--------------------------------------------------------------------------
    */

    const subtotal = cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(item.price) * Number(item.quantity)
        );
      },
      0
    );

    const shippingFeeAmount =
      Number(shipping_fee) || 0;

    const discountAmount =
      Number(discount) || 0;

    if (discountAmount < 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Discount cannot be negative",
      });
    }

    if (discountAmount > subtotal) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed subtotal",
      });
    }

    const totalAmount =
      subtotal +
      shippingFeeAmount -
      discountAmount;

    /*
    |--------------------------------------------------------------------------
    | Create Order
    |--------------------------------------------------------------------------
    */

    const order = await createOrder(
      {
        user_id: userId,

        subtotal,

        shipping_fee: shippingFeeAmount,

        discount: discountAmount,

        total_amount: totalAmount,

        payment_status: "pending",

        order_status: "pending",

        shipping_address_id:
          shipping_address_id || null,

        shipping_first_name,

        shipping_last_name,

        shipping_phone,

        shipping_address,

        shipping_city,

        shipping_state,

        shipping_country:
          shipping_country || "Nigeria",

        shipping_postal_code:
          shipping_postal_code || null,
      },
      connection
    );

    /*
    |--------------------------------------------------------------------------
    | Create Order Items + Reduce Stock
    |--------------------------------------------------------------------------
    */

    for (const item of cartItems) {
      const itemSubtotal =
        Number(item.price) *
        Number(item.quantity);

      await createOrderItem(
        {
          order_id: order.id,

          product_id: item.product_id,

          product_name: item.name,

          product_sku: item.sku,

          price: item.price,

          quantity: item.quantity,

          subtotal: itemSubtotal,
        },
        connection
      );

      const [stockResult] =
        await connection.query(
          `
          UPDATE products

          SET
            stock_quantity = stock_quantity - ?,

            status =
              CASE
                WHEN stock_quantity - ? <= 0
                THEN 'out_of_stock'
                ELSE status
              END

          WHERE id = ?

          AND stock_quantity >= ?
          `,
          [
            item.quantity,
            item.quantity,
            item.product_id,
            item.quantity,
          ]
        );

      if (stockResult.affectedRows !== 1) {
        throw new Error(
          `Failed to update stock for product ${item.product_id}`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Create Pending Payment Record
    |--------------------------------------------------------------------------
    */

    if (payment_method) {
      const reference = `PAY-${Date.now()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      let provider = payment_method;

      if (
        provider !== "paystack" &&
        provider !== "flutterwave"
      ) {
        provider = "paystack";
      }

      await connection.query(
        `
        INSERT INTO payments (
          order_id,
          reference,
          provider,
          amount,
          currency,
          status
        )
        VALUES (?, ?, ?, ?, 'NGN', 'pending')
        `,
        [
          order.id,
          reference,
          provider,
          totalAmount,
        ]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Clear Cart
    |--------------------------------------------------------------------------
    */

    await connection.query(
      `
      DELETE FROM cart_items

      WHERE cart_id = ?
      `,
      [cartId]
    );

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await connection.commit();

    /*
    |--------------------------------------------------------------------------
    | Return Created Order
    |--------------------------------------------------------------------------
    */

    const createdOrder =
      await findOrderById(order.id);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: createdOrder,
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| Get All Orders - Admin
|--------------------------------------------------------------------------
*/

const getOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get My Orders
|--------------------------------------------------------------------------
*/

const getMyOrders = async (req, res) => {
  try {
    const orders =
      await getOrdersByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get my orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your orders",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
*/

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order =
      await findOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      Number(order.user_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Order By Number
|--------------------------------------------------------------------------
*/

const getOrderByOrderNumber = async (
  req,
  res
) => {
  try {
    const { orderNumber } = req.params;

    const order =
      await findOrderByNumber(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      Number(order.user_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order by number error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Order Status - Admin
|--------------------------------------------------------------------------
*/

const changeOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (
      !allowedStatuses.includes(order_status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status",
      });
    }

    const affectedRows =
      await updateOrderStatus(
        id,
        order_status
      );

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order =
      await findOrderById(id);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Change order status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update order status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Payment Status - Admin
|--------------------------------------------------------------------------
*/

const changePaymentStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
      "partially_refunded",
    ];

    if (
      !allowedStatuses.includes(
        payment_status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status",
      });
    }

    const affectedRows =
      await updatePaymentStatus(
        id,
        payment_status
      );

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order =
      await findOrderById(id);

    return res.status(200).json({
      success: true,
      message:
        "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Change payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update payment status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Order - Admin
|--------------------------------------------------------------------------
*/

const removeOrder = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const affectedRows =
      await deleteOrder(id);

    if (!affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Order Statistics - Admin
|--------------------------------------------------------------------------
*/

const getOrderStats = async (
  req,
  res
) => {
  try {
    const stats =
      await getOrderStatistics();

    return res.status(200).json({
      success: true,
      data: {
        totalOrders:
          Number(stats.total_orders) || 0,

        totalOrderValue:
          Number(
            stats.total_order_value
          ) || 0,

        pending:
          Number(
            stats.pending_orders
          ) || 0,

        processing:
          Number(
            stats.processing_orders
          ) || 0,

        shipped:
          Number(
            stats.shipped_orders
          ) || 0,

        delivered:
          Number(
            stats.delivered_orders
          ) || 0,

        cancelled:
          Number(
            stats.cancelled_orders
          ) || 0,
      },
    });
  } catch (error) {
    console.error(
      "Get order statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve order statistics",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Recent Orders - Admin
|--------------------------------------------------------------------------
*/

const getRecentOrderList = async (
  req,
  res
) => {
  try {
    const limit =
      Number(req.query.limit) || 5;

    const orders =
      await getRecentOrders(limit);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Get recent orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve recent orders",
    });
  }
};

const createCheckoutOrder = async (req, res) => {
    const userId = req.user.id;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // -------------------------------------------------
        // 1. Get customer's cart
        // -------------------------------------------------

        const [cartRows] = await connection.query(
            `
            SELECT id
            FROM carts
            WHERE user_id = ?
            LIMIT 1
            `,
            [userId]
        );

        if (cartRows.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        const cartId = cartRows[0].id;

        // -------------------------------------------------
        // 2. Get cart items + CURRENT product information
        // -------------------------------------------------

        const [cartItems] = await connection.query(
            `
            SELECT
                ci.id AS cart_item_id,
                ci.product_id,
                ci.quantity,

                p.name,
                p.sku,
                p.price,
                p.stock_quantity,
                p.status

            FROM cart_items ci

            INNER JOIN products p
                ON ci.product_id = p.id

            WHERE ci.cart_id = ?
            FOR UPDATE
            `,
            [cartId]
        );

        if (cartItems.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // -------------------------------------------------
        // 3. Validate products and stock
        // -------------------------------------------------

        for (const item of cartItems) {
            if (item.status !== "active") {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        `${item.name} is no longer available.`,
                });
            }

            if (
                Number(item.quantity) >
                Number(item.stock_quantity)
            ) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${item.stock_quantity} unit(s) of ${item.name} are available.`,
                });
            }
        }

        // -------------------------------------------------
        // 4. Get shipping address
        // -------------------------------------------------

        const {
            address_id,
        } = req.body;

        if (!address_id) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "A shipping address is required.",
            });
        }

        const [addressRows] = await connection.query(
            `
            SELECT
                id,
                first_name,
                last_name,
                phone,
                address,
                city,
                state,
                country,
                postal_code

            FROM addresses

            WHERE id = ?
              AND user_id = ?

            LIMIT 1
            `,
            [address_id, userId]
        );

        if (addressRows.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "Shipping address not found.",
            });
        }

        const shippingAddress =
            addressRows[0];

        // -------------------------------------------------
        // 5. Calculate subtotal from DATABASE prices
        // -------------------------------------------------

        let subtotal = 0;

        for (const item of cartItems) {
            subtotal +=
                Number(item.price) *
                Number(item.quantity);
        }

        // -------------------------------------------------
        // 6. Calculate shipping
        // -------------------------------------------------
        //
        // For now we use a fixed shipping fee.
        // We can replace this later with location-based
        // shipping calculations.
        //

        const shippingFee = 0;

        // -------------------------------------------------
        // 7. Discount
        // -------------------------------------------------

        const discount = 0;

        // -------------------------------------------------
        // 8. Calculate final total
        // -------------------------------------------------

        const totalAmount =
            subtotal +
            shippingFee -
            discount;

        // -------------------------------------------------
        // 9. Generate order number
        // -------------------------------------------------

        const orderNumber =
            `ORD-${Date.now()}-${Math.floor(
                Math.random() * 10000
            )
                .toString()
                .padStart(4, "0")}`;

        // -------------------------------------------------
        // 10. Create order
        // -------------------------------------------------

        const [orderResult] =
            await connection.query(
                `
                INSERT INTO orders
                (
                    user_id,
                    order_number,
                    subtotal,
                    shipping_fee,
                    discount,
                    total_amount,

                    payment_status,
                    order_status,

                    shipping_address_id,
                    shipping_first_name,
                    shipping_last_name,
                    shipping_phone,
                    shipping_address,
                    shipping_city,
                    shipping_state,
                    shipping_country,
                    shipping_postal_code
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,

                    'pending',
                    'pending',

                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    userId,
                    orderNumber,

                    subtotal,
                    shippingFee,
                    discount,
                    totalAmount,

                    shippingAddress.id,
                    shippingAddress.first_name,
                    shippingAddress.last_name,
                    shippingAddress.phone,
                    shippingAddress.address,
                    shippingAddress.city,
                    shippingAddress.state,
                    shippingAddress.country,
                    shippingAddress.postal_code,
                ]
            );

        const orderId =
            orderResult.insertId;

        // -------------------------------------------------
        // 11. Create order items
        // -------------------------------------------------

        for (const item of cartItems) {
            const itemSubtotal =
                Number(item.price) *
                Number(item.quantity);

            await connection.query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    product_name,
                    product_sku,
                    price,
                    quantity,
                    subtotal
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    orderId,
                    item.product_id,
                    item.name,
                    item.sku,
                    item.price,
                    item.quantity,
                    itemSubtotal,
                ]
            );
        }

        // -------------------------------------------------
        // 12. Reduce product stock
        // -------------------------------------------------

        for (const item of cartItems) {
            await connection.query(
                `
                UPDATE products
                SET stock_quantity =
                    stock_quantity - ?
                WHERE id = ?
                  AND stock_quantity >= ?
                `,
                [
                    item.quantity,
                    item.product_id,
                    item.quantity,
                ]
            );
        }

        // -------------------------------------------------
        // 13. Update products that are now out of stock
        // -------------------------------------------------

        await connection.query(
            `
            UPDATE products
            SET status = 'out_of_stock'
            WHERE id IN (
                SELECT product_id
                FROM order_items
                WHERE order_id = ?
            )
            AND stock_quantity <= 0
            `,
            [orderId]
        );

        // -------------------------------------------------
        // 14. Clear customer's cart
        // -------------------------------------------------

        await connection.query(
            `
            DELETE FROM cart_items
            WHERE cart_id = ?
            `,
            [cartId]
        );

        // -------------------------------------------------
        // 15. Commit transaction
        // -------------------------------------------------

        await connection.commit();

        // -------------------------------------------------
        // 16. Return order information
        // -------------------------------------------------

        return res.status(201).json({
            success: true,
            message:
                "Order created successfully",
            data: {
                order_id: orderId,
                order_number: orderNumber,
                subtotal,
                shipping_fee: shippingFee,
                discount,
                total_amount: totalAmount,
                payment_status: "pending",
                order_status: "pending",
            },
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Checkout order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create checkout order",
        });
    } finally {
        connection.release();
    }
};

module.exports = {
  createNewOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  getOrderByOrderNumber,
  changeOrderStatus,
  changePaymentStatus,
  removeOrder,
  getOrderStats,
  getRecentOrderList,
  createCheckoutOrder,
};