
import React from "react";
import {
    ArrowForward,
    ShoppingBag,
} from "@mui/icons-material";
import { getImageUrl } from "../../utils/imageUrl";
import "./CategoryCard.scss";

const CategoryCard = ({
    category,
    onClick,
    showProductCount = true,
}) => {
    const {
        name,
        image,
        image_url,
        product_count,
        products_count,
        description,
        latest_product_image,
        latest_product,
    } = category;

    const productCount =
        product_count ?? products_count ?? 0;

    // Prefer the latest product's image.
    const productImage =
        latest_product_image ||
        latest_product?.featured_image ||
        latest_product?.image_url ||
        latest_product?.images?.find(
            (img) => img.is_primary
        )?.image_url ||
        latest_product?.images?.[0]?.image_url ||
        latest_product?.images?.[0]?.url;

    // Fall back to the category image.
    const imageSource =
        productImage || image_url || image;

    const imageUrl = imageSource
        ? getImageUrl(imageSource)
        : "";

    const handleClick = () => {
        if (onClick) {
            onClick(category);
        }
    };

    return (
        <article
            className="category-card"
            onClick={handleClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (
                    onClick &&
                    (e.key === "Enter" ||
                        e.key === " ")
                ) {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <div className="category-card__image">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={`${name} category`}
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display =
                                "none";
                        }}
                    />
                ) : (
                    <div className="category-card__fallback">
                        <ShoppingBag />
                    </div>
                )}

                <div className="category-card__overlay" />

                <div className="category-card__arrow">
                    <ArrowForward />
                </div>

                {showProductCount && (
                    <div className="category-card__count">
                        {productCount}{" "}
                        {productCount === 1
                            ? "Product"
                            : "Products"}
                    </div>
                )}
            </div>

            <div className="category-card__content">
                <div>
                    <h3>{name}</h3>

                    {description && (
                        <p>{description}</p>
                    )}
                </div>

                <span className="category-card__link">
                    Explore
                    <ArrowForward />
                </span>
            </div>
        </article>
    );
};

export default CategoryCard;