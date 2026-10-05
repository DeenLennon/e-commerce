const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS database_connected");

    res.json({
      success: true,
      message: "Database connection successful",
      data: rows[0],
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

module.exports = router;