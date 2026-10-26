import api from "./api";

export const getAdminProfile = async () => {
    const response = await api.get("/admin/settings/profile");
    return response.data;
};

export const updateAdminProfile = async (data) => {
    const response = await api.put(
        "/admin/settings/profile",
        data
    );

    return response.data;
};

export const changeAdminPassword = async (data) => {
    const response = await api.put(
        "/admin/settings/password",
        data
    );

    return response.data;
};
