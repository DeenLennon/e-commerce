import api from "./api";

// ============================================================
// GET CURRENT USER CART
// ============================================================
export const getCart = async () => {
    const response = await api.get("/cart");

    return response.data;
};

// ============================================================
// ADD PRODUCT TO CART
// ============================================================
export const addToCart = async (
    productId,
    quantity = 1
) => {
    const response = await api.post(
        "/cart/items",
        {
            product_id: productId,
            quantity,
        }
    );

    return response.data;
};

// ============================================================
// UPDATE CART ITEM QUANTITY
// ============================================================
export const updateCartItem = async (
    productId,
    quantity
) => {
    const response = await api.put(
        `/cart/items/${productId}`,
        {
            quantity,
        }
    );

    return response.data;
};

// ============================================================
// REMOVE CART ITEM
// ============================================================
export const removeFromCart = async (
    productId
) => {
    const response = await api.delete(
        `/cart/items/${productId}`
    );

    return response.data;
};

// ============================================================
// CLEAR CART
// ============================================================
export const clearCart = async () => {
    const response = await api.delete(
        "/cart"
    );

    return response.data;
};