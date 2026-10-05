const jwt = require("jsonwebtoken");

const { findUserById } = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find current user
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    // Check account status
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}`,
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = {
  protect,
};