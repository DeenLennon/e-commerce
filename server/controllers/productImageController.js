const productImageModel = require("../models/productImageModel");
const productModel = require("../models/productModel");
const imageService = require("../services/imageService");

const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productModel.findProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const images =
      await productImageModel.getImagesByProductId(productId);

    return res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get product images error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product images",
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    const { productId } = req.params;

    const product =
      await productModel.findProductById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate uploaded files
    |--------------------------------------------------------------------------
    */

    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one image file is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get existing images
    |--------------------------------------------------------------------------
    */

    const existingImages =
      await productImageModel.getImagesByProductId(
        productId
      );

    /*
    |--------------------------------------------------------------------------
    | Maximum 10 images per product
    |--------------------------------------------------------------------------
    */

    if (
      existingImages.length +
        req.files.length >
      10
    ) {
      /*
       * Clean up files Multer already saved.
       */
      const fs = require("fs");
      const path = require("path");

      for (const file of req.files) {
        try {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "products",
            file.filename
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(
            "Uploaded file cleanup error:",
            cleanupError
          );
        }
      }

      return res.status(400).json({
        success: false,
        message:
          "A product can have a maximum of 10 images.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Determine primary image
    |--------------------------------------------------------------------------
    |
    | If the product has no existing images,
    | the first uploaded image becomes primary.
    |
    | Otherwise all newly uploaded images remain
    | non-primary.
    |
    */

    const hasExistingPrimary =
      existingImages.some(
        (image) =>
          Number(image.is_primary) === 1
      );

    /*
    |--------------------------------------------------------------------------
    | Create database records
    |--------------------------------------------------------------------------
    */

    const createdImages = [];

    for (
      let index = 0;
      index < req.files.length;
      index++
    ) {
      const file = req.files[index];

      const isPrimary =
        !hasExistingPrimary &&
        existingImages.length === 0 &&
        index === 0;

      const sortOrder =
        existingImages.length + index;

      const image =
        await imageService.createProductImage({
          productId,
          file,
          isPrimary,
          sortOrder,
        });

      createdImages.push(image);
    }

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message:
        "Product images uploaded successfully",
      data: createdImages,
    });
  } catch (error) {
    console.error(
      "Upload product images error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Clean up files if database operation fails
    |--------------------------------------------------------------------------
    */

    if (
      req.files &&
      req.files.length > 0
    ) {
      const fs = require("fs");
      const path = require("path");

      for (const file of req.files) {
        try {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "products",
            file.filename
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(
            "Uploaded file cleanup error:",
            cleanupError
          );
        }
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload product images",
    });
  }
};

const setPrimaryProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image =
      await productImageModel.getImageById(imageId);

    if (!image || image.product_id !== Number(productId)) {
      return res.status(404).json({
        success: false,
        message: "Product image not found",
      });
    }

    const updatedImage =
      await productImageModel.setPrimaryImage(
        imageId,
        productId
      );

    return res.status(200).json({
      success: true,
      message: "Primary image updated successfully",
      data: updatedImage,
    });
  } catch (error) {
    console.error("Set primary image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set primary image",
    });
  }
};

const updateProductImageOrder = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const { sort_order } = req.body;

    if (
      sort_order === undefined ||
      !Number.isInteger(Number(sort_order)) ||
      Number(sort_order) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "sort_order must be a non-negative integer",
      });
    }

    const image =
      await productImageModel.getImageById(imageId);

    if (!image || image.product_id !== Number(productId)) {
      return res.status(404).json({
        success: false,
        message: "Product image not found",
      });
    }

    const updatedImage =
      await productImageModel.updateSortOrder(
        imageId,
        productId,
        Number(sort_order)
      );

    return res.status(200).json({
      success: true,
      message: "Image order updated successfully",
      data: updatedImage,
    });
  } catch (error) {
    console.error("Update image order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update image order",
    });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image =
      await productImageModel.getImageById(imageId);

    if (!image || image.product_id !== Number(productId)) {
      return res.status(404).json({
        success: false,
        message: "Product image not found",
      });
    }

    await imageService.deleteProductImage(image);

    return res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
    });
  } catch (error) {
    console.error("Delete product image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product image",
    });
  }
};

module.exports = {
  getProductImages,
  uploadProductImage,
  setPrimaryProductImage,
  updateProductImageOrder,
  deleteProductImage,
};