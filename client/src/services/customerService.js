import api from "./api";

export const getCustomers = async () => {
  const response = await api.get("/admin/customers");
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await api.post(
    "/admin/customers",
    customerData
  );

  return response.data;
};