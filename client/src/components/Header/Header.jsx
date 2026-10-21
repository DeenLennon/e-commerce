
import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams,
    useLocation,
} from "react-router-dom";

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
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const { cartCount } = useCart();

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [mobileOpen, setMobileOpen] = useState(false);

    // Keep the input synchronized with URL changes.
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    // Debounce search by 500ms, matching Products.jsx.
    useEffect(() => {
        const value = search.trim();

        if (!value) return;

        const timer = setTimeout(() => {
            const params = new URLSearchParams(
                location.pathname === "/products"
                    ? location.search
                    : ""
            );

            params.set("search", value);
            params.delete("page");

            navigate(`/products?${params.toString()}`);
            setMobileOpen(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, navigate, location.pathname, location.search]);

    // Submit immediately when Enter or Search is pressed.
    const handleSearch = (event) => {
        event.preventDefault();

        const value = search.trim();

        const params = new URLSearchParams(
            location.pathname === "/products"
                ? location.search
                : ""
        );

        if (value) {
            params.set("search", value);
        } else {
            params.delete("search");
        }

        params.delete("page");

        navigate(
            params.toString()
                ? `/products?${params.toString()}`
                : "/products"
        );

        setMobileOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    return (
        <header className="store-header">
            <div className="store-header__top">
                <div className="store-header__container">
                    <button
                        type="button"
                        className="store-header__mobile-button"
                        onClick={() =>
                            setMobileOpen((previous) => !previous)
                        }
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <FiX /> : <FiMenu />}
                    </button>

                    <Link
                        to="/"
                        className="store-header__logo"
                        onClick={closeMobileMenu}
                    >
                        <span>DIRECT</span>
                        <strong>LINKS</strong>
                    </Link>

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
                                setSearch(event.target.value)
                            }
                            aria-label="Search products"
                        />

                        <button type="submit">
                            Search
                        </button>
                    </form>

                    <Link
                        to="/login"
                        className="store-header__account"
                    >
                        <FiUser />
                        <div>
                            <small>Hello, Sign in</small>
                            <span>Account</span>
                        </div>
                    </Link>

                    <Link
                        to="/cart"
                        className="store-header__cart"
                    >
                        <div className="store-header__cart-icon">
                            <FiShoppingCart />
                            {cartCount > 0 && (
                                <span>{cartCount}</span>
                            )}
                        </div>
                        <strong>Cart</strong>
                    </Link>
                </div>
            </div>

            <nav className="store-header__nav">
                <div className="store-header__nav-container">
                    <Link to="/products">All Products</Link>
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
                    <Link to="/cart">My Cart</Link>
                </div>
            </nav>

            {mobileOpen && (
                <div className="store-header__mobile-menu">
                    <Link to="/products" onClick={closeMobileMenu}>
                        All Products
                    </Link>
                    <Link
                        to="/products?category=smartphones"
                        onClick={closeMobileMenu}
                    >
                        Smartphones
                    </Link>
                    <Link
                        to="/products?category=laptops"
                        onClick={closeMobileMenu}
                    >
                        Laptops
                    </Link>
                    <Link
                        to="/products?category=accessories"
                        onClick={closeMobileMenu}
                    >
                        Accessories
                    </Link>
                    <Link
                        to="/products?featured=true"
                        onClick={closeMobileMenu}
                    >
                        Featured
                    </Link>
                    <Link to="/cart" onClick={closeMobileMenu}>
                        My Cart
                    </Link>
                    <Link to="/login" onClick={closeMobileMenu}>
                        Login / Account
                    </Link>
                </div>
            )}
        </header>
    );
};

export default Header;