const pool = require("../config/db");

const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${timestamp}-${random}`;
};

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

const createOrder = async (
  {
    user_id,
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
    shipping_postal_code,
  },
  connection = pool
) => {
  const orderNumber = generateOrderNumber();

  const [result] = await connection.query(
    `
    INSERT INTO orders (
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user_id,
      orderNumber,
      subtotal,
      shipping_fee || 0,
      discount || 0,
      total_amount,
      payment_status || "pending",
      order_status || "pending",
      shipping_address_id || null,
      shipping_first_name,
      shipping_last_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_country || "Nigeria",
      shipping_postal_code || null,
    ]
  );

  return {
    id: result.insertId,
    order_number: orderNumber,
  };
};

/*
|--------------------------------------------------------------------------
| Create Order Item
|--------------------------------------------------------------------------
*/

const createOrderItem = async (
  {
    order_id,
    product_id,
    product_name,
    product_sku,
    price,
    quantity,
    subtotal,
  },
  connection = pool
) => {
  const [result] = await connection.query(
    `
    INSERT INTO order_items (
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
      order_id,
      product_id,
      product_name,
      product_sku,
      price,
      quantity,
      subtotal,
    ]
  );

  return result.insertId;
};

/*
|--------------------------------------------------------------------------
| Find Order By ID
|--------------------------------------------------------------------------
*/

const findOrderById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      o.*,

      u.first_name AS customer_first_name,
      u.last_name AS customer_last_name,
      u.email AS customer_email,
      u.phone AS customer_phone

    FROM orders o

    INNER JOIN users u
      ON o.user_id = u.id

    WHERE o.id = ?

    LIMIT 1
    `,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  const order = rows[0];

  // const [items] = await pool.query(
  //   `
  //   SELECT
  //     oi.id,
  //     oi.order_id,
  //     oi.product_id,
  //     oi.product_name,
  //     oi.product_sku,
  //     oi.price,
  //     oi.quantity,
  //     oi.subtotal,
  //     oi.created_at

  //   FROM order_items oi

  //   WHERE oi.order_id = ?

  //   ORDER BY oi.id ASC
  //   `,
  //   [id]
  // );

  const [items] = await pool.query(
    `
  SELECT
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.product_name,
    oi.product_sku,
    oi.price,
    oi.quantity,
    oi.subtotal,
    oi.created_at,

    (
      SELECT pi.image_url
      FROM product_images pi
      WHERE pi.product_id = oi.product_id
      ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
      LIMIT 1
    ) AS image_url

  FROM order_items oi

  WHERE oi.order_id = ?

  ORDER BY oi.id ASC
  `,
    [id]
  );

  order.items = items;

  const [payments] = await pool.query(
    `
    SELECT
      id,
      order_id,
      reference,
      provider,
      amount,
      currency,
      status,
      paid_at,
      created_at,
      updated_at

    FROM payments

    WHERE order_id = ?

    ORDER BY created_at DESC
    `,
    [id]
  );

  order.payments = payments;

  return order;
};

/*
|--------------------------------------------------------------------------
| Find Order By Number
|--------------------------------------------------------------------------
*/

const findOrderByNumber = async (orderNumber) => {
  const [rows] = await pool.query(
    `
    SELECT
      o.*,

      u.first_name AS customer_first_name,
      u.last_name AS customer_last_name,
      u.email AS customer_email,
      u.phone AS customer_phone

    FROM orders o

    INNER JOIN users u
      ON o.user_id = u.id

    WHERE o.order_number = ?

    LIMIT 1
    `,
    [orderNumber]
  );

  if (!rows[0]) {
    return null;
  }

  return findOrderById(rows[0].id);
};

/*
|--------------------------------------------------------------------------
| Get All Orders
|--------------------------------------------------------------------------
*/

// const getAllOrders = async () => {
//   const [rows] = await pool.query(
//     `
//     SELECT
//       o.id,
//       o.order_number,
//       o.user_id,
//       o.subtotal,
//       o.shipping_fee,
//       o.discount,
//       o.total_amount,
//       o.payment_status,
//       o.order_status,

//       o.shipping_first_name,
//       o.shipping_last_name,
//       o.shipping_phone,
//       o.shipping_city,
//       o.shipping_state,
//       o.shipping_country,

//       o.created_at,
//       o.updated_at,

//       u.first_name AS customer_first_name,
//       u.last_name AS customer_last_name,
//       u.email AS customer_email

//     FROM orders o

//     INNER JOIN users u
//       ON o.user_id = u.id

//     ORDER BY o.created_at DESC
//     `
//   );

//   return rows;
// };

const getAllOrders = async () => {
    const [rows] = await pool.query(`
        SELECT
            o.id,
            o.order_number,
            o.user_id,
            o.subtotal,
            o.shipping_fee,
            o.discount,
            o.total_amount,
            o.payment_status,
            o.order_status,
            o.shipping_first_name,
            o.shipping_last_name,
            o.shipping_phone,
            o.shipping_city,
            o.shipping_state,
            o.shipping_country,
            o.created_at,
            o.updated_at,

            u.first_name AS customer_first_name,
            u.last_name AS customer_last_name,
            u.email AS customer_email

        FROM orders o

        LEFT JOIN users u
            ON o.user_id = u.id

        ORDER BY o.created_at DESC
    `);

    return rows;
};

/*
|--------------------------------------------------------------------------
| Get Orders By User
|--------------------------------------------------------------------------
*/

const getOrdersByUserId = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      order_number,
      subtotal,
      shipping_fee,
      discount,
      total_amount,
      payment_status,
      order_status,
      shipping_first_name,
      shipping_last_name,
      shipping_city,
      shipping_state,
      shipping_country,
      created_at,
      updated_at

    FROM orders

    WHERE user_id = ?

    ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows;
};

/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

const updateOrderStatus = async (id, orderStatus) => {
  const [result] = await pool.query(
    `
    UPDATE orders

    SET order_status = ?

    WHERE id = ?
    `,
    [orderStatus, id]
  );

  return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/

const updatePaymentStatus = async (id, paymentStatus) => {
  const [result] = await pool.query(
    `
    UPDATE orders

    SET payment_status = ?

    WHERE id = ?
    `,
    [paymentStatus, id]
  );

  return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Delete Order
|--------------------------------------------------------------------------
*/

const deleteOrder = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM orders

    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows;
};

/*
|--------------------------------------------------------------------------
| Order Statistics
|--------------------------------------------------------------------------
*/

const getOrderStatistics = async () => {
  const [rows] = await pool.query(
    `
    SELECT

      COUNT(*) AS total_orders,

      COALESCE(
        SUM(total_amount),
        0
      ) AS total_order_value,

      SUM(
        CASE
          WHEN order_status = 'pending'
          THEN 1
          ELSE 0
        END
      ) AS pending_orders,

      SUM(
        CASE
          WHEN order_status = 'processing'
          THEN 1
          ELSE 0
        END
      ) AS processing_orders,

      SUM(
        CASE
          WHEN order_status = 'shipped'
          THEN 1
          ELSE 0
        END
      ) AS shipped_orders,

      SUM(
        CASE
          WHEN order_status = 'delivered'
          THEN 1
          ELSE 0
        END
      ) AS delivered_orders,

      SUM(
        CASE
          WHEN order_status = 'cancelled'
          THEN 1
          ELSE 0
        END
      ) AS cancelled_orders

    FROM orders
    `
  );

  return rows[0];
};

/*
|--------------------------------------------------------------------------
| Recent Orders
|--------------------------------------------------------------------------
*/

const getRecentOrders = async (limit = 5) => {
  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || 5, 20)
  );

  const [rows] = await pool.query(
    `
    SELECT
      o.id,
      o.order_number,
      o.total_amount,
      o.payment_status,
      o.order_status,
      o.created_at,

      u.first_name AS customer_first_name,
      u.last_name AS customer_last_name,
      u.email AS customer_email

    FROM orders o

    INNER JOIN users u
      ON o.user_id = u.id

    ORDER BY o.created_at DESC

    LIMIT ${safeLimit}
    `
  );

  return rows;
};

module.exports = {
  generateOrderNumber,
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
};