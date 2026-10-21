
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
} from "../../services/productService";
import "./Products.scss";
import { getImageUrl } from "../../utils/imageUrl";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts();

        console.log("ADMIN PRODUCTS RESPONSE:", response);

        const productData =
          Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.products)
                ? response.products
                : [];

        console.log("ADMIN PRODUCTS ARRAY:", productData);

        if (!cancelled) {
          setProducts(productData);
        }
      } catch (error) {
        console.error("Failed to load products:", error);

        if (!cancelled) {
          setError(
            error.response?.data?.message ||
            error.message ||
            "Failed to load products"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);
      setError("");

      await deleteProduct(product.id);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item.id !== product.id
        )
      );
    } catch (error) {
      console.error("Failed to delete product:", error);

      setError(
        error.response?.data?.message ||
        "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getProductImage = (product) => {
    if (!product) {
        return null;
    }

    // Your API returns the image here
    if (product.image_url) {
        return product.image_url;
    }

    // Optional fallback for future API responses
    if (Array.isArray(product.images) && product.images.length > 0) {
        const primaryImage = product.images.find(
            (image) =>
                image.is_primary === 1 ||
                image.is_primary === true
        );

        return (
            primaryImage?.image_url ||
            product.images[0]?.image_url ||
            null
        );
    }

    return null;
};

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";

      case "inactive":
        return "Inactive";

      case "out_of_stock":
        return "Out of Stock";

      default:
        return status || "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "status-active";

      case "inactive":
        return "status-inactive";

      case "out_of_stock":
        return "status-out-of-stock";

      default:
        return "";
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = products
      .map((product) => product.category_name)
      .filter(Boolean);

    return [...new Set(uniqueCategories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm) ||
        product.slug?.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        product.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        product.category_name === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const statistics = useMemo(() => {
    const total = products.length;

    const active = products.filter(
      (product) => product.status === "active"
    ).length;

    const outOfStock = products.filter(
      (product) =>
        product.status === "out_of_stock" ||
        Number(product.stock_quantity) === 0
    ).length;

    const featured = products.filter(
      (product) =>
        product.is_featured === 1 ||
        product.is_featured === true
    ).length;

    return {
      total,
      active,
      outOfStock,
      featured,
    };
  }, [products]);

  if (loading) {
    return (
      <section className="products-page">
        <div className="products-loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="products-page">
      {/* Page Header */}
      <div className="products-header">
        <div className="header-content">
          <span className="page-eyebrow">
            STORE MANAGEMENT
          </span>

          <h1>Products</h1>

          <p>
            Manage your products, inventory, pricing and
            availability.
          </p>
        </div>

        <Link
          to="/admin/products/create"
          className="add-product-button"
        >
          <span>+</span>
          Add Product
        </Link>
      </div>

      {/* Statistics */}
      <div className="product-statistics">
        <div className="stat-card">
          <div className="stat-icon products-icon">
            📦
          </div>

          <div>
            <span>Total Products</span>
            <strong>{statistics.total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active-icon">
            ✓
          </div>

          <div>
            <span>Active</span>
            <strong>{statistics.active}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stock-icon">
            ⚠
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>{statistics.outOfStock}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon featured-icon">
            ★
          </div>

          <div>
            <span>Featured</span>
            <strong>{statistics.featured}</strong>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="products-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* Products Card */}
      <div className="products-card">
        <div className="products-toolbar">
          <div className="toolbar-title">
            <h2>All Products</h2>

            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </span>
          </div>

          <div className="toolbar-controls">
            {/* Search */}
            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">
                Inactive
              </option>
              <option value="out_of_stock">
                Out of Stock
              </option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon">📦</div>

            <h2>
              {products.length === 0
                ? "No products yet"
                : "No products found"}
            </h2>

            <p>
              {products.length === 0
                ? "Start building your store by adding your first product."
                : "Try changing your search or filter options."}
            </p>

            {products.length === 0 && (
              <Link
                to="/admin/products/create"
                className="add-product-button"
              >
                <span>+</span>
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>SKU</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>FEATURED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const imageUrl =
                    getProductImage(product);

                  return (
                    <tr key={product.id}>
                      {/* Product */}
                      <td>
                        <div className="product-info">
                          <div className="product-image">
                            {imageUrl ? (
                              <img
                                src={getImageUrl(imageUrl)}
                                alt={product.name}
                                onError={(event) => {
                                  console.error(
                                    "Failed to load product image:",
                                    getImageUrl(imageUrl)
                                  );
                                }}
                              />
                            ) : (
                              <div className="product-image-placeholder">
                                📦
                              </div>
                            )}
                          </div>

                          <div className="product-details">
                            <strong>
                              {product.name}
                            </strong>

                            {product.slug && (
                              <span>
                                /{product.slug}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="category-text">
                          {product.category_name ||
                            "Uncategorized"}
                        </span>
                      </td>

                      {/* SKU */}
                      <td>
                        <span className="product-sku">
                          {product.sku || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <div className="price-wrapper">
                          <strong>
                            ₦
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                          {product.compare_price && (
                            <span className="compare-price">
                              ₦
                              {formatPrice(
                                product.compare_price
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td>
                        <span
                          className={
                            Number(
                              product.stock_quantity
                            ) === 0
                              ? "stock-empty"
                              : "stock-available"
                          }
                        >
                          {product.stock_quantity ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            product.status
                          )}`}
                        >
                          <span className="status-dot"></span>

                          {getStatusLabel(
                            product.status
                          )}
                        </span>
                      </td>

                      {/* Featured */}
                      <td>
                        {product.is_featured ? (
                          <span className="featured-badge">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="not-featured">
                            —
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="product-actions">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="edit-button"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(product)
                            }
                            disabled={
                              deletingId === product.id
                            }
                          >
                            {deletingId === product.id
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
