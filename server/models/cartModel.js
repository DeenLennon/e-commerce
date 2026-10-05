const pool = require("../config/db");

// ============================================================
// FIND CART BY USER ID
// ============================================================
const findCartByUserId = async (userId) => {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            user_id,
            created_at,
            updated_at
        FROM carts
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
    );

    return rows[0] || null;
};

// ============================================================
// CREATE CART
// ============================================================
const createCart = async (userId) => {
    const [result] = await pool.query(
        `
        INSERT INTO carts (user_id)
        VALUES (?)
        `,
        [userId]
    );

    return result.insertId;
};

// ============================================================
// GET OR CREATE CART
// ============================================================
const getOrCreateCart = async (userId) => {
    let cart = await findCartByUserId(userId);

    if (!cart) {
        const cartId = await createCart(userId);

        cart = {
            id: cartId,
            user_id: userId,
        };
    }

    return cart;
};

// ============================================================
// GET CART ITEMS
// ============================================================
// const getCartItems = async (cartId) => {
//     const [rows] = await pool.query(
//         `
//         SELECT
//             ci.id,
//             ci.cart_id,
//             ci.product_id,
//             ci.quantity,
//             ci.price,
//             ci.created_at,
//             ci.updated_at,

//             p.name,
//             p.slug,
//             p.sku,
//             p.short_description,
//             p.status,
//             p.stock_quantity,

//             c.name AS category_name

//         FROM cart_items ci

//         INNER JOIN products p
//             ON ci.product_id = p.id

//         LEFT JOIN categories c
//             ON p.category_id = c.id

//         WHERE ci.cart_id = ?

//         ORDER BY ci.created_at DESC
//         `,
//         [cartId]
//     );

//     return rows;
// };

// ============================================================
// GET CART ITEMS
// ============================================================
const getCartItems = async (cartId) => {
    const [rows] = await pool.query(
        `
        SELECT
            ci.id,
            ci.cart_id,
            ci.product_id,
            ci.quantity,
            ci.price,
            ci.created_at,
            ci.updated_at,

            p.name,
            p.slug,
            p.sku,
            p.short_description,
            p.status,
            p.stock_quantity,

            c.name AS category_name,

            (
                SELECT pi.image_url
                FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY
                    pi.is_primary DESC,
                    pi.sort_order ASC,
                    pi.id ASC
                LIMIT 1
            ) AS image_url

        FROM cart_items ci

        INNER JOIN products p
            ON ci.product_id = p.id

        LEFT JOIN categories c
            ON p.category_id = c.id

        WHERE ci.cart_id = ?

        ORDER BY ci.created_at DESC
        `,
        [cartId]
    );

    return rows;
};

// ============================================================
// FIND CART ITEM
// ============================================================
const findCartItem = async (
    cartId,
    productId
) => {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            cart_id,
            product_id,
            quantity,
            price,
            created_at,
            updated_at
        FROM cart_items
        WHERE cart_id = ?
        AND product_id = ?
        LIMIT 1
        `,
        [cartId, productId]
    );

    return rows[0] || null;
};

// ============================================================
// ADD CART ITEM
// ============================================================
const addCartItem = async ({
    cartId,
    productId,
    quantity,
    price,
}) => {
    const [result] = await pool.query(
        `
        INSERT INTO cart_items (
            cart_id,
            product_id,
            quantity,
            price
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            cartId,
            productId,
            quantity,
            price,
        ]
    );

    return result.insertId;
};

// ============================================================
// UPDATE CART ITEM
// ============================================================
const updateCartItem = async (
    cartId,
    productId,
    quantity
) => {
    const [result] = await pool.query(
        `
        UPDATE cart_items
        SET quantity = ?
        WHERE cart_id = ?
        AND product_id = ?
        `,
        [
            quantity,
            cartId,
            productId,
        ]
    );

    return result.affectedRows > 0;
};

// ============================================================
// UPDATE CART ITEM PRICE
// ============================================================
const updateCartItemPrice = async (
    cartId,
    productId,
    price
) => {
    const [result] = await pool.query(
        `
        UPDATE cart_items
        SET price = ?
        WHERE cart_id = ?
        AND product_id = ?
        `,
        [
            price,
            cartId,
            productId,
        ]
    );

    return result.affectedRows > 0;
};

// ============================================================
// REMOVE CART ITEM
// ============================================================
const removeCartItem = async (
    cartId,
    productId
) => {
    const [result] = await pool.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        AND product_id = ?
        `,
        [cartId, productId]
    );

    return result.affectedRows > 0;
};

// ============================================================
// CLEAR CART
// ============================================================
const clearCart = async (cartId) => {
    const [result] = await pool.query(
        `
        DELETE FROM cart_items
        WHERE cart_id = ?
        `,
        [cartId]
    );

    return result.affectedRows;
};

// ============================================================
// CART ITEM COUNT
// ============================================================
const getCartItemCount = async (cartId) => {
    const [rows] = await pool.query(
        `
        SELECT
            COALESCE(
                SUM(quantity),
                0
            ) AS item_count
        FROM cart_items
        WHERE cart_id = ?
        `,
        [cartId]
    );

    return Number(rows[0]?.item_count || 0);
};

module.exports = {
    findCartByUserId,
    createCart,
    getOrCreateCart,
    getCartItems,
    findCartItem,
    addCartItem,
    updateCartItem,
    updateCartItemPrice,
    removeCartItem,
    clearCart,
    getCartItemCount,
};