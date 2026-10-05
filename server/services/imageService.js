const fs = require("fs");
const path = require("path");

const productImageModel = require("../models/productImageModel");

const createProductImage = async ({
  productId,
  file,
  isPrimary = false,
  sortOrder = 0,
}) => {
  if (!file) {
    throw new Error("Image file is required");
  }

  const imageUrl = `/uploads/products/${file.filename}`;

  const image = await productImageModel.createImage({
    productId,
    imageUrl,
    publicId: null,
    isPrimary,
    sortOrder,
  });

  return image;
};

const deleteProductImage = async (image) => {
  if (!image) {
    throw new Error("Product image not found");
  }

  // Delete the physical local file
  if (image.image_url) {
    const relativePath = image.image_url.replace(/^\/uploads\//, "");

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      relativePath
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Delete database record
  const deleted = await productImageModel.deleteImage(
    image.id,
    image.product_id
  );

  return deleted;
};

module.exports = {
  createProductImage,
  deleteProductImage,
};