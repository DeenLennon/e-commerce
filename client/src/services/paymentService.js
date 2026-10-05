import api from "./api";

export const initializePayment = async (
    orderId
) => {
    const response = await api.post(
        "/payments/initialize",
        {
            order_id: orderId,
        }
    );

    return response.data;
};

export const verifyPayment = async (
    reference
) => {
    const response = await api.get(
        `/payments/verify/${encodeURIComponent(
            reference
        )}`
    );

    return response.data;
};