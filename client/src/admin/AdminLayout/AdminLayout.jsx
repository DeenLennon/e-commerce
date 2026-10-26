
import useAuth from "../../hooks/useAuth";

import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiGrid, FiBox, FiShoppingBag, FiTag, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiSearch, FiBell, } from "react-icons/fi";
import "./AdminLayout.scss";

import {
    getNotifications,
    markNotificationAsRead as markNotificationAsReadApi,
    markAllNotificationsAsRead as markAllNotificationsAsReadApi,
    clearNotifications as clearNotificationsApi,
} from "../../services/notificationService";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [notificationOpen, setNotificationOpen] = useState(false);

    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [notificationLoading, setNotificationLoading] = useState(true);
    const [notificationError, setNotificationError] = useState("");


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

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const markAsRead = async (id) => {
        try {
            await markNotificationAsReadApi(id);

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === id
                        ? { ...notification, is_read: 1 }
                        : notification
                )
            );
        } catch (error) {
            console.error("Mark notification as read error:", error);
            setNotificationError("Unable to update notification.");
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsReadApi();

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    is_read: 1,
                }))
            );

            setNotificationError("");
        } catch (error) {
            console.error("Mark all as read error:", error);
            setNotificationError("Unable to update notifications.");
        }
    };

    const handleClearNotifications = async () => {
        try {
            await clearNotificationsApi();
            setNotifications([]);
            setNotificationError("");
        } catch (error) {
            console.error("Clear notifications error:", error);
            setNotificationError("Unable to clear notifications.");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setNotificationOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchNotifications = async () => {
            try {
                const response = await getNotifications();

                if (!cancelled) {
                    setNotifications(response.data || []);
                    setNotificationError("");
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Fetch notifications error:", error);
                    setNotificationError(
                        "Unable to load notifications."
                    );
                }
            } finally {
                if (!cancelled) {
                    setNotificationLoading(false);
                }
            }
        };

        fetchNotifications();

        // Refresh periodically until Socket.IO is implemented.
        const intervalId = setInterval(fetchNotifications, 30000);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, []);

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
                    <div className="logo-mark">DL</div>

                    <div className="logo-text">
                        <strong>DirectLinks</strong>
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
                    <NavLink
                        to="/admin/settings"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `sidebar-action ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="nav-icon">
                            <FiSettings />
                        </span>

                        <span>Settings</span>
                    </NavLink>

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

                        <div className="notification-wrapper" ref={notificationRef}>
                            <button
                                type="button"
                                className="notification-button"
                                title="Notifications"
                                aria-label={`Notifications, ${unreadCount} unread`}
                                aria-expanded={notificationOpen}
                                onClick={() =>
                                    setNotificationOpen((previous) => !previous)
                                }
                            >
                                <FiBell />

                                {unreadCount > 0 && (
                                    <span className="notification-badge">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notificationOpen && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <div>
                                            <h3>Notifications</h3>
                                            <span>
                                                {unreadCount} unread
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={markAllAsRead}
                                            disabled={unreadCount === 0}
                                        >
                                            Mark all read
                                        </button>
                                    </div>

                                    <div className="notification-list">
                                        {notificationLoading ? (
                                            <p className="notification-status">
                                                Loading notifications...
                                            </p>
                                        ) : notificationError ? (
                                            <p className="notification-status">
                                                {notificationError}
                                            </p>
                                        ) : notifications.length === 0 ? (
                                            <div className="notification-empty">
                                                <FiBell />
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <button
                                                    type="button"
                                                    key={notification.id}
                                                    className={`notification-item ${Number(notification.is_read) ? "read" : "unread"
                                                        }`}
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <span className="notification-indicator" />

                                                    <span className="notification-details">
                                                        <strong>{notification.title}</strong>

                                                        <span>{notification.message}</span>

                                                        <small>
                                                            {new Date(
                                                                notification.created_at
                                                            ).toLocaleString()}
                                                        </small>
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>


                                    {notifications.length > 0 && (
                                        <div className="notification-footer">
                                            <button
                                                type="button"
                                                onClick={handleClearNotifications}
                                            >
                                                Clear all notifications
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


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