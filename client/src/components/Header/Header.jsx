import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import {
    FiMenu,
    FiSearch,
    FiShoppingCart,
    FiUser,
    FiX,
} from "react-icons/fi";

import "./Header.scss";

const Header = () => {
    const navigate = useNavigate();

    const {
        cartCount,
    } = useCart();

    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSearch = (event) => {
        event.preventDefault();

        const value = search.trim();

        if (!value) {
            navigate("/products");
            return;
        }

        navigate(
            `/products?search=${encodeURIComponent(
                value
            )}`
        );

        setMobileOpen(false);
    };

    return (
        <header className="store-header">

            <div className="store-header__top">

                <div className="store-header__container">

                    {/* MOBILE MENU */}

                    <button
                        type="button"
                        className="store-header__mobile-button"
                        onClick={() =>
                            setMobileOpen(
                                !mobileOpen
                            )
                        }
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? (
                            <FiX />
                        ) : (
                            <FiMenu />
                        )}
                    </button>

                    {/* LOGO */}

                    <Link
                        to="/"
                        className="store-header__logo"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        <span>TECH</span>
                        <strong>STORE</strong>
                    </Link>

                    {/* SEARCH */}

                    <form
                        className="store-header__search"
                        onSubmit={handleSearch}
                    >
                        <FiSearch />

                        <input
                            type="search"
                            placeholder="Search products..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        <button type="submit">
                            Search
                        </button>
                    </form>

                    {/* ACCOUNT */}

                    <Link
                        to="/login"
                        className="store-header__account"
                    >
                        <FiUser />

                        <div>
                            <small>
                                Hello, Sign in
                            </small>

                            <span>
                                Account
                            </span>
                        </div>
                    </Link>

                    {/* CART */}

                    <Link
                        to="/cart"
                        className="store-header__cart"
                    >
                        <div className="store-header__cart-icon">
                            <FiShoppingCart />

                            {cartCount > 0 && (
                                <span>
                                    {cartCount}
                                </span>
                            )}
                        </div>

                        <strong>
                            Cart
                        </strong>
                    </Link>

                </div>

            </div>

            {/* DESKTOP NAVIGATION */}

            <nav className="store-header__nav">

                <div className="store-header__nav-container">

                    <Link to="/products">
                        All Products
                    </Link>

                    <Link to="/products?category=smartphones">
                        Smartphones
                    </Link>

                    <Link to="/products?category=laptops">
                        Laptops
                    </Link>

                    <Link to="/products?category=accessories">
                        Accessories
                    </Link>

                    <Link to="/products?featured=true">
                        Featured
                    </Link>

                    <Link to="/cart">
                        My Cart
                    </Link>

                </div>

            </nav>

            {/* MOBILE NAVIGATION */}

            {mobileOpen && (
                <div className="store-header__mobile-menu">

                    <Link
                        to="/products"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        All Products
                    </Link>

                    <Link
                        to="/products?category=smartphones"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        Smartphones
                    </Link>

                    <Link
                        to="/products?category=laptops"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        Laptops
                    </Link>

                    <Link
                        to="/products?category=accessories"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        Accessories
                    </Link>

                    <Link
                        to="/cart"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        My Cart
                    </Link>

                    <Link
                        to="/login"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        Login / Account
                    </Link>

                </div>
            )}

        </header>
    );
};

export default Header;