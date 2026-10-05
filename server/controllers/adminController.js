const pool = require("../config/db");

// ============================================================
// GET /api/admin/dashboard
// ============================================================
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

    // --------------------------------------------------------
    // Recent users
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------
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

module.exports = {
  getDashboardStats,
};