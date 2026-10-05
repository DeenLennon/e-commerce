
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiGrid, FiBox, FiShoppingBag, FiTag, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiSearch, FiBell, } from "react-icons/fi";
import "./AdminLayout.scss";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navigation = [
        {
            label: "Dashboard",
            icon: FiGrid,
            path: "/admin",
            end: true,
        },
        {
            label: "Products",
            icon: FiBox,
            path: "/admin/products",
        },
        {
            label: "Categories",
            icon: FiTag,
            path: "/admin/categories",
        },
        {
            label: "Orders",
            icon: FiShoppingBag,
            path: "/admin/orders",
        },
        {
            label: "Customers",
            icon: FiUsers,
            path: "/admin/customers",
        },
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="admin-layout">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""
                    }`}
            >
                {/* Logo */}
                <div className="admin-logo">
                    <div className="logo-mark">E</div>

                    <div className="logo-text">
                        <strong>ecommerce</strong>
                        <span>ADMIN PANEL</span>
                    </div>

                    <button
                        type="button"
                        className="mobile-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FiX />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="admin-navigation">
                    <span className="navigation-title">
                        MAIN MENU
                    </span>

                    {navigation.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `admin-nav-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="nav-icon">
                                <item.icon />
                            </span>

                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Navigation */}
                <div className="sidebar-bottom">
                    <span className="navigation-title">
                        ACCOUNT
                    </span>

                    <button
                        type="button"
                        className="sidebar-action"
                    >
                        <span className="nav-icon">
                            <FiSettings />
                        </span>

                        <span>Settings</span>
                    </button>

                    <button
                        type="button"
                        className="sidebar-action logout"
                        onClick={handleLogout}
                    >
                        <span className="nav-icon">
                            <FiLogOut />
                        </span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="admin-main">
                {/* Topbar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="mobile-menu-button"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <FiMenu />
                        </button>

                        <div className="admin-search">
                            <FiSearch />

                            <input
                                type="text"
                                placeholder="Search..."
                            />
                        </div>
                    </div>

                    <div className="topbar-right">
                        <button
                            type="button"
                            className="notification-button"
                            title="Notifications"
                        >
                            <FiBell />
                            <span className="notification-dot"></span>
                        </button>

                        <div className="admin-profile">
                            <div className="admin-avatar">
                                {user?.first_name?.charAt(0)}
                                {user?.last_name?.charAt(0)}
                            </div>

                            <div className="admin-profile-info">
                                <strong>
                                    {user?.first_name} {user?.last_name}
                                </strong>

                                <span>
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;