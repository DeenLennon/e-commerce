
import React from "react";
import { ArrowForward, ShoppingBag } from "@mui/icons-material";
import "./CategoryCard.scss";

const CategoryCard = ({
    category,
    onClick,
    showProductCount = true,
}) => {
    const {
        name,
        image,
        product_count,
        products_count,
        description,
    } = category;

    const productCount =
        product_count ?? products_count ?? 0;

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
                    handleClick();
                }
            }}
        >
            <div className="category-card__image">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        loading="lazy"
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