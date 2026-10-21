
import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

import Header from "../../components/Header/Header";

import {
    getProducts,
} from "../../services/productService";

import {
    getCategories,
} from "../../services/categoryService";

import {
    addToCart,
} from "../../services/cartService";

import {
    useCart,
} from "../../context/CartContext";

import Toast from "../../components/Toast/Toast";

import ProductCard from "../../components/ProductCard/ProductCard";

import "./Products.scss";

const Products = () => {

    const location = useLocation();

    const [searchParams, setSearchParams] =
        useSearchParams();

    // PRODUCTS

    const [products, setProducts] = useState([]);

    const [categories, setCategories] =
        useState([]);

    // LOADING / ERROR

    const [loading, setLoading] =
        useState(true);

    const [categoryLoading, setCategoryLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // PAGINATION

    const [page, setPage] = useState(
        Number(searchParams.get("page")) || 1
    );

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        });

    // FILTERS

    const search = searchParams.get("search") || "";

    const [category, setCategory] =
        useState(
            searchParams.get("category") || ""
        );

    const [minPrice, setMinPrice] =
        useState(
            searchParams.get("minPrice") || ""
        );

    const [maxPrice, setMaxPrice] =
        useState(
            searchParams.get("maxPrice") || ""
        );

    const [sort, setSort] = useState(
        searchParams.get("sort") || "latest"
    );

    // ADD TO CART

    const [
        addingProductId,
        setAddingProductId,
    ] = useState(null);

    // CART CONTEXT

    const {
        refreshCartCount,
    } = useCart();

    // TOAST

    const [
        toastVisible,
        setToastVisible,
    ] = useState(false);

    const [
        toastMessage,
        setToastMessage,
    ] = useState("");

    const showToast = (message) => {
        setToastMessage(message);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 3000);
    };

    // LOAD CATEGORIES

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoryLoading(true);

                const response =
                    await getCategories();

                setCategories(
                    response.categories ||
                    response.data ||
                    []
                );
            } catch (error) {
                console.error(
                    "Failed to load categories:",
                    error
                );
            } finally {
                setCategoryLoading(false);
            }
        };

        loadCategories();
    }, []);

    // LOAD PRODUCTS

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getProducts({
                        page,
                        limit: 12,
                        search: search,
                        category,
                        minPrice,
                        maxPrice,
                        sort,
                    });

                setProducts(
                    response.products || []
                );

                setPagination(
                    response.pagination || {
                        page,
                        limit: 12,
                        total: 0,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    }
                );

            } catch (error) {
                console.error(
                    "Failed to load products:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load products."
                );

                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [
        page,
        search,
        category,
        minPrice,
        maxPrice,
        sort,
    ]);


    useEffect(() => {
        const params = new URLSearchParams(location.search);

        setCategory(params.get("category") || "");
        setMinPrice(params.get("minPrice") || "");
        setMaxPrice(params.get("maxPrice") || "");
        setSort(params.get("sort") || "latest");
        setPage(Math.max(1, Number(params.get("page")) || 1));
    }, [location.search]);

    // KEEP URL SYNCHRONIZED

    useEffect(() => {
        const params = {};

        if (search) {
            params.search = search;
        }

        if (category) {
            params.category = category;
        }

        if (minPrice) {
            params.minPrice = minPrice;
        }

        if (maxPrice) {
            params.maxPrice = maxPrice;
        }

        if (sort && sort !== "latest") {
            params.sort = sort;
        }

        if (page > 1) {
            params.page = page;
        }

        setSearchParams(params);
    }, [
        search,
        category,
        minPrice,
        maxPrice,
        sort,
        page,
        setSearchParams,
    ]);

    // CATEGORY

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);

        setPage(1);
    };

    // SORT

    const handleSortChange = (event) => {
        setSort(event.target.value);

        setPage(1);
    };

    // PRICE FILTER

    const handlePriceFilter = () => {
        setPage(1);
    };

    // CLEAR FILTERS
    const clearFilters = () => {
        setCategory("");
        setMinPrice("");
        setMaxPrice("");
        setSort("latest");
        setPage(1);

        // Clear the navbar search and URL filters.
        setSearchParams({});
    };

    // ADD TO CART

    const handleAddToCart = async (product) => {
        try {
            setAddingProductId(product.id);

            const response =
                await addToCart(
                    product.id,
                    1
                );

            if (
                response?.success === false
            ) {
                throw new Error(
                    response.message ||
                    "Failed to add product to cart."
                );
            }

            // Refresh the cart badge
            await refreshCartCount();

            // Show success toast
            showToast(
                `${product.name} added to your cart.`
            );
        } catch (error) {
            console.error(
                "Add to cart error:",
                error
            );

            showToast(
                error?.response?.data?.message ||
                error.message ||
                "Unable to add product to cart."
            );
        } finally {
            setAddingProductId(null);
        }
    };

    // RENDER

    return (
        <>
            <Header />
            <main className="products-page">

                {/* PAGE HEADER */}

                <section className="products-header">

                    <div>
                        <h1>
                            Products
                        </h1>

                        <p>
                            Browse our latest
                            products and find
                            what you need.
                        </p>
                    </div>

                </section>

                {/* MAIN CONTENT */}

                <section className="products-content">

                    {/* FILTER SIDEBAR */}

                    <aside className="products-filters">

                        <div className="filter-header">

                            <h2>
                                Filters
                            </h2>

                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear
                            </button>

                        </div>

                        {/* CATEGORY */}

                        <div className="filter-group">

                            <label>
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={
                                    handleCategoryChange
                                }
                            >
                                <option value="">
                                    All Categories
                                </option>

                                {!categoryLoading &&
                                    categories.map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.slug
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </option>
                                        )
                                    )}
                            </select>

                        </div>

                        {/* MINIMUM PRICE */}

                        <div className="filter-group">

                            <label>
                                Minimum Price
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="₦0"
                                value={minPrice}
                                onChange={(event) =>
                                    setMinPrice(
                                        event.target
                                            .value
                                    )
                                }
                            />

                        </div>

                        {/* MAXIMUM PRICE */}

                        <div className="filter-group">

                            <label>
                                Maximum Price
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="₦5,000,000"
                                value={maxPrice}
                                onChange={(event) =>
                                    setMaxPrice(
                                        event.target
                                            .value
                                    )
                                }
                            />

                        </div>

                        {/* APPLY FILTER */}

                        <button
                            type="button"
                            className="apply-filter-button"
                            onClick={
                                handlePriceFilter
                            }
                        >
                            Apply Filters
                        </button>

                    </aside>

                    {/* PRODUCTS RESULTS */}

                    <div className="products-results">

                        {/* TOOLBAR */}

                        <div className="products-toolbar">

                            <p>
                                {loading
                                    ? "Loading products..."
                                    : `${pagination.total} product${pagination.total ===
                                        1
                                        ? ""
                                        : "s"
                                    } found`}
                            </p>

                            <select
                                value={sort}
                                onChange={
                                    handleSortChange
                                }
                            >
                                <option value="latest">
                                    Latest
                                </option>

                                <option value="popular">
                                    Most Popular
                                </option>

                                <option value="price_asc">
                                    Price: Low to High
                                </option>

                                <option value="price_desc">
                                    Price: High to Low
                                </option>

                                <option value="name_asc">
                                    Name: A-Z
                                </option>
                            </select>

                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="products-error">
                                {error}
                            </div>
                        )}

                        {/*LOADING */}

                        {loading && (
                            <div className="products-loading">

                                <p>
                                    Loading products...
                                </p>

                            </div>
                        )}

                        {/* PRODUCT GRID */}

                        {!loading &&
                            !error &&
                            products.length > 0 && (
                                <div className="products-grid">

                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={
                                                handleAddToCart
                                            }
                                            adding={
                                                addingProductId ===
                                                product.id
                                            }
                                        />
                                    ))}

                                </div>
                            )}


                        {/* EMPTY STATE */}

                        {!loading &&
                            !error &&
                            products.length === 0 && (
                                <div className="products-empty">

                                    <h2>
                                        No products found
                                    </h2>

                                    <p>
                                        Try changing
                                        your search
                                        or filters.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                    >
                                        Clear Filters
                                    </button>

                                </div>
                            )}

                    </div>

                </section>

                {/*TOAST */}

                <Toast
                    message={toastMessage}
                    visible={toastVisible}
                    onClose={() =>
                        setToastVisible(false)
                    }
                />

            </main>
        </>
    );
};

export default Products;