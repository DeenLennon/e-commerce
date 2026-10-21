import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

/*

Orders

*/

export const getAdminOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

// Fetch the latest orders for the dashboard
export const getRecentAdminOrders = async (limit = 5) => {
  const response = await api.get(
    `/orders/admin/recent?limit=${limit}`
  );

  return response.data;
};

export const getAdminOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (
  id,
  order_status
) => {
  const response = await api.put(
    `/orders/${id}/status`,
    {
      order_status,
    }
  );

  return response.data;
};

export const updatePaymentStatus = async (
  id,
  payment_status
) => {
  const response = await api.put(
    `/orders/${id}/payment-status`,
    {
      payment_status,
    }
  );

  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(
    `/orders/${id}`
  );

  return response.data;
};