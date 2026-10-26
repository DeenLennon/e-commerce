
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { getImageUrl } from "../../utils/imageUrl";
import "./RecommendedProducts.scss";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

const RecommendedProducts = ({ product }) => {

    const productId = product?.id;
    const categoryId = product?.category_id;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);

    const loaderRef = useRef(null);
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const productIdRef = useRef(null);
    const requestIdRef = useRef(0);

    const loadProducts = useCallback(async (reset = false) => {
        if (!productId) return;

        if (loadingRef.current && !reset) return;
        if (!hasMoreRef.current && !reset) return;

        if (reset) {
            requestIdRef.current += 1;
            pageRef.current = 1;
            hasMoreRef.current = true;
            setProducts([]);
            setHasMore(true);
            setError("");
        }

        const requestId = requestIdRef.current;
        const requestedProductId = productId;
        const requestedPage = pageRef.current;

        loadingRef.current = true;
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/products", {
                params: {
                    page: requestedPage,
                    limit: 11,
                    ...(categoryId != null
                        ? { category_id: categoryId }
                        : {}),
                },
            });

            // Ignore stale responses after changing products.
            if (
                requestId !== requestIdRef.current ||
                String(requestedProductId) !==
                String(productIdRef.current)
            ) {
                return;
            }

            const result = response.data;

            const batch = Array.isArray(result)
                ? result
                : Array.isArray(result?.products)
                    ? result.products
                    : Array.isArray(result?.data)
                        ? result.data
                        : Array.isArray(result?.data?.products)
                            ? result.data.products
                            : [];

            const recommendations = batch.filter(
                (item) =>
                    String(item.id) !== String(requestedProductId)
            );

            setProducts((previous) => {
                const existingIds = new Set(
                    (reset ? [] : previous).map(
                        (item) => String(item.id)
                    )
                );

                return [
                    ...(reset ? [] : previous),
                    ...recommendations.filter((item) => {
                        const id = String(item.id);

                        if (existingIds.has(id)) return false;

                        existingIds.add(id);
                        return true;
                    }),
                ];
            });

            const pagination = result?.pagination;

            const explicitHasMore =
                pagination?.hasMore ??
                pagination?.has_more ??
                result?.hasMore ??
                result?.has_more;

            const more = explicitHasMore != null
                ? Boolean(explicitHasMore)
                : batch.length >= 10;

            hasMoreRef.current = more;
            setHasMore(more);
            pageRef.current = requestedPage + 1;
        } catch (err) {
            if (requestId === requestIdRef.current) {
                setError(
                    err?.response?.data?.message ||
                    "Unable to load recommended products."
                );
            }
        } finally {
            if (requestId === requestIdRef.current) {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    }, [productId, categoryId]);

    useEffect(() => {
        productIdRef.current = productId ?? null;

        loadingRef.current = false;
        pageRef.current = 1;
        hasMoreRef.current = true;

        setProducts([]);
        setLoading(false);
        setHasMore(true);
        setError("");

        if (productId) {
            loadProducts(true);
        }

        return () => {
            requestIdRef.current += 1;
            loadingRef.current = false;
        };
    }, [productId, loadProducts]);

    if (!productId) return null;

    return (
        <section className="recommended-products">
            <div className="recommended-products__heading">
                <div>
                    <h2>You may also like</h2>
                    <p>Discover more products for you.</p>
                </div>
            </div>

            <div className="recommended-products__grid">
                {products.map((item) => {
                    const images = Array.isArray(item.images)
                        ? item.images
                        : [];

                    const primaryImage =
                        images.find(
                            (image) =>
                                Number(image.is_primary) === 1
                        ) || images[0];

                    const rawImage =
                        primaryImage?.image_url ||
                        primaryImage?.url ||
                        item.image_url ||
                        item.featured_image ||
                        item.image;

                    const imageUrl = rawImage
                        ? getImageUrl(rawImage)
                        : "";

                    const price = Number(item.price) || 0;
                    const comparePrice =
                        Number(item.compare_price) || 0;

                    return (
                        <Link
                            key={item.id}
                            to={`/products/${item.slug || item.id}`}
                            className="recommended-card"
                        >
                            <div className="recommended-card__image">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={item.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <span>No image available</span>
                                )}
                            </div>

                            <div className="recommended-card__info">
                                <h3>{item.name}</h3>

                                <strong>
                                    {formatPrice(price)}
                                </strong>

                                {comparePrice > price && (
                                    <div className="recommended-card__old-price">
                                        <del>
                                            {formatPrice(comparePrice)}
                                        </del>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {loading && (
                <p
                    className="recommended-products__message"
                    role="status"
                >
                    Loading more products...
                </p>
            )}

            {error && (
                <div className="recommended-products__message">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => loadProducts()}
                        disabled={loading}
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <p className="recommended-products__message">
                    No recommended products available.
                </p>
            )}

            {!loading && !error && hasMore && products.length > 0 && (
                <div
                    ref={loaderRef}
                    className="recommended-products__loader"
                    aria-hidden="true"
                />
            )}

            {!loading && !hasMore && products.length > 0 && (
                <p className="recommended-products__message">
                    You have reached the end of the recommendations.
                </p>
            )}
        </section>
    );
};

export default RecommendedProducts;
