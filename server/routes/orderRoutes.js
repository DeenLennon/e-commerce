const express = require("express");

const {
  createNewOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  getOrderByOrderNumber,
  changeOrderStatus,
  changePaymentStatus,
  removeOrder,
  getOrderStats,
  getRecentOrderList,
  createCheckoutOrder,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/statistics",
  protect,
  adminOnly,
  getOrderStats
);

router.get(
  "/admin/recent",
  protect,
  adminOnly,
  getRecentOrderList
);

router.get(
  "/",
  protect,
  adminOnly,
  getOrders
);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  changeOrderStatus
);

router.put(
  "/:id/payment-status",
  protect,
  adminOnly,
  changePaymentStatus
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  removeOrder
);

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/checkout",
    protect,
    createCheckoutOrder
);

router.post(
  "/",
  protect,
  createNewOrder
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

router.get(
  "/number/:orderNumber",
  protect,
  getOrderByOrderNumber
);

router.get(
  "/:id",
  protect,
  getOrderById
);

module.exports = router;