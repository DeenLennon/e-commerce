import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FiArrowLeft,
    FiCheck,
    FiMapPin,
    FiPlus,
    FiShoppingBag,
    FiCreditCard,
} from "react-icons/fi";

import {
    getCart,
} from "../../services/cartService";

import {
    getAddresses,
    createAddress,
} from "../../services/addressService";

import {
    createCheckoutOrder,
} from "../../services/orderService";

import { getImageUrl } from "../../utils/imageUrl";

import "./Checkout.scss";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(Number(amount || 0));
};

const emptyAddress = {
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postal_code: "",
    is_default: false,
};

const Checkout = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);

    const [placingOrder, setPlacingOrder] = useState(false);

    const [selectedAddressId, setSelectedAddressId] =
        useState(null);

    const [showAddressForm, setShowAddressForm] =
        useState(false);

    const [addressForm, setAddressForm] =
        useState(emptyAddress);

    const [loading, setLoading] = useState(true);
    const [savingAddress, setSavingAddress] =
        useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        loadCheckoutData();
    }, []);

    const loadCheckoutData = async () => {
        try {
            setLoading(true);
            setError("");

            const [cartResponse, addressResponse] =
                await Promise.all([
                    getCart(),
                    getAddresses(),
                ]);

            /*
             * CART API RESPONSE:
             *
             * {
             *     success: true,
             *     cart: {
             *         id: 2,
             *         user_id: 1,
             *         items: [...],
             *         itemCount: 1,
             *         subtotal: 1850000
             *     }
             * }
             */

            if (!cartResponse?.success) {
                throw new Error(
                    cartResponse?.message ||
                    "Failed to load cart"
                );
            }

            /*
             * IMPORTANT:
             *
             * The API returns the cart inside
             * cartResponse.cart, NOT cartResponse.data.
             */
            const loadedCart = cartResponse.cart;

            if (!loadedCart) {
                throw new Error(
                    "Cart data was not returned by the server."
                );
            }

            setCart(loadedCart);

            /*
             * ADDRESS API RESPONSE
             *
             * We support:
             * {
             *     success: true,
             *     data: [...]
             * }
             *
             * or:
             *
             * {
             *     success: true,
             *     addresses: [...]
             * }
             */
            if (!addressResponse?.success) {
                throw new Error(
                    addressResponse?.message ||
                    "Failed to load addresses"
                );
            }

            const loadedAddresses =
                addressResponse.data ||
                addressResponse.addresses ||
                [];

            setAddresses(loadedAddresses);

            /* Automatically select the default address. If there is no default address, select the first available address. */
            
            const defaultAddress =
                loadedAddresses.find(
                    (address) =>
                        Number(address.is_default) === 1
                );

            if (defaultAddress) {
                setSelectedAddressId(
                    defaultAddress.id
                );
            } else if (loadedAddresses.length > 0) {
                setSelectedAddressId(
                    loadedAddresses[0].id
                );
            }
        } catch (err) {
            console.error(
                "Checkout loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load checkout"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setAddressForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const handleCreateAddress = async (event) => {
        event.preventDefault();

        try {
            setSavingAddress(true);
            setError("");

            const response =
                await createAddress(addressForm);

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to create address"
                );
            }

            const newAddress =
                response.data;

            if (!newAddress) {
                throw new Error(
                    "Address was created but no address data was returned."
                );
            }

            setAddresses((previous) => {
                /*
                 * If the new address is default,
                 * remove default status from existing
                 * addresses in local state.
                 */
                if (
                    Number(newAddress.is_default) ===
                    1 ||
                    newAddress.is_default === true
                ) {
                    return [
                        newAddress,
                        ...previous.map(
                            (address) => ({
                                ...address,
                                is_default: 0,
                            })
                        ),
                    ];
                }

                return [
                    newAddress,
                    ...previous,
                ];
            });

            /* Automatically select the newly created address. */

            setSelectedAddressId(
                newAddress.id
            );

            setAddressForm({
                ...emptyAddress,
            });

            setShowAddressForm(false);
        } catch (err) {
            console.error(
                "Create address error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create address"
            );
        } finally {
            setSavingAddress(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setError(
                "Please select a shipping address."
            );

            return;
        }

        if (!cart?.items?.length) {
            setError(
                "Your cart is empty."
            );

            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

            console.log(
                "Creating checkout order with address:",
                selectedAddressId
            );

            const response =
                await createCheckoutOrder(
                    selectedAddressId
                );

            console.log(
                "Checkout order response:",
                response
            );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to create order"
                );
            }

            const order =
                response.data;

            if (!order?.order_id) {
                throw new Error(
                    "Order was created but no order ID was returned."
                );
            }

            console.log(
                "ORDER CREATED:",
                order
            );

            navigate(
                `/orders/${order.order_id}`,
                {
                    state: {
                        order,
                    },
                }
            );
        } catch (err) {
            console.error(
                "Place order error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create order"
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    /*LOADING STATE */

    if (loading) {
        return (
            <div className="checkout-page">
                <div className="checkout-loading">
                    Loading checkout...
                </div>
            </div>
        );
    }

    if (!cart || !cart.items?.length) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <FiShoppingBag />

                    <h2>
                        Your cart is empty
                    </h2>

                    <p>
                        Add some products before
                        proceeding to checkout.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    const subtotal = Number(
        cart.subtotal || 0
    );

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                <button
                    type="button"
                    className="checkout-back-button"
                    onClick={() =>
                        navigate("/cart")
                    }
                >
                    <FiArrowLeft />
                    Back to Cart
                </button>

                <div className="checkout-header">
                    <div>
                        <span className="checkout-eyebrow">
                            SECURE CHECKOUT
                        </span>

                        <h1>
                            Checkout
                        </h1>

                        <p>
                            Complete your shipping
                            information to continue.
                        </p>
                    </div>

                    <div className="checkout-security">
                        <FiCreditCard />
                        Secure checkout
                    </div>
                </div>

                {error && (
                    <div className="checkout-error">
                        {error}
                    </div>
                )}

                <div className="checkout-layout">

                    {/* LEFT SIDE */}
                    <div className="checkout-main">

                        {/* SHIPPING ADDRESS */}
                        <section className="checkout-section">

                            <div className="checkout-section-header">
                                <div>
                                    <span className="section-number">
                                        01
                                    </span>

                                    <div>
                                        <h2>
                                            Shipping Address
                                        </h2>

                                        <p>
                                            Where should
                                            we deliver
                                            your order?
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="add-address-button"
                                    onClick={() =>
                                        setShowAddressForm(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                >
                                    <FiPlus />
                                    Add Address
                                </button>
                            </div>

                            {/* ADDRESS FORM */}
                            {showAddressForm && (
                                <form
                                    className="address-form"
                                    onSubmit={
                                        handleCreateAddress
                                    }
                                >
                                    <div className="form-row">

                                        <div className="form-group">
                                            <label>
                                                First Name
                                            </label>

                                            <input
                                                type="text"
                                                name="first_name"
                                                value={
                                                    addressForm.first_name
                                                }
                                                onChange={
                                                    handleAddressChange
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Last Name
                                            </label>

                                            <input
                                                type="text"
                                                name="last_name"
                                                value={
                                                    addressForm.last_name
                                                }
                                                onChange={
                                                    handleAddressChange
                                                }
                                                required
                                            />
                                        </div>

                                    </div>

                                    <div className="form-row">

                                        <div className="form-group">
                                            <label>
                                                Phone
                                            </label>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={
                                                    addressForm.phone
                                                }
                                                onChange={
                                                    handleAddressChange
                                                }
                                                placeholder="08012345678"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Country
                                            </label>

                                            <input
                                                type="text"
                                                name="country"
                                                value={
                                                    addressForm.country
                                                }
                                                onChange={
                                                    handleAddressChange
                                                }
                                                required
                                            />
                                        </div>

                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Street Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={
                                                addressForm.address
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">

                                        <div className="form-group">
                                            <label>
                                                City
                                            </label>

                                            <input
                                                type="text"
                                                name="city"
                                                value={
                                                    addressForm.city
                                                }
                                                onChange={
                                                    handleAddressChange
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                State
                                            </label>

                                            <input
                                                type="text"
                                                name="state"
                                                value={
                                                    addressForm.state
                                                }
                                                onChange={
                                                    handleAddressChange
                                                }
                                                required
                                            />
                                        </div>

                                    </div>

                                    <div className="form-row">

                                        <div className="form-group">
                                            <label>
                                                Postal Code
                                            </label>

                                            <input
                                                type="text"
                                                name="postal_code"
                                                value={
                                                    addressForm.postal_code
                                                }
                                                onChange={
                                                    handleAddressChange
                                                }
                                            />
                                        </div>

                                    </div>

                                    <label className="default-address-checkbox">
                                        <input
                                            type="checkbox"
                                            name="is_default"
                                            checked={
                                                addressForm.is_default
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                        />

                                        <span>
                                            Make this my
                                            default address
                                        </span>
                                    </label>

                                    <div className="address-form-actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddressForm(
                                                    false
                                                )
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                savingAddress
                                            }
                                        >
                                            {savingAddress
                                                ? "Saving..."
                                                : "Save Address"}
                                        </button>

                                    </div>
                                </form>
                            )}

                            {/* ADDRESS LIST */}
                            {addresses.length > 0 ? (
                                <div className="address-list">

                                    {addresses.map(
                                        (address) => (
                                            <button
                                                type="button"
                                                key={
                                                    address.id
                                                }
                                                className={`address-card ${
                                                    Number(
                                                        selectedAddressId
                                                    ) ===
                                                    Number(
                                                        address.id
                                                    )
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedAddressId(
                                                        address.id
                                                    )
                                                }
                                            >
                                                <div className="address-card-radio">

                                                    {Number(
                                                        selectedAddressId
                                                    ) ===
                                                        Number(
                                                            address.id
                                                        ) && (
                                                        <FiCheck />
                                                    )}

                                                </div>

                                                <div className="address-card-content">

                                                    <div className="address-card-header">

                                                        <strong>
                                                            {
                                                                address.first_name
                                                            }{" "}
                                                            {
                                                                address.last_name
                                                            }
                                                        </strong>

                                                        {Number(
                                                            address.is_default
                                                        ) === 1 && (
                                                            <span className="default-badge">
                                                                Default
                                                            </span>
                                                        )}

                                                    </div>

                                                    <p>
                                                        {
                                                            address.phone
                                                        }
                                                    </p>

                                                    <p>
                                                        {
                                                            address.address
                                                        }
                                                    </p>

                                                    <p>
                                                        {
                                                            address.city
                                                        }
                                                        ,{" "}
                                                        {
                                                            address.state
                                                        }
                                                    </p>

                                                    <p>
                                                        {
                                                            address.country
                                                        }

                                                        {address.postal_code
                                                            ? `, ${address.postal_code}`
                                                            : ""}
                                                    </p>

                                                </div>

                                                <FiMapPin className="address-pin" />

                                            </button>
                                        )
                                    )}

                                </div>
                            ) : (
                                <div className="no-addresses">

                                    <FiMapPin />

                                    <h3>
                                        No shipping
                                        address yet
                                    </h3>

                                    <p>
                                        Add an address
                                        to continue.
                                    </p>

                                </div>
                            )}

                        </section>

                        {/* ORDER ITEMS */}
                        <section className="checkout-section">

                            <div className="checkout-section-header">

                                <div>
                                    <span className="section-number">
                                        02
                                    </span>

                                    <div>
                                        <h2>
                                            Order Items
                                        </h2>

                                        <p>
                                            Review the
                                            products in
                                            your cart.
                                        </p>
                                    </div>
                                </div>

                            </div>

                            <div className="checkout-items">

                                {cart.items.map(
                                    (item) => (
                                        <div
                                            className="checkout-item"
                                            key={item.id}
                                        >

                                            <div className="checkout-item-image">

                                                {item.image_url ? (
                                                    <img
                                                        src={getImageUrl(
                                                            item.image_url
                                                        )}
                                                        alt={
                                                            item.name
                                                        }
                                                    />
                                                ) : (
                                                    <div>
                                                        <FiShoppingBag />
                                                    </div>
                                                )}

                                            </div>

                                            <div className="checkout-item-info">

                                                <h3>
                                                    {
                                                        item.name
                                                    }
                                                </h3>

                                                <p>
                                                    SKU:{" "}
                                                    {
                                                        item.sku
                                                    }
                                                </p>

                                                <span>
                                                    Qty:{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    Number(
                                                        item.price
                                                    ) *
                                                    Number(
                                                        item.quantity
                                                    )
                                                )}
                                            </strong>

                                        </div>
                                    )
                                )}

                            </div>

                        </section>

                    </div>

                    {/* RIGHT SIDE */}
                    <aside className="checkout-summary">

                        <div className="summary-title">

                            <h2>
                                Order Summary
                            </h2>

                            <span>
                                {cart.items.length}{" "}
                                {cart.items.length === 1
                                    ? "item"
                                    : "items"}
                            </span>

                        </div>

                        <div className="summary-lines">

                            <div>
                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    {formatCurrency(
                                        subtotal
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Shipping
                                </span>

                                <strong>
                                    Calculated at
                                    checkout
                                </strong>
                            </div>

                        </div>

                        <div className="summary-divider" />

                        <div className="summary-total">

                            <span>
                                Estimated Total
                            </span>

                            <strong>
                                {formatCurrency(
                                    subtotal
                                )}
                            </strong>

                        </div>

                        <p className="summary-note">
                            Final shipping charges and
                            the final order total will
                            be calculated and verified by
                            the server when you place the
                            order.
                        </p>

                        <button
                            type="button"
                            className="place-order-button"
                            disabled={
                                !selectedAddressId ||
                                placingOrder
                            }
                            onClick={
                                handlePlaceOrder
                            }
                        >
                            {placingOrder
                                ? "Creating Order..."
                                : "Place Order"}

                            <FiCreditCard />

                        </button>

                        <div className="checkout-trust">

                            <FiCheck />

                            Your order information is
                            securely processed.

                        </div>

                    </aside>

                </div>
            </div>
        </div>
    );
};

export default Checkout;