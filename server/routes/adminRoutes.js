const express = require("express");

const {
  getDashboardStats,
  getCustomers,
  createCustomer,
} = require("../controllers/adminController");

const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// GET /api/admin/dashboard
router.get("/dashboard", protect, adminOnly, getDashboardStats);

// GET /api/admin/customers
router.get("/customers", protect, adminOnly, getCustomers);

router.post("/customers", protect, adminOnly, createCustomer);

// GET /api/admin/notifications
router.get(
    "/notifications",
    protect,
    adminOnly,
    getNotifications
);

// PATCH /api/admin/notifications/read-all
router.patch(
    "/notifications/read-all",
    protect,
    adminOnly,
    markAllNotificationsAsRead
);

// PATCH /api/admin/notifications/:id/read
router.patch(
    "/notifications/:id/read",
    protect,
    adminOnly,
    markNotificationAsRead
);

// DELETE /api/admin/notifications
router.delete(
    "/notifications",
    protect,
    adminOnly,
    clearNotifications
);

// GET /api/admin/test
router.get("/test", protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Admin authorization successful",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;