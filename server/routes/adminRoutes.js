// const express = require("express");

// const { protect } = require("../middleware/authMiddleware");
// const { adminOnly } = require("../middleware/adminMiddleware");

// const router = express.Router();

// router.get("/test", protect, adminOnly, (req, res) => {
//   res.json({
//     success: true,
//     message: "Admin authorization successful",
//     user: {
//       id: req.user.id,
//       email: req.user.email,
//       role: req.user.role,
//     },
//   });
// });

// module.exports = router;

const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// ============================================================
// GET /api/admin/dashboard
// ============================================================
router.get(
  "/dashboard",
  protect,
  adminOnly,
  getDashboardStats
);

// ============================================================
// GET /api/admin/test
// ============================================================
router.get(
  "/test",
  protect,
  adminOnly,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin authorization successful",
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

module.exports = router;