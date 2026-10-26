import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.scss";

import { getImageUrl } from "../../utils/imageUrl";

const ProductCard = ({
    product,
    onAddToCart,
    adding = false,
}) => {
    if (!product) {
        return null;
    }

    // PRODUCT IMAGE

    const productImage =
        product.image_url ||
        product.images?.find(
            (image) =>
                Number(image.is_primary) === 1 ||
                image.is_primary === true
        )?.image_url ||
        product.images?.[0]?.image_url ||
        product.featured_image ||
        product.image;

    // PRICE

    const price =
        Number(product.price) || 0;

    const comparePrice =
        Number(product.compare_price) || 0;

    const hasDiscount =
        comparePrice > price;

    const discountPercentage =
        hasDiscount
            ? Math.round(
                  ((comparePrice - price) /
                      comparePrice) *
                      100
              )
            : 0;

    // STOCK

    const stockQuantity =
        Number(product.stock_quantity) || 0;

    const isOutOfStock =
        stockQuantity <= 0 ||
        product.status === "inactive" ||
        product.status === "out_of_stock";

    // CURRENCY

    const formatPrice = (value) => {
        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0,
            }
        ).format(value);
    };

    // ADD TO CART

    const handleAddToCart = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (
            isOutOfStock ||
            adding
        ) {
            return;
        }
        if (onAddToCart) {
            onAddToCart(product);
        }
    };

    // RENDER

    return (
        <article className="product-card">

            {/* PRODUCT IMAGE */}

            <Link
                to={`/products/${product.slug}`}
                className="product-card__image-wrapper"
            >
                {productImage ? (
                    <img
                        src={getImageUrl(
                            productImage
                        )}
                        alt={product.name}
                        className="product-card__image"
                        loading="lazy"
                    />
                ) : (
                    <div className="product-card__no-image">
                        <span>📷</span>
                        <p>No Image</p>
                    </div>
                )}

                {/* DISCOUNT */}

                {hasDiscount && (
                    <span className="product-card__discount">
                        -{discountPercentage}%
                    </span>
                )}

                {/* FEATURED */}

                {(product.is_featured === 1 ||
                    product.is_featured === true) && (
                    <span className="product-card__featured">
                        Featured
                    </span>
                )}

                {/* OUT OF STOCK */}

                {isOutOfStock && (
                    <div className="product-card__out-of-stock">
                        Out of Stock
                    </div>
                )}
            </Link>

            {/* PRODUCT INFORMATION */}

            <div className="product-card__body">

                {/* CATEGORY */}

                <span className="product-card__category">
                    {product.category_name ||
                        "Technology"}
                </span>

                {/* NAME */}

                <Link
                    to={`/products/${product.slug}`}
                    className="product-card__name-link"
                >
                    <h3 className="product-card__name">
                        {product.name}
                    </h3>
                </Link>

                {/* DESCRIPTION */}

                {product.short_description && (
                    <p className="product-card__description">
                        {
                            product.short_description
                        }
                    </p>
                )}

                {/* PRICE */}

                <div className="product-card__pricing">

                    <span className="product-card__price">
                        {formatPrice(price)}
                    </span>

                    {hasDiscount && (
                        <span className="product-card__compare-price">
                            {formatPrice(
                                comparePrice
                            )}
                        </span>
                    )}

                </div>

                {/* LOW STOCK */}

                {!isOutOfStock &&
                    stockQuantity <= 5 && (
                        <p className="product-card__low-stock">
                            Only {stockQuantity} left
                        </p>
                    )}

                {/* STOCK */}

                <div className="product-card__stock">

                    {isOutOfStock ? (
                        <span className="out">
                            Out of stock
                        </span>
                    ) : (
                        <span className="in">
                            In stock
                        </span>
                    )}

                </div>

                {/* ADD TO CART */}

                <button
                    type="button"
                    className="product-card__cart-button"
                    disabled={
                        isOutOfStock ||
                        adding
                    }
                    onClick={
                        handleAddToCart
                    }
                >
                    {adding
                        ? "Adding..."
                        : isOutOfStock
                        ? "Out of Stock"
                        : "Add to Cart"}
                </button>

            </div>

        </article>
    );
};

export default ProductCard;