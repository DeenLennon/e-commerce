
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { createProduct } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import "./CreateProduct.scss";


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

const MAX_IMAGES = 10;

const CreateProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    slug: "",
    sku: "",
    short_description: "",
    description: "",
    price: "",
    compare_price: "",
    stock_quantity: 0,
    status: "active",
    is_featured: false,
  });

  const [images, setImages] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  /*
   * LOAD CATEGORIES
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const response = await getCategories();

        console.log("Categories API response:", response);

        const loadedCategories =
          Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.data?.categories)
                ? response.data.categories
                : Array.isArray(response?.categories)
                  ? response.categories
                  : [];

        console.log("Loaded categories:", loadedCategories);

        setCategories(loadedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);

        setCategories([]);

        setError(
          error.response?.data?.message ||
          "Failed to load categories"
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  /*
   * CLEAN UP PREVIEW URLS WHEN COMPONENT UNMOUNTS
   */
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  /*
   * FORM CHANGE
   */
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
   * GENERATE SLUG
   */
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  /*
   * PRODUCT NAME CHANGE
   */
  const handleNameChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      name: value,
      slug: generateSlug(value),
    }));
  };

  /*
   * ADD PRODUCT IMAGES
   */
  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots =
      MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );

      event.target.value = "";
      return;
    }

    /*
     * Only allow supported image types.
     */
    const validFiles = selectedFiles.filter(
      (file) =>
        [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ].includes(file.type)
    );

    if (validFiles.length === 0) {
      setError(
        "Please select valid JPG, PNG, WEBP or GIF images."
      );

      event.target.value = "";
      return;
    }

    /*
     * Maximum 5MB per image.
     */
    const oversizedFiles = validFiles.filter(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      setError(
        "Each image must be smaller than 5MB."
      );

      event.target.value = "";
      return;
    }

    /*
     * Only take files that fit into the remaining slots.
     */
    const filesToAdd = validFiles.slice(
      0,
      remainingSlots
    );

    const newImages = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: false,
    }));

    setImages((previous) => {
      const combined = [
        ...previous,
        ...newImages,
      ];

      /*Automatically make the first image the primary image.*/
      if (
        combined.length > 0 &&
        !combined.some(
          (image) => image.isPrimary
        )
      ) {
        combined[0].isPrimary = true;
      }

      return combined;
    });

    setError("");

    /*Allows the user to select the same file again.*/
    event.target.value = "";
  };

  /*REMOVE IMAGE*/
  const removeImage = (index) => {
    setImages((previous) => {
      const imageToRemove = previous[index];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(
          imageToRemove.preview
        );
      }

      const updatedImages = previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

      /*If the primary image was removed, make the first remaining image primary.*/
      if (
        updatedImages.length > 0 &&
        !updatedImages.some(
          (image) => image.isPrimary
        )
      ) {
        updatedImages[0].isPrimary = true;
      }

      return updatedImages;
    });
  };

  /*SET PRIMARY IMAGE*/
  const setPrimaryImage = (index) => {
    setImages((previous) =>
      previous.map(
        (image, imageIndex) => ({
          ...image,
          isPrimary:
            imageIndex === index,
        })
      )
    );
  };

  /*CREATE PRODUCT*/
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      /*Basic validation*/
      if (!formData.category_id) {
        setError("Please select a product category.");
        setSaving(false);
        return;
      }

      if (!formData.name.trim()) {
        setError("Please enter a product name.");
        setSaving(false);
        return;
      }

      if (!formData.sku.trim()) {
        setError("Please enter a product SKU.");
        setSaving(false);
        return;
      }

      if (!formData.price) {
        setError("Please enter the product price.");
        setSaving(false);
        return;
      }

      /*Require at least one image.*/
      if (images.length === 0) {
        setError(
          "Please add at least one product image."
        );

        setSaving(false);
        return;
      }

      /*Create multipart FormData.*/
      const data = new FormData();

      /*Product information*/
      data.append(
        "category_id",
        String(Number(formData.category_id))
      );

      data.append(
        "name",
        formData.name
      );

      data.append(
        "slug",
        formData.slug
      );

      data.append(
        "sku",
        formData.sku
      );

      data.append(
        "short_description",
        formData.short_description
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "price",
        String(Number(formData.price))
      );

      if (formData.compare_price !== "") {
        data.append(
          "compare_price",
          String(
            Number(formData.compare_price)
          )
        );
      }

      data.append(
        "stock_quantity",
        String(
          Number(formData.stock_quantity)
        )
      );

      data.append(
        "status",
        formData.status
      );

      data.append(
        "is_featured",
        formData.is_featured
          ? "1"
          : "0"
      );

      /*Tell the backend which uploaded image should become the primary image.*/
      const primaryImageIndex =
        images.findIndex(
          (image) => image.isPrimary
        );

      data.append(
        "primary_image_index",
        String(
          primaryImageIndex >= 0
            ? primaryImageIndex
            : 0
        )
      );

      /*
       * Add images using the field name:
       *
       * images
       *
       * This must match:
       *
       * uploadProductImage.array("images", 10)
       */
      images.forEach((image) => {
        data.append(
          "images",
          image.file
        );
      });

      /*
       * Send multipart request.
       */
      const response =
        await createProduct(data);

      console.log(
        "Create product response:",
        response
      );

      /*
       * Your backend returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: product
       * }
       */
      const productId =
        response?.data?.id ||
        response?.product?.id ||
        response?.id;

      if (!productId) {
        throw new Error(
          "Product ID was not returned by the server."
        );
      }

      /*
       * Revoke preview URLs.
       */
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(
            image.preview
          );
        }
      });

      /*
       * Navigate to product edit page.
       */
      navigate(
        `/admin/products/${productId}/edit`
      );
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to create product"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="create-product-page">
      <div className="create-product-container">

        {/* PAGE HEADER */}
        <div className="create-product-header">
          <div>

            <div className="create-product-breadcrumb">
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/products")
                }
              >
                Products
              </button>

              <span>/</span>

              <span>Create Product</span>
            </div>

            <h1>Create Product</h1>

            <p>
              Add a new product to your TECH STORE catalogue.
            </p>

          </div>

          <button
            type="button"
            className="create-product-cancel"
            onClick={() =>
              navigate("/admin/products")
            }
          >
            Cancel
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="create-product-error">
            <strong>
              Something went wrong
            </strong>

            <span>{error}</span>
          </div>
        )}

        <form
          className="create-product-form"
          onSubmit={handleSubmit}
        >

          {/* LEFT COLUMN */}
          <div className="create-product-main">

            {/* BASIC INFORMATION */}
            <section className="form-card">

              <div className="form-card-header">
                <div>
                  <h2>
                    Basic Information
                  </h2>

                  <p>
                    Provide the basic details of your product.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-field form-field--full">
                  <label htmlFor="name">
                    Product Name
                    <span>*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Samsung Galaxy S25 Ultra"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="slug">
                    Slug
                    <span>*</span>
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="samsung-galaxy-s25-ultra"
                    required
                  />

                  <small>
                    Used in the product URL.
                  </small>
                </div>

                <div className="form-field">
                  <label htmlFor="sku">
                    SKU
                    <span>*</span>
                  </label>

                  <input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="SAM-S25U-256-BLK"
                    required
                  />

                  <small>
                    Unique product identification code.
                  </small>
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="category_id">
                    Category
                    <span>*</span>
                  </label>

                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    disabled={loadingCategories}
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : categories.length === 0
                          ? "No categories available"
                          : "Select a category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={String(
                            category.id
                          )}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                  {!loadingCategories &&
                    categories.length === 0 && (
                      <small>
                        No categories were found.
                        Please create a category first.
                      </small>
                    )}
                </div>

              </div>
            </section>

            {/* PRODUCT IMAGES */}
            <section className="form-card product-images-card">

              <div className="form-card-header">
                <div>
                  <h2>
                    Product Images
                  </h2>

                  <p>
                    Add multiple images of your product.
                    The primary image will appear first.
                  </p>
                </div>

                <span className="image-count">
                  {images.length}/{MAX_IMAGES}
                </span>
              </div>

              {/* UPLOAD AREA */}
              {images.length < MAX_IMAGES && (
                <div className="product-image-upload">

                  <input
                    id="product-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageChange}
                    hidden
                  />

                  <label
                    htmlFor="product-images"
                    className="image-upload-area"
                  >
                    <div className="image-upload-icon">
                      +
                    </div>

                    <strong>
                      Add Product Images
                    </strong>

                    <span>
                      Click to select multiple images
                    </span>

                    <small>
                      JPG, PNG, WEBP or GIF
                      {" • "}
                      Maximum 5MB each
                    </small>
                  </label>

                </div>
              )}

              {/* IMAGE PREVIEWS */}
              {images.length > 0 && (
                <div className="product-images-grid">

                  {images.map(
                    (image, index) => (
                      <div
                        className={`product-image-preview ${image.isPrimary
                          ? "product-image-preview--primary"
                          : ""
                          }`}
                        key={`${image.file.name}-${index}`}
                      >

                        <img
                          src={image.preview}
                          alt={`Product ${index + 1
                            }`}
                        />

                        {/* IMAGE NUMBER */}
                        <span className="product-image-number">
                          {index + 1}
                        </span>

                        {/* PRIMARY BADGE */}
                        {image.isPrimary && (
                          <span className="primary-image-badge">
                            ★ Primary
                          </span>
                        )}

                        {/* REMOVE */}
                        <button
                          type="button"
                          className="remove-product-image"
                          onClick={() =>
                            removeImage(index)
                          }
                          aria-label={`Remove product image ${index + 1
                            }`}
                        >
                          ×
                        </button>

                        {/* MAKE PRIMARY */}
                        {!image.isPrimary && (
                          <button
                            type="button"
                            className="make-primary-button"
                            onClick={() =>
                              setPrimaryImage(
                                index
                              )
                            }
                          >
                            Make Primary
                          </button>
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

              {images.length === 0 && (
                <p className="image-upload-help">
                  Add at least one high-quality
                  product image.
                </p>
              )}

              {images.length > 0 && (
                <p className="image-upload-help">
                  Click <strong>Make Primary</strong>
                  {" "}
                  to choose which image customers
                  see first.
                </p>
              )}

            </section>

            {/* DESCRIPTIONS */}
            <section className="form-card">

              <div className="form-card-header">
                <div>
                  <h2>
                    Product Description
                  </h2>

                  <p>
                    Describe your product and its features.
                  </p>
                </div>
              </div>

              <div className="form-field">
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
              </div>

              <div className="form-field">
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

              </div>

            </section>

            {/* PRICING */}
            <section className="form-card">

              <div className="form-card-header">
                <div>
                  <h2>
                    Pricing & Inventory
                  </h2>

                  <p>
                    Set the product price and available stock.
                  </p>
                </div>
              </div>

              <div className="form-grid">

                <div className="form-field">
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
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
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
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  <small>
                    Original price before discount.
                  </small>
                </div>

                <div className="form-field">
                  <label htmlFor="stock_quantity">
                    Stock Quantity
                  </label>

                  <input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    min="0"
                    value={
                      formData.stock_quantity
                    }
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

              </div>

            </section>

          </div>

          {/* RIGHT COLUMN */}
          <aside className="create-product-sidebar">

            {/* STATUS */}
            <section className="form-card">

              <div className="form-card-header">
                <div>
                  <h2>
                    Product Status
                  </h2>

                  <p>
                    Control product visibility.
                  </p>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <label className="featured-toggle">

                <input
                  type="checkbox"
                  name="is_featured"
                  checked={
                    formData.is_featured
                  }
                  onChange={handleChange}
                />

                <span className="featured-toggle__box">
                  <span />
                </span>

                <span className="featured-toggle__content">
                  <strong>
                    Featured Product
                  </strong>

                  <small>
                    Display this product in featured sections.
                  </small>
                </span>

              </label>

            </section>

            {/* IMAGE SUMMARY */}
            <section className="form-card product-summary">

              <div className="form-card-header">
                <div>
                  <h2>
                    Images
                  </h2>

                  <p>
                    Product gallery information.
                  </p>
                </div>
              </div>

              <div className="summary-row">
                <span>
                  Images
                </span>

                <strong>
                  {images.length}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Primary
                </span>

                <strong>
                  {images.length > 0
                    ? `Image ${images.findIndex(
                      (image) =>
                        image.isPrimary
                    ) + 1
                    }`
                    : "Not selected"}
                </strong>
              </div>

            </section>

            {/* PRODUCT SUMMARY */}
            <section className="form-card product-summary">

              <div className="form-card-header">
                <div>
                  <h2>
                    Product Summary
                  </h2>

                  <p>
                    Review the information before creating.
                  </p>
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
                  {categories.find(
                    (category) =>
                      String(category.id) ===
                      String(
                        formData.category_id
                      )
                  )?.name ||
                    "Not selected"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Price</span>

                <strong>
                  {formData.price
                    ? `₦${Number(
                      formData.price
                    ).toLocaleString()}`
                    : "₦0"}
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
                  className={
                    formData.status ===
                      "active"
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {formData.status ===
                    "active"
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

            </section>

            {/* ACTIONS */}
            <div className="create-product-actions">

              <button
                type="button"
                className="create-product-actions__cancel"
                onClick={() =>
                  navigate(
                    "/admin/products"
                  )
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-product-actions__submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </button>

            </div>

          </aside>

        </form>
      </div>
    </main>
  );
};

export default CreateProduct;