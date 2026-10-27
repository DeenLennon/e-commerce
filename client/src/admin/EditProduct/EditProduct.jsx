import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  getProductById,
  updateProduct,
} from "../../services/productService";

import { getCategories } from "../../services/categoryService";

import "./EditProduct.scss";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";


/* Register available font families */
const Font = Quill.import("formats/font");

Font.whitelist = [
  "arial",
  "times-new-roman",
  "georgia",
  "verdana",
  "tahoma",
  "courier-new",
];

Quill.register(Font, true);

/* Register available font sizes */
const Size = Quill.import("attributors/style/size");

Size.whitelist = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
];

Quill.register(Size, true);


const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    slug: "",
    sku: "",
    short_description: "",
    description: "",
    price: "",
    compare_price: "",
    stock_quantity: "",
    status: "active",
    is_featured: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* LOAD PRODUCT */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productResponse,
          categoriesResponse,
        ] = await Promise.all([
          getProductById(id),
          getCategories(),
        ]);

        console.log(
          "Product API response:",
          productResponse
        );

        console.log(
          "Categories API response:",
          categoriesResponse
        );

        const productData =
          productResponse?.data;

        const categoryData =
          categoriesResponse?.categories || [];

        if (!productData) {
          throw new Error(
            "Product data was not returned by the server."
          );
        }

        setProduct(productData);
        setCategories(categoryData);

        /*
         * Load existing images.
         */
        const productImages =
          Array.isArray(productData.images)
            ? productData.images
            : [];

        setImages(productImages);

        setFormData({
          category_id:
            productData.category_id ?? "",

          name:
            productData.name ?? "",

          slug:
            productData.slug ?? "",

          sku:
            productData.sku ?? "",

          short_description:
            productData.short_description ?? "",

          description:
            productData.description ?? "",

          price:
            productData.price ?? "",

          compare_price:
            productData.compare_price ?? "",

          stock_quantity:
            productData.stock_quantity ?? "",

          status:
            productData.status ?? "active",

          is_featured:
            Boolean(productData.is_featured),
        });
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );

        setError(
          error.response?.data?.message ||
          error.message ||
          "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  /* FORM CHANGE */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const totalImages =
      images.length + newImages.length;

    const remainingSlots =
      10 - totalImages;

    if (remainingSlots <= 0) {
      setError(
        "You can have a maximum of 10 product images."
      );

      event.target.value = "";
      return;
    }

    const imageFiles = selectedFiles
      .filter((file) =>
        file.type.startsWith("image/")
      )
      .slice(0, remainingSlots);

    if (imageFiles.length === 0) {
      setError(
        "Please select valid image files."
      );

      event.target.value = "";
      return;
    }

    if (
      selectedFiles.length > remainingSlots
    ) {
      setError(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"
        } can be added.`
      );
    } else {
      setError("");
    }

    const preparedImages =
      imageFiles.map((file) => ({
        file,
        preview:
          URL.createObjectURL(file),

        /* New images are not primary by default. The user can select one below. */
        isPrimary: false,
      }));

    setNewImages((previous) => [
      ...previous,
      ...preparedImages,
    ]);

    event.target.value = "";
  };


  /* REMOVE PENDING IMAGE */

  const removeNewImage = (index) => {
    setNewImages((previous) => {
      const imageToRemove =
        previous[index];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(
          imageToRemove.preview
        );
      }

      const updatedImages =
        previous.filter(
          (_, imageIndex) =>
            imageIndex !== index
        );

      /* If the removed image was primary, automatically make the first remaining new image primary. */
      if (
        imageToRemove?.isPrimary &&
        updatedImages.length > 0
      ) {
        updatedImages[0] = {
          ...updatedImages[0],
          isPrimary: true,
        };

        setImages((previousImages) =>
          previousImages.map(
            (image) => ({
              ...image,
              is_primary: 0,
            })
          )
        );
      }

      return updatedImages;
    });
  };

  const handleSetPrimary = async (
    imageId
  ) => {
    try {
      setImageSaving(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_BASE_URL}/api/products/${id}/images/${imageId}/primary`,
          {
            method: "PUT",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to set primary image."
        );
      }

      setImages((previous) =>
        previous.map((image) => ({
          ...image,

          is_primary:
            Number(image.id) ===
              Number(imageId)
              ? 1
              : 0,
        }))
      );

      setNewImages((previous) =>
        previous.map((image) => ({
          ...image,
          isPrimary: false,
        }))
      );

      setSuccess(
        "Primary image updated successfully."
      );
    } catch (error) {
      console.error(
        "Set primary image error:",
        error
      );

      setError(
        error.message ||
        "Failed to set primary image."
      );
    } finally {
      setImageSaving(false);
    }
  };

  const handleSetNewImagePrimary = (
    index
  ) => {

    setImages((previous) =>
      previous.map((image) => ({
        ...image,
        is_primary: 0,
      }))
    );

    setNewImages((previous) =>
      previous.map((image, imageIndex) => ({
        ...image,
        isPrimary:
          imageIndex === index,
      }))
    );

    setError("");
    setSuccess("");
  };

  /* DELETE EXISTING IMAGE */

  const handleDeleteImage = async (
    imageId
  ) => {
    const imageToDelete =
      images.find(
        (image) =>
          Number(image.id) ===
          Number(imageId)
      );

    if (!imageToDelete) {
      return;
    }

    /*
     * Never allow the current primary image to be deleted until another image becomes primary.
     */
    if (
      Number(imageToDelete.is_primary) ===
      1
    ) {
      setError(
        "You cannot delete the primary image. Set another image as primary first."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this image?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setImageSaving(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `${API_BASE_URL}/api/products/${id}/images/${imageId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to delete image."
        );
      }

      setImages((previous) =>
        previous.filter(
          (image) =>
            Number(image.id) !==
            Number(imageId)
        )
      );

      setSuccess(
        "Product image deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete image error:",
        error
      );

      setError(
        error.message ||
        "Failed to delete image."
      );
    } finally {
      setImageSaving(false);
    }
  };

  const uploadNewImages = async () => {
    if (newImages.length === 0) {
      return null;
    }

    const data = new FormData();

    newImages.forEach((image) => {
      data.append(
        "images",
        image.file
      );
    });

    /*
     * Determine which newly uploaded image
     * should become primary.
     *
     * -1 means none of the new images
     * should become primary.
     */
    const primaryNewImageIndex =
      newImages.findIndex(
        (image) =>
          image.isPrimary === true
      );

    data.append(
      "primary_image_index",
      String(primaryNewImageIndex)
    );

    const response =
      await fetch(
        `${API_BASE_URL}/api/products/${id}/images`,
        {
          method: "POST",
          credentials: "include",
          body: data,
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
        "Failed to upload product images."
      );
    }

    return result;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * Determine whether a newly selected
       * image has been chosen as primary.
       */
      const newPrimaryIndex =
        newImages.findIndex(
          (image) =>
            image.isPrimary === true
        );

      /*
       * If there is no new primary image,
       * make sure an existing image remains
       * primary.
       */
      const hasExistingPrimary =
        images.some(
          (image) =>
            Number(image.is_primary) === 1
        );

      if (
        images.length === 0 &&
        newImages.length === 0
      ) {
        setError(
          "Please add at least one product image."
        );

        setSaving(false);
        return;
      }

      if (
        newPrimaryIndex === -1 &&
        !hasExistingPrimary &&
        images.length > 0
      ) {
        /*
         * The first existing image becomes
         * primary when no primary exists.
         *
         * This is handled locally first.
         */
        setImages((previous) =>
          previous.map(
            (image, index) => ({
              ...image,
              is_primary:
                index === 0 ? 1 : 0,
            })
          )
        );
      }

      /*
       * Prepare product information.
       */
      const productData = {
        ...formData,

        category_id:
          Number(formData.category_id),

        price:
          Number(formData.price),

        compare_price:
          formData.compare_price === ""
            ? null
            : Number(
              formData.compare_price
            ),

        stock_quantity:
          formData.stock_quantity === ""
            ? 0
            : Number(
              formData.stock_quantity
            ),

        is_featured:
          Boolean(
            formData.is_featured
          ),
      };

      /*
       * Update product information first.
       */
      const response =
        await updateProduct(
          id,
          productData
        );

      /*
       * Upload any newly selected images.
       */
      if (newImages.length > 0) {
        setImageSaving(true);

        await uploadNewImages();

        /*
         * Release preview URLs.
         */
        newImages.forEach((image) => {
          if (image.preview) {
            URL.revokeObjectURL(
              image.preview
            );
          }
        });

        setNewImages([]);
      }

      /*
       * Reload the product from the server.
       */
      const refreshedResponse =
        await getProductById(id);

      const refreshedProduct =
        refreshedResponse?.data;

      if (refreshedProduct) {
        setProduct(
          refreshedProduct
        );

        setImages(
          Array.isArray(
            refreshedProduct.images
          )
            ? refreshedProduct.images
            : []
        );

        setFormData({
          category_id:
            refreshedProduct.category_id ??
            "",

          name:
            refreshedProduct.name ??
            "",

          slug:
            refreshedProduct.slug ??
            "",

          sku:
            refreshedProduct.sku ??
            "",

          short_description:
            refreshedProduct.short_description ??
            "",

          description:
            refreshedProduct.description ??
            "",

          price:
            refreshedProduct.price ??
            "",

          compare_price:
            refreshedProduct.compare_price ??
            "",

          stock_quantity:
            refreshedProduct.stock_quantity ??
            "",

          status:
            refreshedProduct.status ??
            "active",

          is_featured:
            Boolean(
              refreshedProduct.is_featured
            ),
        });
      }

      setSuccess(
        response?.message ||
        "Product updated successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to update product"
      );
    } finally {
      setSaving(false);
      setImageSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CLEANUP PREVIEW URLS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      newImages.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });
    };
  }, [newImages]);

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const selectedCategory =
    categories.find(
      (category) =>
        String(category.id) ===
        String(formData.category_id)
    );

  const formatPrice = (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return "₦0";
    }

    return `₦${Number(
      value
    ).toLocaleString("en-NG")}`;
  };

  const primaryImage =
    images.find(
      (image) =>
        Number(image.is_primary) === 1
    ) || images[0];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="edit-product-page">
        <div className="edit-product-loading">
          <div className="loading-spinner" />

          <h2>Loading Product</h2>

          <p>
            Please wait while we load the
            product information...
          </p>
        </div>
      </main>
    );
  }

  /* PRODUCT NOT FOUND */

  if (!product) {
    return (
      <main className="edit-product-page">
        <div className="edit-product-error-page">
          <div className="error-icon">!</div>

          <h1>Product Not Found</h1>

          <p>
            {error ||
              "The product you are looking for could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <main className="edit-product-page">
      <div className="edit-product-container">

        {/* HEADER */}
        <header className="edit-product-header">
          <div>
            <div className="edit-product-breadcrumb">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/products"
                  )
                }
              >
                Products
              </button>

              <span>/</span>

              <span>Edit Product</span>
            </div>

            <h1>Edit Product</h1>

            <p>
              Update the information, images
              and settings for this product.
            </p>
          </div>

          <button
            type="button"
            className="edit-product-back"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            disabled={saving}
          >
            Back to Products
          </button>
        </header>

        {/* ALERTS */}

        {error && (
          <div className="edit-product-alert edit-product-alert--error">
            <div className="alert-icon">!</div>

            <div>
              <strong>
                Something went wrong
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="edit-product-alert edit-product-alert--success">
            <div className="alert-icon">✓</div>

            <div>
              <strong>
                Changes saved
              </strong>

              <span>{success}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              ×
            </button>
          </div>
        )}

        <form
          className="edit-product-form"
          onSubmit={handleSubmit}
        >

          {/* LEFT COLUMN */}

          <div className="edit-product-main">

            {/* BASIC INFORMATION */}

            <section className="edit-form-card">
              <div className="edit-form-card-header">
                <div>
                  <span className="section-number">
                    01
                  </span>

                  <div>
                    <h2>
                      Basic Information
                    </h2>

                    <p>
                      Update the basic details
                      of your product.
                    </p>
                  </div>
                </div>
              </div>

              <div className="edit-form-grid">

                {/* NAME */}

                <div className="edit-form-field edit-form-field--full">
                  <label htmlFor="name">
                    Product Name
                    <span>*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Samsung Galaxy S25 Ultra"
                    required
                  />
                </div>

                {/* SLUG */}

                <div className="edit-form-field">
                  <label htmlFor="slug">
                    Slug
                    <span>*</span>
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={
                      formData.slug
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="samsung-galaxy-s25-ultra"
                    required
                  />

                  <small>
                    Used in the product URL.
                  </small>
                </div>

                {/* SKU */}

                <div className="edit-form-field">
                  <label htmlFor="sku">
                    SKU
                    <span>*</span>
                  </label>

                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={
                      formData.sku
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="SAM-S25U-256-BLK"
                    required
                  />

                  <small>
                    Unique product
                    identification code.
                  </small>
                </div>

                {/* CATEGORY */}

                <div className="edit-form-field edit-form-field--full">
                  <label htmlFor="category_id">
                    Category
                    <span>*</span>
                  </label>

                  <select
                    id="category_id"
                    name="category_id"
                    value={
                      formData.category_id
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="">
                      Select a category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>
            </section>

            {/* PRODUCT IMAGES */}

            <section className="edit-form-card product-images-card">

              <div className="edit-form-card-header">
                <div>
                  <span className="section-number">
                    02
                  </span>

                  <div>
                    <h2>
                      Product Images
                    </h2>

                    <p>
                      Manage product images
                      and choose the primary
                      image.
                    </p>
                  </div>
                </div>

                <span className="image-count">
                  {images.length +
                    newImages.length}
                  /10
                </span>
              </div>

              {/* PRIMARY IMAGE */}

              {primaryImage && (
                <div className="primary-image-preview">

                  <div className="primary-image-preview__image">
                    <img
                      src={getImageUrl(
                        primaryImage.image_url
                      )}
                      alt={
                        product.name
                      }
                    />
                  </div>

                  <div className="primary-image-preview__content">
                    <span className="primary-image-label">
                      ★ Primary Image
                    </span>

                    <strong>
                      This image is displayed
                      as the main product
                      image.
                    </strong>

                    <small>
                      You can change the
                      primary image by
                      selecting another
                      image below.
                    </small>
                  </div>

                </div>
              )}

              {/* EXISTING IMAGES */}

              {images.length > 0 && (
                <div className="product-images-grid">

                  {images.map(
                    (image, index) => {
                      const isPrimary =
                        Number(
                          image.is_primary
                        ) === 1;

                      return (
                        <div
                          key={
                            image.id
                          }
                          className={`product-image-preview ${isPrimary
                            ? "product-image-preview--primary"
                            : ""
                            }`}
                        >

                          <img
                            src={getImageUrl(
                              image.image_url
                            )}
                            alt={`${product.name} ${index + 1
                              }`}
                          />

                          {isPrimary && (
                            <span className="primary-image-badge">
                              ★ Primary
                            </span>
                          )}

                          <div className="product-image-actions">

                            {!isPrimary && (
                              <button
                                type="button"
                                className="make-primary-button"
                                onClick={() =>
                                  handleSetPrimary(
                                    image.id
                                  )
                                }
                                disabled={
                                  imageSaving ||
                                  saving
                                }
                              >
                                Make Primary
                              </button>
                            )}

                            {!isPrimary && (
                              <button
                                type="button"
                                className="remove-product-image"
                                onClick={() =>
                                  handleDeleteImage(
                                    image.id
                                  )
                                }
                                disabled={
                                  imageSaving ||
                                  saving
                                }
                                aria-label="Delete image"
                              >
                                ×
                              </button>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

              {/* UPLOAD AREA */}

              <div className="product-image-upload">

                <input
                  id="edit-product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  hidden
                />

                <label
                  htmlFor="edit-product-images"
                  className="image-upload-area"
                >
                  <div className="image-upload-icon">
                    +
                  </div>

                  <strong>
                    Add More Images
                  </strong>

                  <span>
                    Select multiple
                    product images
                  </span>

                  <small>
                    JPG, PNG, WEBP or GIF
                    • Maximum 10 images
                  </small>
                </label>

              </div>

              {/* NEW IMAGE PREVIEWS */}

              {newImages.length > 0 && (
                <div className="new-images-section">

                  <div className="new-images-header">
                    <strong>
                      Images waiting to
                      upload
                    </strong>

                    <span>
                      {newImages.length}
                    </span>
                  </div>

                  <div className="product-images-grid">

                    {newImages.map(
                      (image, index) => (
                        <div
                          className={`product-image-preview product-image-preview--new ${image.isPrimary
                            ? "product-image-preview--primary"
                            : ""
                            }`}
                          key={`${image.file.name}-${index}`}
                        >
                          <img
                            src={image.preview}
                            alt={`New product ${index + 1
                              }`}
                          />

                          {image.isPrimary && (
                            <span className="primary-image-badge">
                              ★ Primary
                            </span>
                          )}

                          <span className="new-image-badge">
                            New
                          </span>

                          <div className="product-image-actions">
                            {!image.isPrimary && (
                              <button
                                type="button"
                                className="make-primary-button"
                                onClick={() =>
                                  handleSetNewImagePrimary(
                                    index
                                  )
                                }
                                disabled={
                                  saving ||
                                  imageSaving
                                }
                              >
                                Make Primary
                              </button>
                            )}

                            <button
                              type="button"
                              className="remove-product-image"
                              onClick={() =>
                                removeNewImage(index)
                              }
                              disabled={saving}
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {images.length === 0 &&
                newImages.length ===
                0 && (
                  <p className="image-upload-help">
                    This product does not
                    have any images yet.
                    Add at least one
                    product image.
                  </p>
                )}

            </section>

            {/* DESCRIPTION */}

            <section className="edit-form-card">
              <div className="edit-form-card-header">
                <div>
                  <span className="section-number">
                    03
                  </span>

                  <div>
                    <h2>
                      Product Description
                    </h2>

                    <p>
                      Update the product
                      content and details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="edit-form-field">
                <label htmlFor="short_description">
                  Short Description
                </label>

                <ReactQuill
                  theme="snow"
                  value={formData.short_description}
                  onChange={(value) => {
                    setFormData((previous) => ({
                      ...previous,
                      short_description: value,
                    }));

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Write a brief product summary..."
                  modules={{
                    toolbar: [
                      [{ font: Font.whitelist }],
                      [{ size: Size.whitelist }],
                      [{ header: [2, 3, 4, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      [{ align: [] }],
                      ["link", "clean"],
                    ],
                  }}
                  formats={[
                    "font",
                    "size",
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "color",
                    "background",
                    "list",
                    "bullet",
                    "align",
                    "link",
                  ]}
                />

                <small>
                  A brief, formatted description shown in product listings.
                </small>
              </div>


              <div className="edit-form-field edit-description-field">
                <label htmlFor="description">
                  Full Description
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) => {
                    setFormData((previous) => ({
                      ...previous,
                      description: value,
                    }));

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Write a detailed product description..."
                  modules={{
                    toolbar: [
                      [{ font: Font.whitelist }],
                      [{ size: Size.whitelist }],
                      [{ header: [2, 3, 4, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      [{ align: [] }],
                      ["link", "clean"],
                    ],
                  }}
                  formats={[
                    "font",
                    "size",
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "color",
                    "background",
                    "list",
                    "bullet",
                    "align",
                    "link",
                  ]}
                />

                <small>
                  Your full product description will be saved when you click Save Changes.
                </small>
              </div>

            </section>

            {/* PRICING */}

            <section className="edit-form-card">
              <div className="edit-form-card-header">
                <div>
                  <span className="section-number">
                    04
                  </span>

                  <div>
                    <h2>
                      Pricing & Inventory
                    </h2>

                    <p>
                      Manage pricing and
                      available stock.
                    </p>
                  </div>
                </div>
              </div>

              <div className="edit-form-grid">

                {/* PRICE */}

                <div className="edit-form-field">
                  <label htmlFor="price">
                    Selling Price
                    <span>*</span>
                  </label>

                  <div className="input-with-prefix">
                    <span>₦</span>

                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        formData.price
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* COMPARE PRICE */}

                <div className="edit-form-field">
                  <label htmlFor="compare_price">
                    Compare Price
                  </label>

                  <div className="input-with-prefix">
                    <span>₦</span>

                    <input
                      id="compare_price"
                      name="compare_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        formData.compare_price
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <small>
                    Original price before
                    discount.
                  </small>
                </div>

                {/* STOCK */}

                <div className="edit-form-field">
                  <label htmlFor="stock_quantity">
                    Stock Quantity
                  </label>

                  <input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      formData.stock_quantity
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                  />
                </div>

              </div>
            </section>

          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="edit-product-sidebar">

            {/* STATUS */}

            <section className="edit-form-card">

              <div className="edit-form-card-header">
                <div>
                  <span className="section-number">
                    05
                  </span>

                  <div>
                    <h2>
                      Product Status
                    </h2>

                    <p>
                      Control product
                      visibility.
                    </p>
                  </div>
                </div>
              </div>

              <div className="edit-form-field">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="out_of_stock">
                    Out of Stock
                  </option>
                </select>
              </div>

              {/* FEATURED */}

              <label className="featured-toggle">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={
                    formData.is_featured
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="featured-toggle__box">
                  <span />
                </span>

                <span className="featured-toggle__content">
                  <strong>
                    Featured Product
                  </strong>

                  <small>
                    Display this product
                    in featured sections.
                  </small>
                </span>
              </label>

            </section>

            {/* SUMMARY */}

            <section className="edit-form-card product-summary">

              <div className="edit-form-card-header">
                <div>
                  <span className="section-number">
                    06
                  </span>

                  <div>
                    <h2>
                      Product Summary
                    </h2>

                    <p>
                      Current product
                      information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="summary-row">
                <span>Name</span>

                <strong>
                  {formData.name ||
                    "Not provided"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Category</span>

                <strong>
                  {selectedCategory?.name ||
                    "Not selected"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Images</span>

                <strong>
                  {images.length +
                    newImages.length}
                </strong>
              </div>

              <div className="summary-row">
                <span>Price</span>

                <strong>
                  {formatPrice(
                    formData.price
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>Stock</span>

                <strong>
                  {formData.stock_quantity ||
                    0}
                </strong>
              </div>

              <div className="summary-row">
                <span>Status</span>

                <strong
                  className={`status-badge status-badge--${formData.status}`}
                >
                  {formData.status ===
                    "out_of_stock"
                    ? "Out of Stock"
                    : formData.status ===
                      "active"
                      ? "Active"
                      : "Inactive"}
                </strong>
              </div>

            </section>

            {/* ACTIONS */}

            <div className="edit-product-actions">

              <button
                type="button"
                className="edit-product-actions__cancel"
                onClick={() =>
                  navigate(
                    "/admin/products"
                  )
                }
                disabled={
                  saving ||
                  imageSaving
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="edit-product-actions__submit"
                disabled={
                  saving ||
                  imageSaving
                }
              >
                {saving ||
                  imageSaving ? (
                  <>
                    <span className="button-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Save Changes
                  </>
                )}
              </button>

            </div>

          </aside>
        </form>
      </div>
    </main>
  );
};

export default EditProduct;