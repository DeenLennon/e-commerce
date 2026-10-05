import api from "./api";

export const getAdminOrders = async () => {
    const response = await api.get("/orders");
    return response.data;
};

export const getAdminOrderStats = async () => {
    const response = await api.get("/orders/admin/statistics");
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.put(
        `/orders/${id}/status`,
        { status }
    );

    return response.data;
};

export const updatePaymentStatus = async (
    id,
    paymentStatus
) => {
    const response = await api.put(
        `/orders/${id}/payment-status`,
        { paymentStatus }
    );

    return response.data;
};

export const getOrderById = async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
};

export const createCheckoutOrder = async (
    addressId
) => {
    const response = await api.post(
        "/orders/checkout",
        {
            address_id: addressId,
        }
    );

    return response.data;
};