const pool = require("../config/db");

const getNotifications = async () => {
    const [rows] = await pool.query(`
        SELECT
            id,
            type,
            title,
            message,
            related_id,
            is_read,
            created_at
        FROM notifications
        ORDER BY created_at DESC, id DESC
        LIMIT 50
    `);

    const [countRows] = await pool.query(`
        SELECT COUNT(*) AS unread_count
        FROM notifications
        WHERE is_read = 0
    `);

    return {
        notifications: rows,
        unreadCount: Number(countRows[0].unread_count),
    };
};

const markNotificationAsRead = async (id) => {
    const [result] = await pool.query(
        `UPDATE notifications SET is_read = 1 WHERE id = ?`,
        [id]
    );

    return result.affectedRows;
};

const markAllNotificationsAsRead = async () => {
    const [result] = await pool.query(
        `UPDATE notifications SET is_read = 1 WHERE is_read = 0`
    );

    return result.affectedRows;
};

const deleteAllNotifications = async () => {
    const [result] = await pool.query(
        `DELETE FROM notifications`
    );

    return result.affectedRows;
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteAllNotifications,
};