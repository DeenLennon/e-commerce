const {
  getAllCategories,
  findCategoryById,
  findCategoryBySlug,
  createCategory,
  findCategoryByName,
  updateCategory,
  deleteCategory,
} = require("../models/categoryModel");

const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await findCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await findCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
    });
  }
};

const createNewCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image_url,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    const existingName = await findCategoryByName(
      normalizedName
    );

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const existingSlug = await findCategoryBySlug(
      normalizedSlug
    );

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }

    const categoryId = await createCategory({
      name: normalizedName,
      slug: normalizedSlug,
      description,
      image_url,
    });

    const category = await findCategoryById(categoryId);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

const updateExistingCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await findCategoryById(id);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      image_url,
      status,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    const categoryWithName = await findCategoryByName(
      normalizedName
    );

    if (
      categoryWithName &&
      categoryWithName.id !== Number(id)
    ) {
      return res.status(409).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const categoryWithSlug = await findCategoryBySlug(
      normalizedSlug
    );

    if (
      categoryWithSlug &&
      categoryWithSlug.id !== Number(id)
    ) {
      return res.status(409).json({
        success: false,
        message: "A category with this slug already exists",
      });
    }

    await updateCategory(id, {
      name: normalizedName,
      slug: normalizedSlug,
      description,
      image_url,
      status,
    });

    const category = await findCategoryById(id);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

const deleteExistingCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await findCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    // MySQL foreign-key restriction
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message:
          "Category cannot be deleted because products are using it",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};


module.exports = {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createNewCategory,
  updateExistingCategory,
  deleteExistingCategory,
};