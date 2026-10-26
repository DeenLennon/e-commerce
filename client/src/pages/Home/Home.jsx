import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiArrowRight,
    FiChevronRight,
    FiLoader,
    FiShoppingCart,
    FiTag,
} from "react-icons/fi";

import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { addToCart } from "../../services/cartService";
import { getImageUrl } from "../../utils/imageUrl";
import Header from "../../components/Header/Header";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import Footer from "../../components/Footer/Footer";

import "./Home.scss";

const Home = () => {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [addingProduct, setAddingProduct] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStorefront();
    }, []);

    const loadStorefront = async () => {
        try {
            setLoading(true);
            setError("");

            const [productsResponse, categoriesResponse] =
                await Promise.all([
                    getProducts(),
                    getCategories(),
                ]);


            const loadedProducts =
                productsResponse?.products ||
                productsResponse?.data ||
                productsResponse ||
                [];

            const loadedCategories =
                categoriesResponse?.categories ||
                categoriesResponse?.data ||
                categoriesResponse ||
                [];

            setProducts(
                Array.isArray(loadedProducts)
                    ? loadedProducts
                    : []
            );

            setCategories(
                Array.isArray(loadedCategories)
                    ? loadedCategories
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load storefront:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load products. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const categoryProductCounts = useMemo(() => {
        const counts = {};

        products.forEach((product) => {
            const categoryId =
                product.category_id ??
                product.category?.id;

            if (categoryId == null) return;

            counts[categoryId] =
                (counts[categoryId] || 0) + 1;
        });

        return counts;
    }, [products]);

    const featuredProducts = useMemo(() => {
        return products
            .filter(
                (product) =>
                    product.status === "active" ||
                    !product.status
            )
            .filter(
                (product) =>
                    Number(product.is_featured) === 1 ||
                    product.is_featured === true
            )
            .slice(0, 8);
    }, [products]);

    const latestProducts = useMemo(() => {
        return products
            .filter(
                (product) =>
                    product.status === "active" ||
                    !product.status
            )
            .slice(0, 8);
    }, [products]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(Number(price) || 0);
    };

    const getProductImage = (product) => {
        /*
         * Support for several possible backend response shapes.
         */

        if (product.image_url) {
            return getImageUrl(product.image_url);
        }

        if (product.featured_image) {
            return getImageUrl(product.featured_image);
        }

        if (product.image) {
            return getImageUrl(product.image);
        }

        if (
            Array.isArray(product.images) &&
            product.images.length > 0
        ) {
            const primaryImage =
                product.images.find(
                    (image) =>
                        Number(image.is_primary) === 1 ||
                        image.is_primary === true
                ) || product.images[0];

            return getImageUrl(
                primaryImage.image_url
            );
        }

        return "";
    };

    const handleAddToCart = async (product) => {
        try {
            setAddingProduct(product.id);

            await addToCart(product.id, 1);

            alert(
                `${product.name} has been added to your cart.`
            );
        } catch (err) {
            console.error(
                "Failed to add product to cart:",
                err
            );

            const message =
                err?.response?.data?.message ||
                "Unable to add this product to your cart.";

            alert(message);
        } finally {
            setAddingProduct(null);
        }
    };

    if (loading) {
        return (
            <div className="home-page home-page--loading">
                <FiLoader className="home-page__loader" />
                <p>Loading products...</p>
            </div>
        );
    }

    return (

        <>
            <Header />

            <main className="home-page">

                {/*HERO*/}

                <section className="home-hero">
                    <div className="home-container home-hero__content">

                        <div className="home-hero__text">
                            <span className="home-hero__badge">
                                NEW COLLECTIONS
                            </span>

                            <h1>
                                Discover the latest
                                <span>technology</span>
                            </h1>

                            <p>
                                Shop smartphones, laptops,
                                accessories, wearables and more at
                                affordable prices.
                            </p>

                            <Link
                                to="/products"
                                className="home-hero__button"
                            >
                                Shop Now
                                <FiArrowRight />
                            </Link>
                        </div>

                        <div className="home-hero__visual">
                            <div className="home-hero__circle">
                                <span>TECH</span>
                            </div>

                            <div className="home-hero__card home-hero__card--one">
                                📱
                            </div>

                            <div className="home-hero__card home-hero__card--two">
                                💻
                            </div>

                            <div className="home-hero__card home-hero__card--three">
                                🎧
                            </div>
                        </div>

                    </div>
                </section>

                {/*CATEGORIES */}

                <section className="home-section">
                    <div className="home-container">
                        <div className="section-heading">
                            <div>
                                <span className="section-heading__eyebrow">
                                    EXPLORE
                                </span>

                                <h2>
                                    Shop by Category
                                </h2>
                            </div>

                            <Link
                                to="/products"
                                className="section-heading__link"
                            >
                                View All
                                <FiChevronRight />
                            </Link>
                        </div>


                        <div className="category-grid">

                            {categories
                                .slice(0, 8)
                                .map((category) => (

                                    <CategoryCard
                                        key={category.id}

                                        category={{
                                            ...category,

                                            image: category.image_url
                                                ? getImageUrl(
                                                    category.image_url
                                                )
                                                : category.image
                                                    ? getImageUrl(
                                                        category.image
                                                    )
                                                    : "",

                                            product_count:
                                                categoryProductCounts[
                                                category.id
                                                ] || 0,
                                        }}

                                        onClick={() => {
                                            navigate(
                                                `/products?category=${category.slug ||
                                                category.id
                                                }`
                                            );
                                        }}
                                    />

                                ))}

                        </div>


                    </div>
                </section>

                {/*ERROR*/}

                {error && (
                    <section className="home-container">
                        <div className="home-error">
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={loadStorefront}
                            >
                                Try Again
                            </button>
                        </div>
                    </section>
                )}

                {/*FEATURED PRODUCTS*/}

                {!error && featuredProducts.length > 0 && (
                    <section className="home-section home-section--featured">
                        <div className="home-container">

                            <div className="section-heading">
                                <div>
                                    <span className="section-heading__eyebrow">
                                        FEATURED
                                    </span>

                                    <h2>
                                        Featured Products
                                    </h2>
                                </div>

                                <Link
                                    to="/products"
                                    className="section-heading__link"
                                >
                                    See All
                                    <FiChevronRight />
                                </Link>
                            </div>

                            <div className="product-grid">
                                {featuredProducts.map(
                                    (product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            image={getProductImage(
                                                product
                                            )}
                                            formatPrice={
                                                formatPrice
                                            }
                                            addingProduct={
                                                addingProduct
                                            }
                                            onAddToCart={
                                                handleAddToCart
                                            }
                                        />
                                    )
                                )}
                            </div>

                        </div>
                    </section>
                )}

                {/*LATEST PRODUCTS*/}

                <section className="home-section">
                    <div className="home-container">

                        <div className="section-heading">
                            <div>
                                <span className="section-heading__eyebrow">
                                    JUST IN
                                </span>

                                <h2>
                                    Latest Products
                                </h2>
                            </div>

                            <Link
                                to="/products"
                                className="section-heading__link"
                            >
                                View All
                                <FiChevronRight />
                            </Link>
                        </div>

                        {latestProducts.length === 0 ? (
                            <div className="home-empty">
                                <p>
                                    No products are available
                                    right now.
                                </p>
                            </div>
                        ) : (
                            <div className="product-grid">
                                {latestProducts.map(
                                    (product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            image={getProductImage(
                                                product
                                            )}
                                            formatPrice={
                                                formatPrice
                                            }
                                            addingProduct={
                                                addingProduct
                                            }
                                            onAddToCart={
                                                handleAddToCart
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}

                    </div>
                </section>

                {/*PROMOTIONAL SECTION*/}

                <section className="home-promo">
                    <div className="home-container home-promo__content">

                        <div>
                            <span>
                                BIG DEALS
                            </span>

                            <h2>
                                Upgrade your setup
                            </h2>

                            <p>
                                Discover quality technology
                                for work, entertainment and
                                everyday life.
                            </p>
                        </div>

                        <Link
                            to="/products"
                            className="home-promo__button"
                        >
                            Explore Products
                            <FiArrowRight />
                        </Link>

                    </div>
                </section>

            </main>

            <Footer />

        </>
    );
};

/*PRODUCT CARD*/

const ProductCard = ({
    product,
    image,
    formatPrice,
    addingProduct,
    onAddToCart,
}) => {
    const comparePrice =
        Number(product.compare_price) || 0;

    const price =
        Number(product.price) || 0;

    const hasDiscount =
        comparePrice > price;

    return (
        <article className="product-card">

            <Link
                to={`/products/${product.slug || product.id}`}
                className="product-card__image-wrapper"
            >
                {hasDiscount && (
                    <span className="product-card__discount">
                        -
                        {Math.round(
                            ((comparePrice - price) /
                                comparePrice) *
                            100
                        )}
                        %
                    </span>
                )}

                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="product-card__image"
                    />
                ) : (
                    <div className="product-card__placeholder">
                        <FiShoppingCart />
                    </div>
                )}
            </Link>

            <div className="product-card__body">

                <span className="product-card__category">
                    {product.category_name ||
                        product.category ||
                        "Technology"}
                </span>

                <Link
                    to={`/products/${product.slug || product.id}`}
                    className="product-card__name"
                >
                    {product.name}
                </Link>

                <div className="product-card__pricing">
                    <strong className="product-card__price">
                        {formatPrice(price)}
                    </strong>

                    {hasDiscount && (
                        <span className="product-card__compare-price">
                            {formatPrice(comparePrice)}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    className="product-card__button"
                    onClick={() =>
                        onAddToCart(product)
                    }
                    disabled={
                        addingProduct === product.id ||
                        product.status ===
                        "out_of_stock" ||
                        Number(
                            product.stock_quantity
                        ) <= 0
                    }
                >
                    {addingProduct === product.id ? (
                        <>
                            <FiLoader className="spin" />
                            Adding...
                        </>
                    ) : Number(
                        product.stock_quantity
                    ) <= 0 ||
                        product.status ===
                        "out_of_stock" ? (
                        "Out of Stock"
                    ) : (
                        <>
                            <FiShoppingCart />
                            Add to Cart
                        </>
                    )}
                </button>

            </div>
        </article>
    );
};

export default Home;