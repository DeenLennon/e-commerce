const express = require("express");

const {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createNewCategory,
  updateExistingCategory,
  deleteExistingCategory,
} = require("../controllers/categoryController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");


const router = express.Router();

router.get("/", getCategories);

router.get("/slug/:slug", getCategoryBySlug);

router.get("/:id", getCategoryById);

// Admin
router.post(
  "/",
  protect,
  adminOnly,
  createNewCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateExistingCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteExistingCategory
);

module.exports = router;