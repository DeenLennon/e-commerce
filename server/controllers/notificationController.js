const notificationModel = require("../models/notificationModel");

const getNotifications = async (req, res) => {
    try {
        const result = await notificationModel.getNotifications();

        return res.status(200).json({
            success: true,
            data: result.notifications,
            unreadCount: result.unreadCount,
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve notifications.",
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID.",
            });
        }

        const affectedRows =
            await notificationModel.markNotificationAsRead(id);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or already read.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read.",
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notification.",
        });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        await notificationModel.markAllNotificationsAsRead();

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read.",
        });
    } catch (error) {
        console.error("Mark all notifications as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notifications.",
        });
    }
};

const clearNotifications = async (req, res) => {
    try {
        await notificationModel.deleteAllNotifications();

        return res.status(200).json({
            success: true,
            message: "Notifications cleared.",
        });
    } catch (error) {
        console.error("Clear notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to clear notifications.",
        });
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
};