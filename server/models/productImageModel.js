const db = require("../config/db");

// Get all images belonging to a product
const getImagesByProductId = async (productId) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      product_id,
      image_url,
      public_id,
      is_primary,
      sort_order,
      created_at
    FROM product_images
    WHERE product_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [productId]
  );

  return rows;
};

// Get a single product image
const getImageById = async (imageId) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      product_id,
      image_url,
      public_id,
      is_primary,
      sort_order,
      created_at
    FROM product_images
    WHERE id = ?
    LIMIT 1
    `,
    [imageId]
  );

  return rows[0] || null;
};

// Add a product image
const createImage = async ({
  productId,
  imageUrl,
  publicId = null,
  isPrimary = false,
  sortOrder = 0,
}) => {
  const [result] = await db.query(
    `
    INSERT INTO product_images
      (
        product_id,
        image_url,
        public_id,
        is_primary,
        sort_order
      )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      productId,
      imageUrl,
      publicId,
      isPrimary ? 1 : 0,
      sortOrder,
    ]
  );

  return getImageById(result.insertId);
};

// Set an image as the primary image
const setPrimaryImage = async (imageId, productId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Remove primary status from all images belonging
    // to this product.
    await connection.query(
      `
      UPDATE product_images
      SET is_primary = 0
      WHERE product_id = ?
      `,
      [productId]
    );

    // Set the selected image as primary.
    const [result] = await connection.query(
      `
      UPDATE product_images
      SET is_primary = 1
      WHERE id = ?
        AND product_id = ?
      `,
      [imageId, productId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Product image not found");
    }

    await connection.commit();

    return getImageById(imageId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Update image sort order
const updateSortOrder = async (imageId, productId, sortOrder) => {
  const [result] = await db.query(
    `
    UPDATE product_images
    SET sort_order = ?
    WHERE id = ?
      AND product_id = ?
    `,
    [sortOrder, imageId, productId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getImageById(imageId);
};

// Delete a product image
const deleteImage = async (imageId, productId) => {
  const [result] = await db.query(
    `
    DELETE FROM product_images
    WHERE id = ?
      AND product_id = ?
    `,
    [imageId, productId]
  );

  return result.affectedRows > 0;
};

module.exports = {
  getImagesByProductId,
  getImageById,
  createImage,
  setPrimaryImage,
  updateSortOrder,
  deleteImage,
};