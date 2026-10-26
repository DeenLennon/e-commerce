
import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    FiArrowLeft,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiLoader,
    FiMinus,
    FiPlus,
    FiShoppingCart,
    FiTruck,
} from "react-icons/fi";

import Header from "../../components/Header/Header";

import {
    getProductBySlug,
} from "../../services/productService";

import {
    addToCart,
} from "../../services/cartService";

import {
    getImageUrl,
} from "../../utils/imageUrl";

import RecommendedProducts from "./RecommendedProducts";

import "./ProductDetails.scss";


const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);

    const [selectedImage, setSelectedImage] =
        useState(0);

    const [addingToCart, setAddingToCart] =
        useState(false);

    const [buyingNow, setBuyingNow] =
        useState(false);


    /*
     * LOAD PRODUCT
     */
    useEffect(() => {
        loadProduct();
    }, [slug]);


    const loadProduct = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getProductBySlug(slug);

            console.log(
                "Product API response:",
                response
            );

            const loadedProduct =
                response?.product ||
                response?.data ||
                response;

            /*from the first image.*/
            setProduct(loadedProduct);

            setQuantity(1);
            setSelectedImage(0);

        } catch (err) {
            console.error(
                "Failed to load product:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Product could not be found."
            );
        } finally {
            setLoading(false);
        }
    };

/*FORMAT PRICE*/
    const formatPrice = (price) => {
        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0,
            }
        ).format(Number(price) || 0);
    };

    const getImages = () => {
        if (!product) {
            return [];
        }

        /* Multiple product images */
        if (
            Array.isArray(product.images) &&
            product.images.length > 0
        ) {

            const productImages =
                product.images
                    .map((image, index) => {

                        /*Backwards compatibility:if API returns strings.*/
                        if (
                            typeof image ===
                            "string"
                        ) {
                            return {
                                id:
                                    `image-${index}`,
                                url:
                                    getImageUrl(
                                        image
                                    ),
                                isPrimary:
                                    index === 0,
                                sortOrder:
                                    index,
                            };
                        }

                        return {
                            id:
                                image.id ||
                                `image-${index}`,

                            url:
                                getImageUrl(
                                    image.image_url ||
                                    image.url
                                ),

                            isPrimary:
                                Boolean(
                                    Number(
                                        image.is_primary
                                    )
                                ),

                            sortOrder:
                                Number(
                                    image.sort_order
                                ) || index,
                        };
                    })
                    .filter(
                        (image) =>
                            Boolean(image.url)
                    );

            /* Sort: 1. Primary image first 2. sort_order 3. original position */
            productImages.sort(
                (a, b) => {

                    if (
                        a.isPrimary &&
                        !b.isPrimary
                    ) {
                        return -1;
                    }

                    if (
                        !a.isPrimary &&
                        b.isPrimary
                    ) {
                        return 1;
                    }

                    return (
                        a.sortOrder -
                        b.sortOrder
                    );
                }
            );


            return productImages;
        }


        /*
         * Fallback for products that only
         * have one image.
         */
        const possibleImage =
            product.image_url ||
            product.featured_image ||
            product.image;


        if (possibleImage) {
            return [
                {
                    id: "featured-image",
                    url:
                        getImageUrl(
                            possibleImage
                        ),
                    isPrimary: true,
                    sortOrder: 0,
                },
            ];
        }


        return [];
    };


    const images = getImages();


    /*
     * STOCK
     */
    const stock = Number(
        product?.stock_quantity || 0
    );


    const isOutOfStock =
        product?.status ===
            "out_of_stock" ||
        stock <= 0;


    /*
     * QUANTITY
     */
    const increaseQuantity = () => {
        if (quantity < stock) {
            setQuantity(
                (current) =>
                    current + 1
            );
        }
    };


    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(
                (current) =>
                    current - 1
            );
        }
    };

    /*
     * ADD TO CART
     */
    const handleAddToCart = async () => {

        if (
            !product ||
            isOutOfStock
        ) {
            return;
        }


        try {
            setAddingToCart(true);


            await addToCart(
                product.id,
                quantity
            );


            alert(
                `${product.name} has been added to your cart.`
            );

        } catch (err) {

            console.error(
                "Add to cart error:",
                err
            );


            alert(
                err?.response?.data?.message ||
                "Unable to add product to cart."
            );

        } finally {

            setAddingToCart(false);
        }
    };

    /*
     * BUY NOW
     */
    const handleBuyNow = async () => {

        if (
            !product ||
            isOutOfStock
        ) {
            return;
        }


        try {

            setBuyingNow(true);


            await addToCart(
                product.id,
                quantity
            );


            navigate("/cart");

        } catch (err) {

            console.error(
                "Buy now error:",
                err
            );


            alert(
                err?.response?.data?.message ||
                "Unable to add product to cart."
            );

        } finally {

            setBuyingNow(false);
        }
    };


    /*
     * NEXT IMAGE
     */
    const nextImage = () => {

        if (images.length <= 1) {
            return;
        }


        setSelectedImage(
            (current) =>
                (current + 1) %
                images.length
        );
    };


    /*
     * PREVIOUS IMAGE
     */
    const previousImage = () => {

        if (images.length <= 1) {
            return;
        }


        setSelectedImage(
            (current) =>
                (
                    current -
                    1 +
                    images.length
                ) %
                images.length
        );
    };


    /*
     * SELECT THUMBNAIL
     */
    const selectImage = (index) => {
        setSelectedImage(index);
    };


    /*
     * LOADING
     */
    if (loading) {
        return (
            <>
                <Header />

                <main className="product-details-page">

                    <div className="product-details-loading">

                        <FiLoader />

                        <p>
                            Loading product...
                        </p>

                    </div>

                </main>
            </>
        );
    }


    /*
     * ERROR
     */
    if (
        error ||
        !product
    ) {
        return (
            <>
                <Header />

                <main className="product-details-page">

                    <div className="product-details-error">

                        <h1>
                            Product Not Found
                        </h1>

                        <p>
                            {error ||
                                "This product does not exist."}
                        </p>

                        <Link to="/products">

                            <FiArrowLeft />

                            Back to Products

                        </Link>

                    </div>

                </main>
            </>
        );
    }


    /*
     * PRICE
     */
    const price =
        Number(product.price) || 0;


    const comparePrice =
        Number(
            product.compare_price
        ) || 0;


    /*
     * DISCOUNT
     */
    const discount =
        comparePrice > price
            ? Math.round(
                (
                    (
                        comparePrice -
                        price
                    ) /
                    comparePrice
                ) *
                100
            )
            : 0;


    /*
     * CURRENT IMAGE
     */
    const currentImage =
        images[selectedImage];


    return (
        <>
            <Header />

            <main className="product-details-page">

                <div className="product-details-container">

                    {/* BREADCRUMB */}

                    <div className="product-details-breadcrumb">

                        <Link to="/">
                            Home
                        </Link>

                        <span>
                            /
                        </span>

                        <Link to="/products">
                            Products
                        </Link>

                        <span>
                            /
                        </span>

                        <span>
                            {product.name}
                        </span>

                    </div>


                    {/* PRODUCT */}

                    <section className="product-details">


                        {/* GALLERY */}

                        <div className="product-gallery">


                            {/* MAIN IMAGE */}
                            <div className="product-gallery__main">


                                {/* DISCOUNT */}
                                {discount > 0 && (
                                    <span className="product-gallery__discount">
                                        -{discount}%
                                    </span>
                                )}


                                {currentImage ? (

                                    <>

                                        <img
                                            src={
                                                currentImage.url
                                            }
                                            alt={
                                                product.name
                                            }
                                            className="product-gallery__main-image"
                                        />


                                        {/* PREVIOUS */}
                                        {images.length >
                                            1 && (
                                                <button
                                                    type="button"
                                                    className="gallery-arrow gallery-arrow--left"
                                                    onClick={
                                                        previousImage
                                                    }
                                                    aria-label="Previous product image"
                                                >
                                                    <FiChevronLeft />
                                                </button>
                                            )}


                                        {/* NEXT */}
                                        {images.length >
                                            1 && (
                                                <button
                                                    type="button"
                                                    className="gallery-arrow gallery-arrow--right"
                                                    onClick={
                                                        nextImage
                                                    }
                                                    aria-label="Next product image"
                                                >
                                                    <FiChevronRight />
                                                </button>
                                            )}


                                        {/* IMAGE COUNTER */}
                                        {images.length >
                                            1 && (
                                                <div className="product-gallery__counter">

                                                    {selectedImage +
                                                        1}

                                                    {" / "}

                                                    {images.length}

                                                </div>
                                            )}

                                    </>

                                ) : (

                                    <div className="product-gallery__placeholder">

                                        <FiShoppingCart />

                                        <span>
                                            No product image
                                        </span>

                                    </div>

                                )}

                            </div>


                            {/* THUMBNAILS */}
                            {images.length >
                                1 && (

                                    <div className="product-gallery__thumbnails">

                                        {images.map(
                                            (
                                                image,
                                                index
                                            ) => (

                                                <button
                                                    type="button"
                                                    key={
                                                        image.id ||
                                                        index
                                                    }
                                                    className={
                                                        selectedImage ===
                                                            index
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        selectImage(
                                                            index
                                                        )
                                                    }
                                                    aria-label={`View product image ${
                                                        index +
                                                        1
                                                    }`}
                                                >

                                                    <img
                                                        src={
                                                            image.url
                                                        }
                                                        alt={`${product.name} ${index + 1}`}
                                                    />

                                                </button>

                                            )
                                        )}

                                    </div>

                                )}

                        </div>


                        {/* PRODUCT INFORMATION */}

                        <div className="product-info">

                            <div className="product-info__category">

                                {product.category_name ||
                                    product.category?.name ||
                                    "Technology"}

                            </div>


                            <h1>
                                {product.name}
                            </h1>


                            <div className="product-info__sku">

                                SKU:{" "}

                                {product.sku ||
                                    "N/A"}

                            </div>


                            {/* PRICE */}
                            <div className="product-info__price">

                                <strong>
                                    {formatPrice(
                                        price
                                    )}
                                </strong>


                                {comparePrice >
                                    price && (
                                        <del>
                                            {formatPrice(
                                                comparePrice
                                            )}
                                        </del>
                                    )}


                                {discount >
                                    0 && (
                                        <span>
                                            {discount}%
                                            {" "}
                                            OFF
                                        </span>
                                    )}

                            </div>


                            {/* STOCK */}
                            <div
                                className={`product-stock ${
                                    isOutOfStock
                                        ? "product-stock--out"
                                        : ""
                                }`}
                            >

                                {isOutOfStock ? (

                                    <>
                                        <span />

                                        Out of Stock
                                    </>

                                ) : (

                                    <>
                                        <span />

                                        In Stock

                                        {stock <=
                                            5 && (
                                                <small>
                                                    {" "}
                                                    — only{" "}
                                                    {stock}{" "}
                                                    left
                                                </small>
                                            )}

                                    </>

                                )}

                            </div>


                            {/* SHORT DESCRIPTION */}
                            {product.short_description && (

                                <p className="product-info__short-description">

                                    {
                                        product.short_description
                                    }

                                </p>

                            )}


                            {/* QUANTITY */}
                            {!isOutOfStock && (

                                <div className="product-purchase">

                                    <div className="quantity-control">

                                        <button
                                            type="button"
                                            onClick={
                                                decreaseQuantity
                                            }
                                            disabled={
                                                quantity <=
                                                1
                                            }
                                        >
                                            <FiMinus />
                                        </button>


                                        <span>
                                            {quantity}
                                        </span>


                                        <button
                                            type="button"
                                            onClick={
                                                increaseQuantity
                                            }
                                            disabled={
                                                quantity >=
                                                stock
                                            }
                                        >
                                            <FiPlus />
                                        </button>

                                    </div>


                                    <span className="quantity-label">
                                        Quantity
                                    </span>

                                </div>

                            )}


                            {/* ACTIONS */}
                            <div className="product-actions">

                                <button
                                    type="button"
                                    className="product-actions__cart"
                                    disabled={
                                        isOutOfStock ||
                                        addingToCart ||
                                        buyingNow
                                    }
                                    onClick={
                                        handleAddToCart
                                    }
                                >

                                    {addingToCart ? (

                                        <>
                                            <FiLoader className="spin" />

                                            Adding...
                                        </>

                                    ) : (

                                        <>
                                            <FiShoppingCart />

                                            Add to Cart
                                        </>

                                    )}

                                </button>


                                <button
                                    type="button"
                                    className="product-actions__buy"
                                    disabled={
                                        isOutOfStock ||
                                        addingToCart ||
                                        buyingNow
                                    }
                                    onClick={
                                        handleBuyNow
                                    }
                                >

                                    {buyingNow ? (

                                        <>
                                            <FiLoader className="spin" />

                                            Processing...
                                        </>

                                    ) : (

                                        "Buy Now"

                                    )}

                                </button>

                            </div>


                            {/* DELIVERY */}
                            <div className="product-delivery">


                                <div>

                                    <FiTruck />

                                    <div>

                                        <strong>
                                            Delivery
                                        </strong>

                                        <span>
                                            Delivery
                                            options
                                            available at
                                            checkout.
                                        </span>

                                    </div>

                                </div>


                                <div>

                                    <FiCheck />

                                    <div>

                                        <strong>
                                            Secure
                                            Shopping
                                        </strong>

                                        <span>
                                            Your payment
                                            information is
                                            protected.
                                        </span>

                                    </div>

                                </div>


                            </div>

                        </div>

                    </section>


                    {/* DESCRIPTION */}

                    <section className="product-description">

                        <h2>
                            Product details
                        </h2>

                        <div>

                            {product.description ? (

                                <p>
                                    {
                                        product.description
                                    }
                                </p>

                            ) : (

                                <p>
                                    No detailed
                                    description is
                                    available for this
                                    product.
                                </p>

                            )}

                        </div>

                    </section>

                     {/* RECOMMENDED PRODUCTS WITH INFINITE SCROLL */}

                    <RecommendedProducts product={product} />

                </div>

            </main>
        </>
    );
};


export default ProductDetails;