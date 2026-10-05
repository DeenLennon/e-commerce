const {
  createProduct,
  findProductById,
  findProductBySlug,
  findProductBySku,
  getProducts: getProductsFromModel,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../models/productModel");

const {
  findCategoryById,
} = require("../models/categoryModel");

const imageService = require("../services/imageService");

// ============================================================
// GET /api/products
// ============================================================
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      sort = "latest",
    } = req.query;

    const result = await getProductsFromModel({
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice,
      sort,
    });

    return res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// ============================================================
// GET /api/products/:id
// ============================================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await findProductById(Number(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
};

// ============================================================
// GET /api/products/slug/:slug
// ============================================================
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product slug is required",
      });
    }

    const product = await findProductBySlug(
      slug.trim().toLowerCase()
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product by slug error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
    });
  }
};

// ============================================================
// POST /api/products
// ============================================================
const createNewProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      sku,
      short_description,
      description,
      price,
      compare_price,
      stock_quantity,
      status,
      is_featured,
    } = req.body;

    // --------------------------------------------------------
    // Required fields
    // --------------------------------------------------------

    if (
      !category_id ||
      !name ||
      !slug ||
      !sku ||
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category, name, slug, SKU and price are required",
      });
    }

    // --------------------------------------------------------
    // Normalize values
    // --------------------------------------------------------

    const normalizedCategoryId = Number(category_id);
    const normalizedPrice = Number(price);

    const normalizedComparePrice =
      compare_price === undefined ||
      compare_price === null ||
      compare_price === ""
        ? null
        : Number(compare_price);

    const normalizedStockQuantity =
      stock_quantity === undefined ||
      stock_quantity === null ||
      stock_quantity === ""
        ? 0
        : Number(stock_quantity);

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedSku = sku.trim();

    // --------------------------------------------------------
    // Validate category
    // --------------------------------------------------------

    if (
      !Number.isInteger(normalizedCategoryId) ||
      normalizedCategoryId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // --------------------------------------------------------
    // Validate price
    // --------------------------------------------------------

    if (
      Number.isNaN(normalizedPrice) ||
      normalizedPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid non-negative number",
      });
    }

    // --------------------------------------------------------
    // Validate compare price
    // --------------------------------------------------------

    if (
      normalizedComparePrice !== null &&
      (Number.isNaN(normalizedComparePrice) ||
        normalizedComparePrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Compare price must be a valid non-negative number",
      });
    }

    // --------------------------------------------------------
    // Validate stock
    // --------------------------------------------------------

    if (
      !Number.isInteger(normalizedStockQuantity) ||
      normalizedStockQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity must be a non-negative integer",
      });
    }

    // --------------------------------------------------------
    // Validate status
    // --------------------------------------------------------

    const allowedStatuses = [
      "active",
      "inactive",
      "out_of_stock",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
      });
    }

    // --------------------------------------------------------
    // Determine final status
    // --------------------------------------------------------

    let normalizedStatus = status || "active";

    if (normalizedStockQuantity === 0) {
      normalizedStatus = "out_of_stock";
    }

    // --------------------------------------------------------
    // Check category
    // --------------------------------------------------------

    const category = await findCategoryById(
      normalizedCategoryId
    );

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // --------------------------------------------------------
    // Check duplicate slug
    // --------------------------------------------------------

    const existingSlug =
      await findProductBySlug(normalizedSlug);

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "Product slug already exists",
      });
    }

    // --------------------------------------------------------
    // Check duplicate SKU
    // --------------------------------------------------------

    const existingSku =
      await findProductBySku(normalizedSku);

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: "Product SKU already exists",
      });
    }

    // --------------------------------------------------------
    // Create product
    // --------------------------------------------------------

    const productId = await createProduct({
      category_id: normalizedCategoryId,
      name: normalizedName,
      slug: normalizedSlug,
      sku: normalizedSku,
      short_description,
      description,
      price: normalizedPrice,
      compare_price: normalizedComparePrice,
      stock_quantity: normalizedStockQuantity,
      status: normalizedStatus,
      is_featured:
        is_featured === true ||
        is_featured === "true" ||
        is_featured === "1",
    });

    // --------------------------------------------------------
    // Process uploaded product images
    // --------------------------------------------------------

    const uploadedFiles = req.files || [];

    try {
      for (
        let index = 0;
        index < uploadedFiles.length;
        index++
      ) {
        const file = uploadedFiles[index];

        await imageService.createProductImage({
          productId,
          file,

          // First uploaded image is primary
          isPrimary: index === 0,

          // Preserve upload order
          sortOrder: index,
        });
      }
    } catch (imageError) {
      console.error(
        "Product image processing error:",
        imageError
      );

      // Clean up all uploaded files
      for (const file of uploadedFiles) {
        try {
          const fs = require("fs");
          const path = require("path");

          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "products",
            file.filename
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(
            "Image cleanup error:",
            cleanupError
          );
        }
      }

      // Remove product if image processing fails
      try {
        await deleteProduct(productId);
      } catch (deleteError) {
        console.error(
          "Product rollback error:",
          deleteError
        );
      }

      return res.status(500).json({
        success: false,
        message:
          "Product was not created because the images could not be saved.",
      });
    }

    // --------------------------------------------------------
    // Retrieve created product with images
    // --------------------------------------------------------

    const product =
      await findProductById(productId);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    // --------------------------------------------------------
    // Clean up files if validation/database operation fails
    // --------------------------------------------------------

    if (req.files?.length) {
      const fs = require("fs");
      const path = require("path");

      for (const file of req.files) {
        try {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "products",
            file.filename
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(
            "Uploaded file cleanup error:",
            cleanupError
          );
        }
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// ============================================================
// PUT /api/products/:id
// ============================================================
const updateExistingProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const productId = Number(id);

    // --------------------------------------------------------
    // Check existing product
    // --------------------------------------------------------
    const existingProduct =
      await findProductById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      category_id,
      name,
      slug,
      sku,
      short_description,
      description,
      price,
      compare_price,
      stock_quantity,
      status,
      is_featured,
    } = req.body;

    // --------------------------------------------------------
    // Required fields
    // --------------------------------------------------------
    if (
      !category_id ||
      !name ||
      !slug ||
      !sku ||
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category, name, slug, SKU and price are required",
      });
    }

    // --------------------------------------------------------
    // Normalize values
    // --------------------------------------------------------
    const normalizedCategoryId = Number(category_id);
    const normalizedPrice = Number(price);

    const normalizedComparePrice =
      compare_price === undefined ||
        compare_price === null ||
        compare_price === ""
        ? null
        : Number(compare_price);

    const normalizedStockQuantity =
      stock_quantity === undefined ||
        stock_quantity === null ||
        stock_quantity === ""
        ? 0
        : Number(stock_quantity);

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedSku = sku.trim();

    // --------------------------------------------------------
    // Validate category
    // --------------------------------------------------------
    if (
      !Number.isInteger(normalizedCategoryId) ||
      normalizedCategoryId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // --------------------------------------------------------
    // Validate price
    // --------------------------------------------------------
    if (
      Number.isNaN(normalizedPrice) ||
      normalizedPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    // --------------------------------------------------------
    // Validate compare price
    // --------------------------------------------------------
    if (
      normalizedComparePrice !== null &&
      (Number.isNaN(normalizedComparePrice) ||
        normalizedComparePrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Compare price must be a valid non-negative number",
      });
    }

    // --------------------------------------------------------
    // Validate stock
    // --------------------------------------------------------
    if (
      !Number.isInteger(normalizedStockQuantity) ||
      normalizedStockQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity must be a non-negative integer",
      });
    }

    // --------------------------------------------------------
    // Validate status
    // --------------------------------------------------------
    const allowedStatuses = [
      "active",
      "inactive",
      "out_of_stock",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
      });
    }

    // --------------------------------------------------------
    // Determine final status
    // --------------------------------------------------------
    let normalizedStatus = status || "active";

    if (normalizedStockQuantity === 0) {
      normalizedStatus = "out_of_stock";
    }

    // --------------------------------------------------------
    // Check category
    // --------------------------------------------------------
    const category = await findCategoryById(
      normalizedCategoryId
    );

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // --------------------------------------------------------
    // Check duplicate slug
    // --------------------------------------------------------
    const productWithSlug =
      await findProductBySlug(normalizedSlug);

    if (
      productWithSlug &&
      Number(productWithSlug.id) !== productId
    ) {
      return res.status(409).json({
        success: false,
        message: "Product slug already exists",
      });
    }

    // --------------------------------------------------------
    // Check duplicate SKU
    // --------------------------------------------------------
    const productWithSku =
      await findProductBySku(normalizedSku);

    if (
      productWithSku &&
      Number(productWithSku.id) !== productId
    ) {
      return res.status(409).json({
        success: false,
        message: "Product SKU already exists",
      });
    }

    // --------------------------------------------------------
    // Update product
    // --------------------------------------------------------
    const affectedRows = await updateProduct(
      productId,
      {
        category_id: normalizedCategoryId,
        name: normalizedName,
        slug: normalizedSlug,
        sku: normalizedSku,
        short_description,
        description,
        price: normalizedPrice,
        compare_price: normalizedComparePrice,
        stock_quantity: normalizedStockQuantity,
        status: normalizedStatus,
        is_featured: Boolean(is_featured),
      }
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product could not be updated",
      });
    }

    // --------------------------------------------------------
    // Retrieve updated product
    // --------------------------------------------------------
    const updatedProduct =
      await findProductById(productId);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// ============================================================
// DELETE /api/products/:id
// ============================================================
const deleteExistingProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const productId = Number(id);

    // --------------------------------------------------------
    // Check existing product
    // --------------------------------------------------------
    const existingProduct =
      await findProductById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // --------------------------------------------------------
    // Delete product
    // --------------------------------------------------------
    try {
      await deleteProduct(productId);
    } catch (error) {
      if (
        error.code === "ER_ROW_IS_REFERENCED_2" ||
        error.code === "ER_ROW_IS_REFERENCED"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Product cannot be deleted because it is being used by another record",
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createNewProduct,
  updateExistingProduct,
  deleteExistingProduct,
};