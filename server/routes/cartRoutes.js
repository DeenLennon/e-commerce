const express = require("express");

const {
    getCart,
    addItemToCart,
    updateItemInCart,
    removeItemFromCart,
    clearUserCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get current user's cart
router.get(
    "/",
    protect,
    getCart
);

// Add product to cart
router.post(
    "/items",
    protect,
    addItemToCart
);

// Update product quantity
router.put(
    "/items/:productId",
    protect,
    updateItemInCart
);

// Remove product
router.delete(
    "/items/:productId",
    protect,
    removeItemFromCart
);

// Clear entire cart
router.delete(
    "/",
    protect,
    clearUserCart
);

module.exports = router;