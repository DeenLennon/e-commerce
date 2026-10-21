import api from "./api";

export const getNotifications = async () => {
    const response = await api.get("/admin/notifications");
    return response.data;
};

export const markNotificationAsRead = async (id) => {
    const response = await api.patch(
        `/admin/notifications/${id}/read`
    );

    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.patch(
        "/admin/notifications/read-all"
    );

    return response.data;
};

export const clearNotifications = async () => {
    const response = await api.delete("/admin/notifications");
    return response.data;
};