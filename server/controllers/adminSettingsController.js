
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// GET /api/admin/settings/profile
const getAdminProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                status,
                created_at,
                updated_at
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Administrator account not found.",
            });
        }

        if (users[0].role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Administrator access required.",
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0],
        });
    } catch (error) {
        console.error("Get admin profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve administrator profile.",
        });
    }
};


// PUT /api/admin/settings/profile
const updateAdminProfile = async (req, res) => {
    try {
        const { first_name, last_name, email, phone } = req.body;

        if (
            typeof first_name !== "string" ||
            typeof last_name !== "string" ||
            typeof email !== "string" ||
            !first_name.trim() ||
            !last_name.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name and email are required.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Basic email format validation.
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        if (
            first_name.trim().length > 100 ||
            last_name.trim().length > 100 ||
            normalizedEmail.length > 255
        ) {
            return res.status(400).json({
                success: false,
                message: "One or more fields exceed the allowed length.",
            });
        }

        if (
            phone != null &&
            (typeof phone !== "string" || phone.trim().length > 30)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number.",
            });
        }

        // Ensure the email isn't already assigned to another user.
        const [existingUsers] = await pool.query(
            `SELECT id
             FROM users
             WHERE email = ? AND id <> ?
             LIMIT 1`,
            [normalizedEmail, req.user.id]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This email address is already in use.",
            });
        }

        const [result] = await pool.query(
            `UPDATE users
             SET first_name = ?,
                 last_name = ?,
                 email = ?,
                 phone = ?
             WHERE id = ?
               AND role = 'admin'`,
            [
                first_name.trim(),
                last_name.trim(),
                normalizedEmail,
                phone?.trim() || null,
                req.user.id,
            ]
        );

        if (result.affectedRows === 0) {
            const [users] = await pool.query(
                "SELECT id FROM users WHERE id = ? AND role = 'admin'",
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Administrator account not found.",
                });
            }
        }

        const [updatedUsers] = await pool.query(
            `SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                status,
                created_at,
                updated_at
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUsers[0],
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This email address is already in use.",
            });
        }

        console.error("Update admin profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update administrator profile.",
        });
    }
};


// PUT /api/admin/settings/password
const changeAdminPassword = async (req, res) => {
    try {
        const {
            current_password,
            new_password,
            confirm_password,
        } = req.body;

        if (
            typeof current_password !== "string" ||
            typeof new_password !== "string" ||
            typeof confirm_password !== "string" ||
            !current_password ||
            !new_password ||
            !confirm_password
        ) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required.",
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters.",
            });
        }

        if (new_password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "New password exceeds the allowed length.",
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "New password and confirmation do not match.",
            });
        }

        if (current_password === new_password) {
            return res.status(400).json({
                success: false,
                message:
                    "Your new password must differ from your current password.",
            });
        }

        // Always read the password hash from the database.
        const [users] = await pool.query(
            `SELECT id, password_hash, role, status
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [req.user.id]
        );

        if (
            users.length === 0 ||
            users[0].role !== "admin" ||
            users[0].status !== "active"
        ) {
            return res.status(403).json({
                success: false,
                message: "Active administrator account required.",
            });
        }

        const admin = users[0];

        const passwordMatches = await bcrypt.compare(
            current_password,
            admin.password_hash
        );

        if (!passwordMatches) {
            return res.status(400).json({
                success: false,
                message: "Your current password is incorrect.",
            });
        }

        const passwordHash = await bcrypt.hash(new_password, 12);

        await pool.query(
            `UPDATE users
             SET password_hash = ?
             WHERE id = ?
               AND role = 'admin'`,
            [passwordHash, req.user.id]
        );

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please sign in again.",
        });

    } catch (error) {
        console.error("Change admin password error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to change password.",
        });
    }
};


module.exports = {
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword,
};

