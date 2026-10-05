import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ProductImages.scss";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SERVER_URL = API_URL.replace("/api", "");

const ProductImages = ({ productId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    return `${SERVER_URL}${imageUrl}`;
  };

  const fetchImages = async () => {
    if (!productId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/products/${productId}/images`,
        {
          withCredentials: true,
        }
      );

      setImages(response.data.data || []);
    } catch (err) {
      console.error("Fetch product images error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load product images"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        const formData = new FormData();

        formData.append("image", file);

        await axios.post(
          `${API_URL}/products/${productId}/images`,
          formData,
          {
            withCredentials: true,
          }
        );
      }

      await fetchImages();
    } catch (err) {
      console.error("Upload product image error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to upload product image"
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      setError("");

      await axios.put(
        `${API_URL}/products/${productId}/images/${imageId}/primary`,
        {},
        {
          withCredentials: true,
        }
      );

      await fetchImages();
    } catch (err) {
      console.error("Set primary image error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to set primary image"
      );
    }
  };

  const handleDelete = async (imageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axios.delete(
        `${API_URL}/products/${productId}/images/${imageId}`,
        {
          withCredentials: true,
        }
      );

      await fetchImages();
    } catch (err) {
      console.error("Delete product image error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete product image"
      );
    }
  };

  if (!productId) {
    return (
      <div className="product-images empty-state">
        <p>
          Save the product first before uploading images.
        </p>
      </div>
    );
  }

  return (
    <section className="product-images">
      <div className="product-images__header">
        <div>
          <h2>Product Images</h2>

          <p>
            Upload product images and select the primary
            image used throughout the store.
          </p>
        </div>

        <button
          type="button"
          className="product-images__upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={handleUpload}
        />
      </div>

      {error && (
        <div className="product-images__error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="product-images__loading">
          Loading images...
        </div>
      ) : images.length === 0 ? (
        <div className="product-images__empty">
          <p>No images have been uploaded yet.</p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Upload First Image
          </button>
        </div>
      ) : (
        <div className="product-images__grid">
          {images.map((image) => (
            <article
              key={image.id}
              className={`product-image ${
                image.is_primary
                  ? "product-image--primary"
                  : ""
              }`}
            >
              <div className="product-image__preview">
                <img
                  src={getImageUrl(image.image_url)}
                  alt="Product"
                />

                {Boolean(image.is_primary) && (
                  <span className="product-image__badge">
                    Primary
                  </span>
                )}
              </div>

              <div className="product-image__actions">
                {!image.is_primary && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSetPrimary(image.id)
                    }
                  >
                    Set Primary
                  </button>
                )}

                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    handleDelete(image.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductImages;