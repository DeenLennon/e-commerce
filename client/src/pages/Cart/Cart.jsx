import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    FiArrowLeft,
    FiMinus,
    FiPlus,
    FiShoppingBag,
    FiTrash2,
    FiRefreshCw,
    FiCreditCard,
} from "react-icons/fi";

import {
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../../services/cartService";

import { getImageUrl } from "../../utils/imageUrl";

import { useNavigate } from "react-router-dom";

import "./Cart.scss";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};

const Cart = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: [],
        itemCount: 0,
        subtotal: 0,
    });

    const [loading, setLoading] =
        useState(true);

    const [updatingProductId, setUpdatingProductId] =
        useState(null);

    const [removingProductId, setRemovingProductId] =
        useState(null);

    const [clearing, setClearing] =
        useState(false);

    const [error, setError] =
        useState("");

    // LOAD CART

    const loadCart = useCallback(
        async () => {
            try {
                setError("");

                const response =
                    await getCart();

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                        "Failed to load cart"
                    );
                }

                setCart(
                    response.cart || {
                        items: [],
                        itemCount: 0,
                        subtotal: 0,
                    }
                );
            } catch (err) {
                console.error(
                    "Load cart error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load cart"
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    // UPDATE QUANTITY
    
    const handleQuantityChange = async (
        productId,
        currentQuantity,
        change
    ) => {
        const newQuantity =
            currentQuantity + change;

        if (newQuantity < 1) {
            return;
        }

        try {
            setError("");

            setUpdatingProductId(
                productId
            );

            const response =
                await updateCartItem(
                    productId,
                    newQuantity
                );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to update cart"
                );
            }

            setCart(response.cart);
        } catch (err) {
            console.error(
                "Update cart error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update cart"
            );
        } finally {
            setUpdatingProductId(null);
        }
    };

    // REMOVE ITEM
    
    const handleRemove = async (
        productId
    ) => {
        try {
            setError("");

            setRemovingProductId(
                productId
            );

            const response =
                await removeFromCart(
                    productId
                );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to remove item"
                );
            }

            setCart(response.cart);
        } catch (err) {
            console.error(
                "Remove cart item error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to remove item"
            );
        } finally {
            setRemovingProductId(null);
        }
    };

    // CLEAR CART
    
    const handleClearCart = async () => {
        if (!cart.items?.length) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to remove all items from your cart?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setClearing(true);

            const response =
                await clearCart();

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to clear cart"
                );
            }

            setCart(response.cart);
        } catch (err) {
            console.error(
                "Clear cart error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to clear cart"
            );
        } finally {
            setClearing(false);
        }
    };

    // CHECKOUT
    
    const handleCheckout = () => {
        if (!cart.items?.length) {
            return;
        }

        navigate("/checkout");
    };

    // LOADING
    
    if (loading) {
        return (
            <main className="cart-page">
                <div className="cart-loading">
                    <FiRefreshCw
                        className="spinning"
                    />

                    <p>
                        Loading your cart...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="cart-container">

                {/* HEADER */}
                <div className="cart-header">
                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        <FiArrowLeft />

                        <span>
                            Continue Shopping
                        </span>
                    </button>

                    <div className="cart-title">
                        <div className="cart-title-icon">
                            <FiShoppingBag />
                        </div>

                        <div>
                            <h1>
                                Shopping Cart
                            </h1>

                            <p>
                                {cart.itemCount}{" "}
                                {cart.itemCount ===
                                    1
                                    ? "item"
                                    : "items"}{" "}
                                in your cart
                            </p>
                        </div>
                    </div>

                    {cart.items?.length > 0 && (
                        <button
                            type="button"
                            className="clear-cart-button"
                            onClick={
                                handleClearCart
                            }
                            disabled={clearing}
                        >
                            <FiTrash2 />

                            {clearing
                                ? "Clearing..."
                                : "Clear Cart"}
                        </button>
                    )}
                </div>

                {/* ERROR */}
                {error && (
                    <div className="cart-error">
                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={loadCart}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* EMPTY CART */}
                {!cart.items?.length ? (
                    <section className="empty-cart">
                        <div className="empty-cart-icon">
                            <FiShoppingBag />
                        </div>

                        <h2>
                            Your cart is empty
                        </h2>

                        <p>
                            You haven't added
                            anything to your cart
                            yet.
                        </p>

                        <button
                            type="button"
                            className="shop-button"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        >
                            Start Shopping
                        </button>
                    </section>
                ) : (
                    /* CART CONTENT */
                    <div className="cart-layout">

                        {/* CART ITEMS */}
                        <section className="cart-items-section">

                            <div className="section-heading">
                                <h2>
                                    Cart Items
                                </h2>

                                <span>
                                    {
                                        cart.items
                                            .length
                                    }{" "}
                                    product
                                    {cart.items
                                        .length !==
                                        1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>

                            <div className="cart-items">

                                {cart.items.map(
                                    (item) => {
                                        const isUpdating =
                                            updatingProductId ===
                                            item.product_id;

                                        const isRemoving =
                                            removingProductId ===
                                            item.product_id;

                                        const itemSubtotal =
                                            Number(
                                                item.price
                                            ) *
                                            Number(
                                                item.quantity
                                            );

                                        return (
                                            <article
                                                className="cart-item"
                                                key={
                                                    item.id
                                                }
                                            >

                                                {/* IMAGE */}
                                                <div className="cart-item-image">
                                                    {item.image_url ? (
                                                        <img
                                                            src={getImageUrl(item.image_url)}
                                                            alt={item.name}
                                                        />
                                                    ) : (
                                                        <div className="cart-item-image-placeholder">
                                                            <FiShoppingBag />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* INFO */}
                                                <div className="cart-item-info">

                                                    <span className="cart-item-category">
                                                        {
                                                            item.category_name
                                                        }
                                                    </span>

                                                    <h3>
                                                        {
                                                            item.name
                                                        }
                                                    </h3>

                                                    <p className="cart-item-sku">
                                                        SKU:{" "}
                                                        {
                                                            item.sku
                                                        }
                                                    </p>

                                                    <p className="cart-item-price">
                                                        {formatCurrency(
                                                            item.price
                                                        )}
                                                    </p>
                                                </div>

                                                {/* QUANTITY */}
                                                <div className="cart-item-quantity">

                                                    <span>
                                                        Quantity
                                                    </span>

                                                    <div className="quantity-control">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.product_id,
                                                                    Number(
                                                                        item.quantity
                                                                    ),
                                                                    -1
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating ||
                                                                Number(
                                                                    item.quantity
                                                                ) <=
                                                                1
                                                            }
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <FiMinus />
                                                        </button>

                                                        <strong>
                                                            {
                                                                item.quantity
                                                            }
                                                        </strong>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item.product_id,
                                                                    Number(
                                                                        item.quantity
                                                                    ),
                                                                    1
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating ||
                                                                Number(
                                                                    item.quantity
                                                                ) >=
                                                                Number(
                                                                    item.stock_quantity
                                                                )
                                                            }
                                                            aria-label="Increase quantity"
                                                        >
                                                            <FiPlus />
                                                        </button>

                                                    </div>
                                                </div>

                                                {/* SUBTOTAL */}
                                                <div className="cart-item-total">

                                                    <span>
                                                        Total
                                                    </span>

                                                    <strong>
                                                        {formatCurrency(
                                                            itemSubtotal
                                                        )}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className="remove-item-button"
                                                        onClick={() =>
                                                            handleRemove(
                                                                item.product_id
                                                            )
                                                        }
                                                        disabled={
                                                            isRemoving
                                                        }
                                                    >
                                                        <FiTrash2 />

                                                        {isRemoving
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </button>

                                                </div>

                                            </article>
                                        );
                                    }
                                )}

                            </div>
                        </section>

                        {/* SUMMARY */}
                        <aside className="cart-summary">

                            <div className="summary-header">
                                <h2>
                                    Order Summary
                                </h2>
                            </div>

                            <div className="summary-content">

                                <div className="summary-row">
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            cart.subtotal
                                        )}
                                    </strong>
                                </div>

                                <div className="summary-row">
                                    <span>
                                        Shipping
                                    </span>

                                    <strong>
                                        Calculated at
                                        checkout
                                    </strong>
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-total">
                                    <span>
                                        Estimated Total
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            cart.subtotal
                                        )}
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    className="checkout-button"
                                    onClick={
                                        handleCheckout
                                    }
                                >
                                    <FiCreditCard />

                                    Proceed to
                                    Checkout
                                </button>

                                <div className="secure-checkout">
                                    <span>
                                        🔒
                                    </span>

                                    <p>
                                        Secure checkout
                                        with protected
                                        payment
                                    </p>
                                </div>

                            </div>
                        </aside>

                    </div>
                )}

            </div>
        </main>
    );
};

export default Cart;