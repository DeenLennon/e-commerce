import React, { useEffect, useMemo, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiTag,
    FiCheckCircle,
    FiXCircle,
    FiBox,
    FiRefreshCw,
    FiX,
} from "react-icons/fi";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../services/categoryService";

import "./Categories.scss";

const emptyForm = {
    name: "",
    slug: "",
    description: "",
    image_url: "",
    status: "active",
};

const Categories = () => {
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [toast, setToast] = useState({
        visible: false,
        type: "",
        message: "",
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState(null);

    const [deleteModalOpen, setDeleteModalOpen] =
        useState(false);

    const [categoryToDelete, setCategoryToDelete] =
        useState(null);

    const [form, setForm] = useState(emptyForm);

    const showToast = (message, type = "success") => {
        setToast({
            visible: true,
            type,
            message,
        });

        setTimeout(() => {
            setToast({
                visible: false,
                type: "",
                message: "",
            });
        }, 3000);
    };

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCategories();

            if (response?.success) {
                setCategories(response.categories || []);
            } else {
                throw new Error(
                    response?.message ||
                        "Failed to load categories"
                );
            }
        } catch (err) {
            console.error(
                "Load categories error:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load categories";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
            const searchValue =
                search.trim().toLowerCase();

            const matchesSearch =
                !searchValue ||
                category.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                category.slug
                    ?.toLowerCase()
                    .includes(searchValue) ||
                category.description
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                category.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        categories,
        search,
        statusFilter,
    ]);

    const stats = useMemo(() => {
        const total = categories.length;

        const active = categories.filter(
            (category) =>
                category.status === "active"
        ).length;

        const inactive = categories.filter(
            (category) =>
                category.status === "inactive"
        ).length;

        const totalProducts =
            categories.reduce(
                (total, category) =>
                    total +
                    Number(
                        category.product_count ||
                            category.products_count ||
                            0
                    ),
                0
            );

        return {
            total,
            active,
            inactive,
            totalProducts,
        };
    }, [categories]);

    const generateSlug = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9\s-]/g,
                ""
            )
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const handleNameChange = (event) => {
        const value = event.target.value;

        setForm((previous) => ({
            ...previous,
            name: value,
            slug: editingCategory
                ? previous.slug
                : generateSlug(value),
        }));
    };

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);

        setForm({
            name: category.name || "",
            slug: category.slug || "",
            description:
                category.description || "",
            image_url:
                category.image_url || "",
            status:
                category.status || "active",
        });

        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingCategory(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            showToast(
                "Category name is required.",
                "error"
            );
            return;
        }

        if (!form.slug.trim()) {
            showToast(
                "Category slug is required.",
                "error"
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: form.name.trim(),
                slug: form.slug.trim().toLowerCase(),
                description:
                    form.description.trim(),
                image_url:
                    form.image_url.trim(),
                status: form.status,
            };

            let response;

            if (editingCategory) {
                response =
                    await updateCategory(
                        editingCategory.id,
                        payload
                    );
            } else {
                response =
                    await createCategory(
                        payload
                    );
            }

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                        "Failed to save category"
                );
            }

            showToast(
                editingCategory
                    ? "Category updated successfully."
                    : "Category created successfully."
            );

            closeModal();

            await loadCategories();
        } catch (err) {
            console.error(
                "Save category error:",
                err
            );

            showToast(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save category.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) {
            return;
        }

        try {
            setDeleting(true);

            const response =
                await deleteCategory(
                    categoryToDelete.id
                );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                        "Failed to delete category"
                );
            }

            showToast(
                "Category deleted successfully."
            );

            closeDeleteModal();

            await loadCategories();
        } catch (err) {
            console.error(
                "Delete category error:",
                err
            );

            showToast(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete category.",
                "error"
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="categories-page">
            {/* Toast */}
            {toast.visible && (
                <div
                    className={`category-toast ${toast.type}`}
                >
                    <div className="toast-icon">
                        {toast.type ===
                        "error" ? (
                            <FiXCircle />
                        ) : (
                            <FiCheckCircle />
                        )}
                    </div>

                    <span>
                        {toast.message}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setToast({
                                visible: false,
                                type: "",
                                message: "",
                            })
                        }
                    >
                        <FiX />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="categories-header">
                <div>
                    <div className="page-title-row">
                        <div className="page-title-icon">
                            <FiTag />
                        </div>

                        <div>
                            <h1>
                                Categories
                            </h1>

                            <p>
                                Organize your products
                                into easy-to-browse
                                categories.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={
                        openCreateModal
                    }
                >
                    <FiPlus />
                    <span>
                        Add Category
                    </span>
                </button>
            </div>

            {/* Stats */}
            <div className="category-stats">
                <div className="category-stat-card">
                    <div className="category-stat-icon purple">
                        <FiTag />
                    </div>

                    <div>
                        <span>
                            Total Categories
                        </span>

                        <strong>
                            {stats.total}
                        </strong>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon green">
                        <FiCheckCircle />
                    </div>

                    <div>
                        <span>
                            Active
                        </span>

                        <strong>
                            {stats.active}
                        </strong>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon gray">
                        <FiXCircle />
                    </div>

                    <div>
                        <span>
                            Inactive
                        </span>

                        <strong>
                            {stats.inactive}
                        </strong>
                    </div>
                </div>

                <div className="category-stat-card">
                    <div className="category-stat-icon orange">
                        <FiBox />
                    </div>

                    <div>
                        <span>
                            Products
                        </span>

                        <strong>
                            {stats.totalProducts}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Main card */}
            <section className="categories-card">
                <div className="categories-toolbar">
                    <div className="toolbar-search">
                        <FiSearch />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search categories..."
                        />
                    </div>

                    <div className="toolbar-actions">
                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>

                        <button
                            type="button"
                            className="refresh-button"
                            onClick={
                                loadCategories
                            }
                            disabled={loading}
                            title="Refresh"
                        >
                            <FiRefreshCw
                                className={
                                    loading
                                        ? "spinning"
                                        : ""
                                }
                            />
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="category-error">
                        <FiXCircle />

                        <div>
                            <strong>
                                Unable to load
                                categories
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                loadCategories
                            }
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && !error && (
                    <div className="category-table">
                        {Array.from({
                            length: 5,
                        }).map(
                            (_, index) => (
                                <div
                                    className="category-skeleton"
                                    key={index}
                                >
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    filteredCategories.length ===
                        0 && (
                        <div className="categories-empty">
                            <div className="empty-icon">
                                <FiTag />
                            </div>

                            <h3>
                                {categories.length ===
                                0
                                    ? "No categories yet"
                                    : "No categories found"}
                            </h3>

                            <p>
                                {categories.length ===
                                0
                                    ? "Create your first category to start organizing your products."
                                    : "Try changing your search or status filter."}
                            </p>

                            {categories.length ===
                                0 && (
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={
                                        openCreateModal
                                    }
                                >
                                    <FiPlus />
                                    Add Category
                                </button>
                            )}
                        </div>
                    )}

                {/* Table */}
                {!loading &&
                    !error &&
                    filteredCategories.length >
                        0 && (
                        <div className="category-table-wrapper">
                            <table className="category-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Slug
                                        </th>

                                        <th>
                                            Products
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Created
                                        </th>

                                        <th>
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCategories.map(
                                        (
                                            category
                                        ) => {
                                            const productCount =
                                                Number(
                                                    category.product_count ||
                                                        category.products_count ||
                                                        0
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        category.id
                                                    }
                                                >
                                                    <td>
                                                        <div className="category-identity">
                                                            <div className="category-image">
                                                                {category.image_url ? (
                                                                    <img
                                                                        src={
                                                                            category.image_url
                                                                        }
                                                                        alt={
                                                                            category.name
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <FiTag />
                                                                )}
                                                            </div>

                                                            <div className="category-name">
                                                                <strong>
                                                                    {
                                                                        category.name
                                                                    }
                                                                </strong>

                                                                {category.description && (
                                                                    <span>
                                                                        {
                                                                            category.description
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <code>
                                                            /
                                                            {
                                                                category.slug
                                                            }
                                                        </code>
                                                    </td>

                                                    <td>
                                                        <div className="product-count">
                                                            <FiBox />

                                                            <span>
                                                                {
                                                                    productCount
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`status-badge ${
                                                                category.status ===
                                                                "active"
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`}
                                                        >
                                                            <span className="status-dot" />

                                                            {category.status ===
                                                            "active"
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span className="created-date">
                                                            {category.created_at
                                                                ? new Date(
                                                                      category.created_at
                                                                  ).toLocaleDateString(
                                                                      "en-NG",
                                                                      {
                                                                          day: "2-digit",
                                                                          month: "short",
                                                                          year: "numeric",
                                                                      }
                                                                  )
                                                                : "—"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="category-actions">
                                                            <button
                                                                type="button"
                                                                title="Edit category"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        category
                                                                    )
                                                                }
                                                            >
                                                                <FiEdit2 />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delete"
                                                                title="Delete category"
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        category
                                                                    )
                                                                }
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
            </section>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="category-modal">
                        <div className="modal-header">
                            <div>
                                <span className="modal-icon">
                                    <FiTag />
                                </span>

                                <div>
                                    <h2>
                                        {editingCategory
                                            ? "Edit Category"
                                            : "Create Category"}
                                    </h2>

                                    <p>
                                        {editingCategory
                                            ? "Update your category details."
                                            : "Add a new category to your store."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                            >
                                <FiX />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>
                                        Category Name
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleNameChange
                                        }
                                        placeholder="e.g. Smartphones"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Slug
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="slug"
                                        value={
                                            form.slug
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. smartphones"
                                        required
                                    />

                                    <small>
                                        Used in the
                                        category URL.
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Describe this category..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="image_url"
                                        value={
                                            form.image_url
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://..."
                                    />

                                    {form.image_url && (
                                        <div className="image-preview">
                                            <img
                                                src={
                                                    form.image_url
                                                }
                                                alt="Category preview"
                                                onError={(
                                                    event
                                                ) => {
                                                    event.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
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
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <FiRefreshCw className="spinning" />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle />

                                            {editingCategory
                                                ? "Save Changes"
                                                : "Create Category"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModalOpen &&
                categoryToDelete && (
                    <div
                        className="modal-overlay"
                        onMouseDown={(
                            event
                        ) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDeleteModal();
                            }
                        }}
                    >
                        <div className="delete-modal">
                            <div className="delete-icon">
                                <FiTrash2 />
                            </div>

                            <h2>
                                Delete Category?
                            </h2>

                            <p>
                                Are you sure you
                                want to delete{" "}
                                <strong>
                                    {
                                        categoryToDelete.name
                                    }
                                </strong>
                                ?
                            </p>

                            <p className="warning">
                                If products are using
                                this category, the
                                server will prevent
                                the deletion.
                            </p>

                            <div className="delete-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeDeleteModal
                                    }
                                    disabled={
                                        deleting
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        deleting
                                    }
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Delete Category"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Categories;