const express = require("express");

const {
  getProducts,
  getProductById,
  getProductBySlug,
  createNewProduct,
  updateExistingProduct,
  deleteExistingProduct,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  uploadProductImage,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// ============================================================
// Public routes
// ============================================================

router.get("/", getProducts);

router.get(
  "/slug/:slug",
  getProductBySlug
);

router.get(
  "/:id",
  getProductById
);

// ============================================================
// Admin routes
// ============================================================

router.post(
  "/",
  protect,
  adminOnly,
  uploadProductImage.array("images", 10),
  createNewProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateExistingProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteExistingProduct
);

module.exports = router;