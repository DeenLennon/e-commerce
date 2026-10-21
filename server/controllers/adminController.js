const pool = require("../config/db");

const bcrypt = require("bcryptjs");

const {
  createUser,
  // findUserByEmail,
} = require("../models/userModel");


// GET /api/admin/dashboard

const getDashboardStats = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Product statistics
    // --------------------------------------------------------
    const [productStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_products,

        SUM(
          CASE
            WHEN status = 'active' THEN 1
            ELSE 0
          END
        ) AS active_products,

        SUM(
          CASE
            WHEN status = 'inactive' THEN 1
            ELSE 0
          END
        ) AS inactive_products,

        SUM(
          CASE
            WHEN status = 'out_of_stock' THEN 1
            ELSE 0
          END
        ) AS out_of_stock_products,

        SUM(
          CASE
            WHEN is_featured = 1 THEN 1
            ELSE 0
          END
        ) AS featured_products,

        COALESCE(SUM(stock_quantity), 0) AS total_stock_quantity,

        COALESCE(SUM(views_count), 0) AS total_product_views

      FROM products
    `);

    // --------------------------------------------------------
    // User statistics
    // --------------------------------------------------------
    const [userStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_users,

        SUM(
          CASE
            WHEN role <> 'admin' THEN 1
            ELSE 0
          END
        ) AS total_customers,

        SUM(
          CASE
            WHEN role <> 'admin'
            AND status = 'active'
            THEN 1
            ELSE 0
          END
        ) AS active_customers,

        SUM(
          CASE
            WHEN role = 'admin' THEN 1
            ELSE 0
          END
        ) AS total_admins

      FROM users
    `);

    // --------------------------------------------------------
    // Recent products
    // --------------------------------------------------------
    const [recentProducts] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.price,
        p.stock_quantity,
        p.status,
        p.is_featured,
        p.views_count,
        p.created_at,

        c.name AS category_name

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      ORDER BY p.created_at DESC

      LIMIT 5
    `);

    // --------------------------------------------------------
    // Product categories
    // --------------------------------------------------------
    const [categoryStats] = await pool.query(`
      SELECT
        c.id,
        c.name,
        COUNT(p.id) AS product_count

      FROM categories c

      LEFT JOIN products p
        ON p.category_id = c.id

      GROUP BY
        c.id,
        c.name

      ORDER BY product_count DESC
    `);

 
    // Recent users
    
    const [recentUsers] = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        status,
        created_at

      FROM users

      ORDER BY created_at DESC

      LIMIT 5
    `);

    // Response
    
    return res.status(200).json({
      success: true,

      stats: {
        totalProducts:
          Number(productStats[0]?.total_products) || 0,

        activeProducts:
          Number(productStats[0]?.active_products) || 0,

        inactiveProducts:
          Number(productStats[0]?.inactive_products) || 0,

        outOfStockProducts:
          Number(productStats[0]?.out_of_stock_products) || 0,

        featuredProducts:
          Number(productStats[0]?.featured_products) || 0,

        totalStockQuantity:
          Number(productStats[0]?.total_stock_quantity) || 0,

        totalProductViews:
          Number(productStats[0]?.total_product_views) || 0,

        totalUsers:
          Number(userStats[0]?.total_users) || 0,

        totalCustomers:
          Number(userStats[0]?.total_customers) || 0,

        activeCustomers:
          Number(userStats[0]?.active_customers) || 0,

        totalAdmins:
          Number(userStats[0]?.total_admins) || 0,

        // Orders will be added when the order module exists.
        totalOrders: 0,

        // Revenue will be added when the order module exists.
        totalRevenue: 0,
      },

      orders: {
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
      },

      recentProducts,

      recentUsers,

      categories: categoryStats,
    });
  } catch (error) {
    console.error("Get dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
    });
  }
};


// GET /api/admin/customers

const getCustomers = async (req, res) => {
  try {
    const [customers] = await pool.query(`
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.role,
                u.status,
                u.created_at,

                a.id AS address_id,
                a.first_name AS address_first_name,
                a.last_name AS address_last_name,
                a.phone AS address_phone,
                a.address AS default_address,
                a.city,
                a.state,
                a.country,
                a.postal_code,
                a.is_default,

                COALESCE(
                    NULLIF(
                        CONCAT_WS(', ', a.city, a.state),
                        ''
                    ),
                    NULL
                ) AS location

            FROM users AS u

            LEFT JOIN addresses AS a
                ON a.id = (
                    SELECT a2.id
                    FROM addresses AS a2
                    WHERE a2.user_id = u.id
                    ORDER BY
                        a2.is_default DESC,
                        a2.created_at DESC,
                        a2.id DESC
                    LIMIT 1
                )

            WHERE u.role = 'customer'
            ORDER BY u.created_at DESC
        `);

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customers.",
    });
  }
};


// const createCustomer = async (req, res) => {
//   try {
//     const { first_name, last_name, email, password, phone, location, } = req.body;

//     // 1. Validate required fields
//     if (
//       !first_name?.trim() ||
//       !last_name?.trim() ||
//       !email?.trim() ||
//       !password
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "First name, last name, email and password are required.",
//       });
//     }

//     // 2. Validate password
//     if (password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 8 characters long.",
//       });
//     }

//     // 3. Normalize email
//     const normalizedEmail = email.trim().toLowerCase();

//     // 4. Check for an existing account
//     const existingUser = await findUserByEmail(normalizedEmail);

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "An account with this email already exists.",
//       });
//     }

//     // 5. Hash the password using the same method as registration
//     const passwordHash = await bcrypt.hash(password, 12);

//     // 6. Create the customer
//     // Do not accept role from req.body.
//     const userId = await createUser({
//       first_name: first_name.trim(),
//       last_name: last_name.trim(),
//       email: normalizedEmail,
//       password_hash: passwordHash,
//       phone: phone?.trim() || null,
//       location: location?.trim() || null,
//     });

//     // 7. Fetch the created user
//     const user = await findUserByEmail(normalizedEmail);

//     if (!user) {
//       return res.status(500).json({
//         success: false,
//         message: "Customer was created but could not be retrieved.",
//       });
//     }

//     // 8. Return safe user details; do not set an authentication cookie
//     return res.status(201).json({
//       success: true,
//       message: "Customer created successfully.",
//       customer: {
//         id: userId,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         status: user.status,
//         created_at: user.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("Create customer error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create customer.",
//     });
//   }
// };


const createCustomer = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      address: addressInput,
    } = req.body;

    // 1. Validate required account fields.
    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone?.trim() || null;

    // 2. Determine whether an address was supplied.
    const addressData =
      addressInput &&
        typeof addressInput === "object" &&
        !Array.isArray(addressInput)
        ? addressInput
        : null;

    const addressFields = addressData
      ? [
        addressData.address,
        addressData.city,
        addressData.state,
        addressData.phone,
        addressData.postal_code,
      ]
      : [];

    const hasAddress = Boolean(
      addressData &&
      (
        addressFields.some(
          (value) =>
            typeof value === "string" &&
            value.trim() !== ""
        ) ||
        addressData.is_default === true
      )
    );

    let preparedAddress = null;

    // const addressPhone = addressData.phone?.trim() || phone?.trim();

    if (hasAddress) {
      const addressPhone =
        addressData.phone?.trim() || normalizedPhone;

      if (
        !addressData.address?.trim() ||
        !addressData.city?.trim() ||
        !addressData.state?.trim() ||
        !addressPhone
      ) {
        return res.status(400).json({
          success: false,
          message:
            "To save a delivery address, provide the street address, city, state and phone number.",
        });
      }

      preparedAddress = {
        first_name:
          addressData.first_name?.trim() ||
          first_name.trim(),

        last_name:
          addressData.last_name?.trim() ||
          last_name.trim(),

        phone: addressPhone,
        address: addressData.address.trim(),
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        country:
          addressData.country?.trim() || "Nigeria",
        postal_code:
          addressData.postal_code?.trim() || null,

        // The customer's first saved address defaults to true.
        is_default: addressData.is_default !== false,
      };
    }

    // 3. Start a transaction.
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // 4. Check for an existing email inside the transaction.
    const [existingUsers] = await connection.query(
      `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 5. Hash the password.
    const passwordHash = await bcrypt.hash(password, 12);

    // 6. Create the customer using the same connection.
    const userId = await createUser(
      {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        phone: normalizedPhone,
        location: null,
      },
      connection
    );

    // 7. Insert the optional delivery address in the same transaction.
    let addressId = null;

    if (preparedAddress) {
      const {
        first_name: addressFirstName,
        last_name: addressLastName,
        phone: addressPhone,
        address: streetAddress,
        city,
        state,
        country,
        postal_code,
        is_default,
      } = preparedAddress;

      const [addressResult] = await connection.query(
        `
                INSERT INTO addresses
                (
                    user_id,
                    first_name,
                    last_name,
                    phone,
                    address,
                    city,
                    state,
                    country,
                    postal_code,
                    is_default
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
        [
          userId,
          addressFirstName,
          addressLastName,
          addressPhone,
          streetAddress,
          city,
          state,
          country,
          postal_code,
          is_default ? 1 : 0,
        ]
      );

      addressId = addressResult.insertId;
    }

    // 8. Retrieve safe customer details.
    const [createdUsers] = await connection.query(
      `
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                status,
                created_at
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
      [userId]
    );

    if (createdUsers.length === 0) {
      throw new Error(
        "Customer was created but could not be retrieved."
      );
    }

    // 9. Commit both inserts together.
    await connection.commit();
    transactionStarted = false;

    // return res.status(201).json({
    //     success: true,
    //     message: "Customer created successfully.",
    //     customer: {
    //         ...createdUsers[0],
    //         address_id: addressId,
    //     },
    // });

    // 10. Send the success response.
    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer: {
        ...createdUsers[0],
        address_id: addressId,
      },
    });

  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }

    // The unique email constraint
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


module.exports = {
  getDashboardStats,
  getCustomers,
  createCustomer,
};