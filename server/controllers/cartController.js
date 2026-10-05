const {
    getOrCreateCart,
    getCartItems,
    findCartItem,
    addCartItem,
    updateCartItem,
    updateCartItemPrice,
    removeCartItem,
    clearCart,
    getCartItemCount,
} = require("../models/cartModel");

const pool = require("../config/db");

// ============================================================
// GET CART
// ============================================================
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart =
            await getOrCreateCart(userId);

        const items =
            await getCartItems(cart.id);

        const itemCount =
            await getCartItemCount(cart.id);

        const subtotal = items.reduce(
            (total, item) => {
                return (
                    total +
                    Number(item.price) *
                    Number(item.quantity)
                );
            },
            0
        );

        return res.json({
            success: true,
            cart: {
                id: cart.id,
                user_id: cart.user_id,
                items,
                itemCount,
                subtotal,
            },
        });
    } catch (error) {
        console.error(
            "Get cart error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to retrieve cart",
        });
    }
};

// ============================================================
// ADD ITEM TO CART
// ============================================================
const addItemToCart = async (
    req,
    res
) => {
    try {
        const userId = req.user.id;

        const {
            product_id,
            quantity,
        } = req.body;

        const productId =
            Number(product_id);

        const requestedQuantity =
            Number(quantity || 1);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A valid product ID is required",
            });
        }

        if (
            !Number.isInteger(
                requestedQuantity
            ) ||
            requestedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be a positive integer",
            });
        }

        // ------------------------------------------------------
        // Get product
        // ------------------------------------------------------
        const [products] =
            await pool.query(
                `
                SELECT
                    id,
                    name,
                    sku,
                    price,
                    status,
                    stock_quantity
                FROM products
                WHERE id = ?
                LIMIT 1
                `,
                [productId]
            );

        if (!products.length) {
            return res.status(404).json({
                success: false,
                message:
                    "Product not found",
            });
        }

        const product =
            products[0];

        if (
            product.status !== "active"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This product is not available",
            });
        }

        const stock =
            Number(
                product.stock_quantity
            );

        if (stock <= 0) {
            return res.status(400).json({
                success: false,
                message:
                    "This product is out of stock",
            });
        }

        // ------------------------------------------------------
        // Get/create cart
        // ------------------------------------------------------
        const cart =
            await getOrCreateCart(userId);

        // ------------------------------------------------------
        // Check existing item
        // ------------------------------------------------------
        const existingItem =
            await findCartItem(
                cart.id,
                productId
            );

        const existingQuantity =
            existingItem
                ? Number(
                      existingItem.quantity
                  )
                : 0;

        const newQuantity =
            existingQuantity +
            requestedQuantity;

        if (newQuantity > stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${stock} unit(s) of this product are available`,
            });
        }

        // ------------------------------------------------------
        // Add or update
        // ------------------------------------------------------
        if (existingItem) {
            await updateCartItem(
                cart.id,
                productId,
                newQuantity
            );

            await updateCartItemPrice(
                cart.id,
                productId,
                product.price
            );
        } else {
            await addCartItem({
                cartId: cart.id,
                productId,
                quantity:
                    requestedQuantity,
                price: product.price,
            });
        }

        const items =
            await getCartItems(cart.id);

        const itemCount =
            await getCartItemCount(
                cart.id
            );

        const subtotal = items.reduce(
            (total, item) => {
                return (
                    total +
                    Number(item.price) *
                    Number(item.quantity)
                );
            },
            0
        );

        return res.status(200).json({
            success: true,
            message:
                "Product added to cart",
            cart: {
                id: cart.id,
                user_id: cart.user_id,
                items,
                itemCount,
                subtotal,
            },
        });
    } catch (error) {
        console.error(
            "Add cart item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to add product to cart",
        });
    }
};

// ============================================================
// UPDATE CART ITEM
// ============================================================
const updateItemInCart = async (
    req,
    res
) => {
    try {
        const userId = req.user.id;

        const { productId } =
            req.params;

        const { quantity } =
            req.body;

        const parsedProductId =
            Number(productId);

        const parsedQuantity =
            Number(quantity);

        if (
            !Number.isInteger(
                parsedProductId
            ) ||
            parsedProductId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid product ID",
            });
        }

        if (
            !Number.isInteger(
                parsedQuantity
            ) ||
            parsedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Quantity must be greater than zero",
            });
        }

        const cart =
            await getOrCreateCart(userId);

        const existingItem =
            await findCartItem(
                cart.id,
                parsedProductId
            );

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message:
                    "Product is not in your cart",
            });
        }

        // ------------------------------------------------------
        // Verify current stock
        // ------------------------------------------------------
        const [products] =
            await pool.query(
                `
                SELECT
                    id,
                    price,
                    status,
                    stock_quantity
                FROM products
                WHERE id = ?
                LIMIT 1
                `,
                [parsedProductId]
            );

        if (!products.length) {
            return res.status(404).json({
                success: false,
                message:
                    "Product not found",
            });
        }

        const product =
            products[0];

        if (
            product.status !== "active"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This product is no longer available",
            });
        }

        if (
            parsedQuantity >
            Number(
                product.stock_quantity
            )
        ) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock_quantity} unit(s) are available`,
            });
        }

        await updateCartItem(
            cart.id,
            parsedProductId,
            parsedQuantity
        );

        await updateCartItemPrice(
            cart.id,
            parsedProductId,
            product.price
        );

        const items =
            await getCartItems(cart.id);

        const itemCount =
            await getCartItemCount(
                cart.id
            );

        const subtotal = items.reduce(
            (total, item) => {
                return (
                    total +
                    Number(item.price) *
                    Number(item.quantity)
                );
            },
            0
        );

        return res.json({
            success: true,
            message:
                "Cart item updated",
            cart: {
                id: cart.id,
                user_id: cart.user_id,
                items,
                itemCount,
                subtotal,
            },
        });
    } catch (error) {
        console.error(
            "Update cart item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update cart item",
        });
    }
};

// ============================================================
// REMOVE ITEM FROM CART
// ============================================================
const removeItemFromCart = async (
    req,
    res
) => {
    try {
        const userId = req.user.id;

        const { productId } =
            req.params;

        const parsedProductId =
            Number(productId);

        if (
            !Number.isInteger(
                parsedProductId
            ) ||
            parsedProductId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid product ID",
            });
        }

        const cart =
            await getOrCreateCart(userId);

        const removed =
            await removeCartItem(
                cart.id,
                parsedProductId
            );

        if (!removed) {
            return res.status(404).json({
                success: false,
                message:
                    "Product is not in your cart",
            });
        }

        const items =
            await getCartItems(cart.id);

        const itemCount =
            await getCartItemCount(
                cart.id
            );

        const subtotal = items.reduce(
            (total, item) => {
                return (
                    total +
                    Number(item.price) *
                    Number(item.quantity)
                );
            },
            0
        );

        return res.json({
            success: true,
            message:
                "Product removed from cart",
            cart: {
                id: cart.id,
                user_id: cart.user_id,
                items,
                itemCount,
                subtotal,
            },
        });
    } catch (error) {
        console.error(
            "Remove cart item error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to remove cart item",
        });
    }
};

// ============================================================
// CLEAR CART
// ============================================================
const clearUserCart = async (
    req,
    res
) => {
    try {
        const userId = req.user.id;

        const cart =
            await getOrCreateCart(userId);

        await clearCart(cart.id);

        return res.json({
            success: true,
            message:
                "Cart cleared successfully",
            cart: {
                id: cart.id,
                user_id: cart.user_id,
                items: [],
                itemCount: 0,
                subtotal: 0,
            },
        });
    } catch (error) {
        console.error(
            "Clear cart error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to clear cart",
        });
    }
};

module.exports = {
    getCart,
    addItemToCart,
    updateItemInCart,
    removeItemFromCart,
    clearUserCart,
};