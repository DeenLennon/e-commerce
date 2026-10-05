const express = require("express");

const {
  getProductImages,
  uploadProductImage,
  setPrimaryProductImage,
  updateProductImageOrder,
  deleteProductImage,
} = require("../controllers/productImageController");

const {
  uploadProductImage: uploadProductImageMiddleware,
} = require("../middleware/uploadMiddleware");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

router.get(
  "/products/:productId/images",
  getProductImages
);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

/*
 * Upload multiple product images.
 *
 * Frontend field name:
 * images
 *
 * Maximum:
 * 10 images
 */
router.post(
  "/products/:productId/images",
  protect,
  adminOnly,
  uploadProductImageMiddleware.array(
    "images",
    10
  ),
  uploadProductImage
);

router.put(
  "/products/:productId/images/:imageId/primary",
  protect,
  adminOnly,
  setPrimaryProductImage
);

router.put(
  "/products/:productId/images/:imageId/order",
  protect,
  adminOnly,
  updateProductImageOrder
);

router.delete(
  "/products/:productId/images/:imageId",
  protect,
  adminOnly,
  deleteProductImage
);

module.exports = router;