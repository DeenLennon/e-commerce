const pool = require("../config/db");

const createCategory = async ({
  name,
  slug,
  description,
  image_url,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO categories
      (name, slug, description, image_url)
    VALUES (?, ?, ?, ?)
    `,
    [
      name,
      slug,
      description || null,
      image_url || null,
    ]
  );

  return result.insertId;
};

const findCategoryById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      description,
      image_url,
      status,
      created_at,
      updated_at
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const findCategoryBySlug = async (slug) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      description,
      image_url,
      status,
      created_at,
      updated_at
    FROM categories
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
};

const findCategoryByName = async (name) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      description,
      image_url,
      status
    FROM categories
    WHERE name = ?
    LIMIT 1
    `,
    [name]
  );

  return rows[0] || null;
};

// const getAllCategories = async () => {
//   const [rows] = await pool.query(
//     `
//     SELECT
//       id,
//       name,
//       slug,
//       description,
//       image_url,
//       status,
//       created_at,
//       updated_at
//     FROM categories
//     ORDER BY name ASC
//     `
//   );

//   return rows;
// };

const getAllCategories = async () => {
    const [rows] = await pool.query(`
        SELECT
            c.id,
            c.name,
            c.slug,
            c.description,
            c.image_url,
            c.status,
            c.created_at,
            c.updated_at,

            (
                SELECT COUNT(*)
                FROM products p
                WHERE p.category_id = c.id
            ) AS product_count,

            (
                SELECT pi.image_url
                FROM products p
                INNER JOIN product_images pi
                    ON pi.product_id = p.id
                WHERE p.category_id = c.id
                ORDER BY
                    p.created_at DESC,
                    p.id DESC,
                    pi.is_primary DESC,
                    pi.sort_order ASC,
                    pi.id ASC
                LIMIT 1
            ) AS latest_product_image

        FROM categories c
        ORDER BY c.name ASC
    `);

    return rows;
};

const updateCategory = async (
  id,
  { name, slug, description, image_url, status }
) => {
  const [result] = await pool.query(
    `
    UPDATE categories
    SET
      name = ?,
      slug = ?,
      description = ?,
      image_url = ?,
      status = ?
    WHERE id = ?
    `,
    [
      name,
      slug,
      description || null,
      image_url || null,
      status || "active",
      id,
    ]
  );

  return result.affectedRows;
};

const deleteCategory = async (id) => {
  const [result] = await pool.query(
    `
    DELETE FROM categories
    WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows;
};


module.exports = {
  createCategory,
  findCategoryById,
  findCategoryBySlug,
  findCategoryByName,
  getAllCategories,
  updateCategory,
  deleteCategory,
};