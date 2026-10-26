
import { useState } from "react";
import {
    FiUser,
    FiShield,
    FiShoppingBag,
    FiBell,
    FiSave,
} from "react-icons/fi";

import { changeAdminPassword } from "../../services/adminSettingsService";

import "./Settings.scss";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [saved, setSaved] = useState(false);

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    const [store, setStore] = useState({
        store_name: "DirectLinks",
        contact_email: "",
        phone: "",
        currency: "NGN",
    });

    const [notifications, setNotifications] = useState({
        new_orders: true,
        low_stock: true,
        customer_updates: false,
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordError("New passwords do not match.");
            return;
        }

        if (passwordForm.new_password.length < 8) {
            setPasswordError("Your new password must be at least 8 characters.");
            return;
        }

        try {
            setPasswordLoading(true);

            const response = await changeAdminPassword(passwordForm);

            setPasswordMessage(
                response.message || "Password changed successfully."
            );

            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Unable to change your password. Please try again."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: FiUser },
        { id: "security", label: "Security", icon: FiShield },
        { id: "store", label: "Store", icon: FiShoppingBag },
        { id: "notifications", label: "Notifications", icon: FiBell },
    ];

    const updateProfile = (event) => {
        setProfile({
            ...profile,
            [event.target.name]: event.target.value,
        });
        setSaved(false);
    };

    const updateStore = (event) => {
        setStore({
            ...store,
            [event.target.name]: event.target.value,
        });
        setSaved(false);
    };

    const handleSave = async (event) => {
        event.preventDefault();

        console.log({
            profile,
            store,
            notifications,
        });

        setSaved(false);
    };

    return (
        <div className="settings-page">
            <div className="settings-heading">
                <div>
                    <h1>Settings</h1>
                    <p>
                        Manage your administrator account and
                        store preferences.
                    </p>
                </div>
            </div>

            <div className="settings-layout">
                <aside className="settings-sidebar">
                    <h3>GENERAL SETTINGS</h3>

                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <button
                                type="button"
                                key={tab.id}
                                className={
                                    activeTab === tab.id
                                        ? "settings-tab active"
                                        : "settings-tab"
                                }
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSaved(false);
                                }}
                            >
                                <Icon />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </aside>

                <form
                    className="settings-panel"
                    onSubmit={handleSave}
                >
                    {activeTab === "profile" && (
                        <>
                            <div className="settings-panel-heading">
                                <h2>Profile Information</h2>
                                <p>
                                    Update your administrator details.
                                </p>
                            </div>

                            <div className="settings-form-grid">
                                <label>
                                    First name
                                    <input
                                        name="first_name"
                                        value={profile.first_name}
                                        onChange={updateProfile}
                                        required
                                    />
                                </label>

                                <label>
                                    Last name
                                    <input
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={updateProfile}
                                        required
                                    />
                                </label>

                                <label className="full-width">
                                    Email address
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={updateProfile}
                                        required
                                    />
                                </label>
                            </div>
                        </>
                    )}

                    {activeTab === "security" && (
                        <>
                            <div className="settings-panel-heading">
                                <h2>Security</h2>
                                <p>
                                    Keep your administrator account secure.
                                </p>
                            </div>

                            <form className="settings-form" onSubmit={handlePasswordSubmit}>
                                <h3>Change Password</h3>

                                <p>
                                    Enter your current password and choose a new, secure password.
                                </p>

                                {passwordMessage && (
                                    <div className="settings-success">{passwordMessage}</div>
                                )}

                                {passwordError && (
                                    <div className="settings-error">{passwordError}</div>
                                )}

                                <div className="settings-field">
                                    <label htmlFor="current_password">Current Password</label>
                                    <input
                                        id="current_password"
                                        type="password"
                                        name="current_password"
                                        value={passwordForm.current_password}
                                        onChange={handlePasswordChange}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="new_password">New Password</label>
                                    <input
                                        id="new_password"
                                        type="password"
                                        name="new_password"
                                        value={passwordForm.new_password}
                                        onChange={handlePasswordChange}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div className="settings-field">
                                    <label htmlFor="confirm_password">Confirm New Password</label>
                                    <input
                                        id="confirm_password"
                                        type="password"
                                        name="confirm_password"
                                        value={passwordForm.confirm_password}
                                        onChange={handlePasswordChange}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={passwordLoading}>
                                    {passwordLoading ? "Changing Password..." : "Change Password"}
                                </button>
                            </form>
                        </>
                    )}

                    {activeTab === "store" && (
                        <>
                            <div className="settings-panel-heading">
                                <h2>Store Information</h2>
                                <p>
                                    Configure your store's basic details.
                                </p>
                            </div>

                            <div className="settings-form-grid">
                                <label className="full-width">
                                    Store name
                                    <input
                                        name="store_name"
                                        value={store.store_name}
                                        onChange={updateStore}
                                        required
                                    />
                                </label>

                                <label>
                                    Contact email
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={store.contact_email}
                                        onChange={updateStore}
                                    />
                                </label>

                                <label>
                                    Phone number
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={store.phone}
                                        onChange={updateStore}
                                    />
                                </label>

                                <label className="full-width">
                                    Currency
                                    <select
                                        name="currency"
                                        value={store.currency}
                                        onChange={updateStore}
                                    >
                                        <option value="NGN">
                                            NGN - Nigerian Naira
                                        </option>
                                        <option value="USD">
                                            USD - US Dollar
                                        </option>
                                    </select>
                                </label>
                            </div>
                        </>
                    )}

                    {activeTab === "notifications" && (
                        <>
                            <div className="settings-panel-heading">
                                <h2>Notifications</h2>
                                <p>
                                    Choose which events you want to
                                    receive notifications about.
                                </p>
                            </div>

                            {[
                                {
                                    key: "new_orders",
                                    title: "New orders",
                                    description:
                                        "When a customer places an order.",
                                },
                                {
                                    key: "low_stock",
                                    title: "Low stock alerts",
                                    description:
                                        "When a product's stock is low.",
                                },
                                {
                                    key: "customer_updates",
                                    title: "Customer updates",
                                    description:
                                        "Updates related to customers.",
                                },
                            ].map((item) => (
                                <label
                                    className="settings-toggle"
                                    key={item.key}
                                >
                                    <span>
                                        <strong>{item.title}</strong>
                                        <small>
                                            {item.description}
                                        </small>
                                    </span>

                                    <input
                                        type="checkbox"
                                        checked={
                                            notifications[item.key]
                                        }
                                        onChange={(event) => {
                                            setNotifications({
                                                ...notifications,
                                                [item.key]:
                                                    event.target.checked,
                                            });
                                            setSaved(false);
                                        }}
                                    />
                                </label>
                            ))}
                        </>
                    )}

                    <div className="settings-actions">
                        {saved && (
                            <span className="settings-success">
                                Settings saved successfully.
                            </span>
                        )}

                        <button type="submit">
                            <FiSave />
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;

