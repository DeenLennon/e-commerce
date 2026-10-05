const pool = require("../config/db");
const productImageModel = require("./productImageModel");

const createProduct = async ({
  category_id,
  name,
  slug,
  sku,
  short_description,
  description,
  price,
  compare_price,
  stock_quantity,
  status,
  is_featured,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO products (
      category_id,
      name,
      slug,
      sku,
      short_description,
      description,
      price,
      compare_price,
      stock_quantity,
      status,
      is_featured
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      category_id,
      name,
      slug,
      sku,
      short_description || null,
      description || null,
      price,
      compare_price || null,
      stock_quantity || 0,
      status || "active",
      is_featured || false,
    ]
  );

  return result.insertId;
};

const getProducts = async ({
  page = 1,
  limit = 12,
  search = "",
  category = "",
  minPrice = "",
  maxPrice = "",
  sort = "latest",
} = {}) => {
  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 12, 1),
    50
  );

  const offset =
    (safePage - 1) * safeLimit;

  const conditions = [];
  const values = [];

  /*
   * Only return active products to customers.
   */

  conditions.push(
    `p.status = 'active'`
  );

  /*
   * Search
   */

  if (search.trim()) {
    conditions.push(`
            (
                p.name LIKE ?
                OR p.sku LIKE ?
                OR p.short_description LIKE ?
                OR p.description LIKE ?
            )
        `);

    const searchValue = `%${search.trim()}%`;

    values.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue
    );
  }

  /*
   * Category
   *
   * Supports either category ID or slug.
   */

  if (category) {
    if (/^\d+$/.test(String(category))) {
      conditions.push(
        `p.category_id = ?`
      );

      values.push(Number(category));
    } else {
      conditions.push(
        `c.slug = ?`
      );

      values.push(category);
    }
  }

  /*
   * Minimum price
   */

  if (minPrice !== "") {
    conditions.push(
      `p.price >= ?`
    );

    values.push(Number(minPrice));
  }

  /*
   * Maximum price
   */

  if (maxPrice !== "") {
    conditions.push(
      `p.price <= ?`
    );

    values.push(Number(maxPrice));
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  /*
   * Sorting
   *
   * Only allow known values.
   * Never directly insert user-provided
   * sort strings into SQL.
   */

  let orderBy = `
        p.created_at DESC,
        p.id DESC
    `;

  switch (sort) {
    case "price_asc":
      orderBy = `
                p.price ASC,
                p.id DESC
            `;
      break;

    case "price_desc":
      orderBy = `
                p.price DESC,
                p.id DESC
            `;
      break;

    case "name_asc":
      orderBy = `
                p.name ASC,
                p.id DESC
            `;
      break;

    case "popular":
      orderBy = `
                p.views_count DESC,
                p.id DESC
            `;
      break;

    case "latest":
    default:
      orderBy = `
                p.created_at DESC,
                p.id DESC
            `;
      break;
  }

  /*
   * Products
   */

  const [products] = await pool.query(
    `
        SELECT
            p.id,
            p.category_id,
            p.name,
            p.slug,
            p.sku,
            p.short_description,
            p.description,
            p.price,
            p.compare_price,
            p.stock_quantity,
            p.status,
            p.is_featured,
            p.views_count,
            p.created_at,
            p.updated_at,

            c.name AS category_name,
            c.slug AS category_slug,

            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY
                    pi.is_primary DESC,
                    pi.sort_order ASC,
                    pi.id ASC
                LIMIT 1
            ) AS image_url

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.id

        ${whereClause}

        ORDER BY ${orderBy}

        LIMIT ?
        OFFSET ?
        `,
    [
      ...values,
      safeLimit,
      offset,
    ]
  );

  /*
   * Total matching products
   */

  const [countRows] = await pool.query(
    `
        SELECT COUNT(*) AS total

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.id

        ${whereClause}
        `,
    values
  );

  const total =
    Number(countRows[0]?.total) || 0;

  const totalPages =
    Math.ceil(total / safeLimit);

  return {
    products,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage:
        safePage < totalPages,
      hasPreviousPage:
        safePage > 1,
    },
  };
};

const findProductById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.category_id,
      p.name,
      p.slug,
      p.sku,
      p.short_description,
      p.description,
      p.price,
      p.compare_price,
      p.stock_quantity,
      p.status,
      p.is_featured,
      p.views_count,
      p.created_at,
      p.updated_at,

      c.name AS category_name,
      c.slug AS category_slug

    FROM products p

    INNER JOIN categories c
      ON p.category_id = c.id

    WHERE p.id = ?

    LIMIT 1
    `,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  const product = rows[0];

  product.images = await productImageModel.getImagesByProductId(
    product.id
  );

  return product;
};

const findProductBySlug = async (slug) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.category_id,
      p.name,
      p.slug,
      p.sku,
      p.short_description,
      p.description,
      p.price,
      p.compare_price,
      p.stock_quantity,
      p.status,
      p.is_featured,
      p.views_count,
      p.created_at,
      p.updated_at,

      c.name AS category_name,
      c.slug AS category_slug

    FROM products p

    INNER JOIN categories c
      ON p.category_id = c.id

    WHERE p.slug = ?

    LIMIT 1
    `,
    [slug]
  );

  if (!rows[0]) {
    return null;
  }

  const product = rows[0];

  product.images =
    await productImageModel.getImagesByProductId(
      product.id
    );

  return product;
};

const findProductBySku = async (sku) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      category_id,
      name,
      slug,
      sku,
      short_description,
      description,
      price,
      compare_price,
      stock_quantity,
      status,
      is_featured,
      views_count,
      created_at,
      updated_at
    FROM products
    WHERE sku = ?
    LIMIT 1
    `,
    [sku]
  );

  if (!rows[0]) {
    return null;
  }

  const product = rows[0];

  product.images = await productImageModel.getImagesByProductId(
    product.id
  );

  return product;
};

const getAllProducts = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.category_id,
      p.name,
      p.slug,
      p.sku,
      p.short_description,
      p.description,
      p.price,
      p.compare_price,
      p.stock_quantity,
      p.status,
      p.is_featured,
      p.views_count,
      p.created_at,
      p.updated_at,

      c.name AS category_name,
      c.slug AS category_slug

    FROM products p

    INNER JOIN categories c
      ON p.category_id = c.id

    ORDER BY p.created_at DESC
    `
  );

  for (const product of rows) {
    product.images = await productImageModel.getImagesByProductId(
      product.id
    );
  }

  return rows;
};

const updateProduct = async (
  id,
  {
    category_id,
    name,
    slug,
    sku,
    short_description,
    description,
    price,
    compare_price,
    stock_quantity,
    status,
    is_featured,
  }
) => {
  const [result] = await pool.query(
    `
    UPDATE products
    SET
      category_id = ?,
      name = ?,
      slug = ?,
      sku = ?,
      short_description = ?,
      description = ?,
      price = ?,
      compare_price = ?,
      stock_quantity = ?,
      status = ?,
      is_featured = ?
    WHERE id = ?
    `,
    [
      category_id,
      name,
      slug,
      sku,
      short_description || null,
      description || null,
      price,
      compare_price || null,
      stock_quantity,
      status,
      is_featured || false,
      id,
    ]
  );

  return result.affectedRows;
};

const deleteProduct = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM products
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows;
};

module.exports = {
  createProduct,
  findProductById,
  findProductBySlug,
  findProductBySku,
  getProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
};