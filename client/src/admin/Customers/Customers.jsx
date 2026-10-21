import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

import { getCustomers, createCustomer } from "../../services/customerService";
import {
  Search,
  FilterList,
  MoreVert,
  PersonAdd,
  PeopleAlt,
  ShoppingBag,
  AttachMoney,
  CheckCircle,
  Block,
  Visibility,
  Edit,
  Delete,
  Close,
  Email,
  Phone,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

import "./Customers.scss";

const initialCustomerForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  address: {
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postal_code: "",
    phone: "",
    is_default: true,
  },
};


const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [formError, setFormError] = useState("");

  const [newCustomer, setNewCustomer] = useState(initialCustomerForm);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCustomers();

      // Support common API response structures.
      const users =
        response?.data?.customers ??
        response?.customers ??
        response?.data?.users ??
        response?.users ??
        response?.data ??
        [];

      if (!Array.isArray(users)) {
        throw new Error(
          "The server returned an unexpected customers response."
        );
      }

      const formattedCustomers = users.map((user) => {
        const firstName = user.first_name ?? "";
        const lastName = user.last_name ?? "";

        const name =
          user.name ||
          `${firstName} ${lastName}`.trim() ||
          user.email ||
          "Unnamed Customer";

        return {
          id: user.id,
          name,
          email: user.email ?? "",
          phone: user.phone ?? "Not provided",
          avatar: name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          status: user.status
            ? user.status.charAt(0).toUpperCase() +
            user.status.slice(1).toLowerCase()
            : "Active",
          orders: Number(user.orders_count ?? user.orders ?? 0),
          spent: Number(user.total_spent ?? user.spent ?? 0),
          joined: user.created_at
            ? new Date(user.created_at).toLocaleDateString(
              "en-NG",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )
            : "Not available",
          location: user.location ?? "Not provided",
        };
      });

      setCustomers(formattedCustomers);
    } catch (err) {
      console.error("Failed to fetch customers:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const totalOrders = customers.reduce(
    (total, customer) => total + customer.orders,
    0
  );

  const totalRevenue = customers.reduce(
    (total, customer) => total + customer.spent,
    0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    setActiveMenu(null);
  };


  const handleAddCustomer = async (e) => {
    e.preventDefault();

    try {
      setSavingCustomer(true);
      setFormError("");

      // await createCustomer(newCustomer);

      // setNewCustomer({
      //   first_name: "",
      //   last_name: "",
      //   email: "",
      //   phone: "",
      //   password: "",
      // });

      // setShowAddModal(false);


      await createCustomer(newCustomer);

      // Reset every field, including the nested address fields.
      setNewCustomer(initialCustomerForm);

      setShowAddModal(false);
      setFormError("");

      // Refresh the table from MySQL.
      await fetchCustomers();


      // Refresh the table from MySQL.
      await fetchCustomers();
    } catch (err) {
      console.error("Failed to create customer:", err);

      setFormError(
        err.response?.data?.message ||
        "Unable to create customer. Please try again."
      );
    } finally {
      setSavingCustomer(false);
    }
  };

  return (
    <div className="customers-page">

      {/* HEADER */}
      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>
            Manage your customers, view their activity and monitor their
            purchases.
          </p>
        </div>

        <button
          className="add-customer-btn"
          onClick={() => {
            setFormError("");
            setShowAddModal(true);
          }}
        >
          <PersonAdd />
          Add Customer
        </button>
      </div>

      {/* STATISTICS */}
      <div className="customer-stats">

        <div className="customer-stat-card">
          <div className="stat-icon customers-icon">
            <PeopleAlt />
          </div>

          <div className="stat-content">
            <span>Total Customers</span>
            <h3>{totalCustomers.toLocaleString()}</h3>

            <small className="positive">
              <ArrowUpward />
              12.5% this month
            </small>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="stat-icon active-icon">
            <CheckCircle />
          </div>

          <div className="stat-content">
            <span>Active Customers</span>
            <h3>{activeCustomers.toLocaleString()}</h3>

            <small className="positive">
              <ArrowUpward />
              8.2% this month
            </small>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="stat-icon orders-icon">
            <ShoppingBag />
          </div>

          <div className="stat-content">
            <span>Total Orders</span>
            <h3>{totalOrders.toLocaleString()}</h3>

            <small className="positive">
              <ArrowUpward />
              15.4% this month
            </small>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="stat-icon revenue-icon">
            <AttachMoney />
          </div>

          <div className="stat-content">
            <span>Customer Revenue</span>
            <h3>{formatCurrency(totalRevenue)}</h3>

            <small className="positive">
              <ArrowUpward />
              18.7% this month
            </small>
          </div>
        </div>

      </div>

      {/* CUSTOMER TABLE CARD */}
      <div className="customers-card">

        <div className="customers-toolbar">

          <div>
            <h2>All Customers</h2>
            <span>{filteredCustomers.length} customers found</span>
          </div>

          <div className="toolbar-actions">

            {/* SEARCH */}
            <div className="customer-search">
              <Search />

              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")}>
                  <Close />
                </button>
              )}
            </div>

            {/* FILTER */}
            <div className="filter-wrapper">
              <FilterList />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="customers-table-wrapper">

          <table className="customers-table">

            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>

                <th>Customer</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <p>Loading customers...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <p>{error}</p>
                      <button onClick={fetchCustomers}>
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (

                  <tr key={customer.id}>

                    <td>
                      <input type="checkbox" />
                    </td>

                    {/* CUSTOMER */}
                    <td>
                      <div className="customer-info">

                        <div className="customer-avatar">
                          {customer.avatar}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <span>{customer.location}</span>
                        </div>

                      </div>
                    </td>

                    {/* CONTACT */}
                    <td>
                      <div className="contact-info">
                        <span>{customer.email}</span>
                        <small>{customer.phone}</small>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`customer-status ${customer.status.toLowerCase()}`}
                      >
                        <i></i>
                        {customer.status}
                      </span>
                    </td>

                    {/* ORDERS */}
                    <td>
                      <strong>{customer.orders}</strong>
                    </td>

                    {/* SPENT */}
                    <td>
                      <strong className="spent">
                        {formatCurrency(customer.spent)}
                      </strong>
                    </td>

                    {/* JOINED */}
                    <td>
                      <span className="joined-date">
                        {customer.joined}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td>

                      <div className="customer-actions">

                        <button
                          className="view-btn"
                          onClick={() =>
                            setSelectedCustomer(customer)
                          }
                          title="View customer"
                        >
                          <Visibility />
                        </button>

                        <button
                          className="more-btn"
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === customer.id
                                ? null
                                : customer.id
                            )
                          }
                        >
                          <MoreVert />
                        </button>

                        {activeMenu === customer.id && (

                          <div className="action-menu">

                            <button
                              onClick={() =>
                                setSelectedCustomer(customer)
                              }
                            >
                              <Visibility />
                              View Customer
                            </button>

                            <button>
                              <Edit />
                              Edit Customer
                            </button>

                            <button
                              className="delete"
                              onClick={() =>
                                handleDelete(customer.id)
                              }
                            >
                              <Delete />
                              Delete Customer
                            </button>

                          </div>

                        )}

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td colSpan="8">

                    <div className="empty-state">

                      <PeopleAlt />

                      <h3>No customers found</h3>

                      <p>
                        Try changing your search or filter.
                      </p>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        <div className="customers-pagination">

          <span>
            Showing <strong>1</strong> to{" "}
            <strong>{filteredCustomers.length}</strong> of{" "}
            <strong>{customers.length}</strong> customers
          </span>

          <div className="pagination-buttons">
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>Next</button>
          </div>

        </div>

      </div>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (

        <div
          className="customer-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >

          <div
            className="customer-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <div>
                <h2>Customer Details</h2>
                <p>Customer information and activity</p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
              >
                <Close />
              </button>

            </div>

            <div className="modal-profile">

              <div className="modal-avatar">
                {selectedCustomer.avatar}
              </div>

              <div>
                <h3>{selectedCustomer.name}</h3>
                <span>{selectedCustomer.email}</span>

                <div
                  className={`customer-status ${selectedCustomer.status.toLowerCase()}`}
                >
                  <i></i>
                  {selectedCustomer.status}
                </div>
              </div>

            </div>

            <div className="customer-details-grid">

              <div>
                <span>
                  <Email />
                  Email
                </span>

                <strong>{selectedCustomer.email}</strong>
              </div>

              <div>
                <span>
                  <Phone />
                  Phone
                </span>

                <strong>{selectedCustomer.phone}</strong>
              </div>

              <div>
                <span>
                  <ShoppingBag />
                  Orders
                </span>

                <strong>{selectedCustomer.orders}</strong>
              </div>

              <div>
                <span>
                  <AttachMoney />
                  Total Spent
                </span>

                <strong>
                  {formatCurrency(selectedCustomer.spent)}
                </strong>
              </div>

              <div>
                <span>
                  <CalendarToday />
                  Joined
                </span>

                <strong>{selectedCustomer.joined}</strong>
              </div>

              <div>
                <span>
                  <PeopleAlt />
                  Location
                </span>

                <strong>{selectedCustomer.location}</strong>
              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-btn"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>

              <button className="primary-btn">
                <Edit />
                Edit Customer
              </button>

            </div>

          </div>

        </div>

      )}


      {showAddModal && (
        <div
          className="customer-modal-overlay add-customer-overlay"
          onClick={() => {
            if (!savingCustomer) setShowAddModal(false);
          }}
        >
          <div
            className="customer-modal add-customer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Add Customer</h2>
                <p>Enter the new customer's details.</p>
              </div>

              <button
                type="button"
                disabled={savingCustomer}
                onClick={() => setShowAddModal(false)}
              >
                <Close />
              </button>
            </div>


            <form className="add-customer-form" onSubmit={handleAddCustomer}>
              <div className="form-intro">
                <div className="form-intro-icon">
                  <PersonAdd />
                </div>
                <div>
                  <h3>Customer information</h3>
                  <p>Enter the customer's details to create an account.</p>
                </div>
              </div>

              <div className="form-grid">
                <label className="form-field">
                  <span>First name <b>*</b></span>
                  <input
                    type="text"
                    placeholder="e.g. John"
                    autoComplete="given-name"
                    required
                    value={newCustomer.first_name}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-field">
                  <span>Last name <b>*</b></span>
                  <input
                    type="text"
                    placeholder="e.g. Doe"
                    autoComplete="family-name"
                    required
                    value={newCustomer.last_name}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-field form-field-full">
                  <span>Email address <b>*</b></span>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    autoComplete="email"
                    required
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    autoComplete="tel"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-field">
                  <span>City / Location</span>
                  <input
                    type="text"
                    placeholder="e.g. Ikeja, Lagos"
                    autoComplete="address-level2"
                    value={newCustomer.address.city}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          city: e.target.value,
                        },
                      }))
                    }
                  />
                </label>


                <label className="form-field form-field-full">
                  <span>Street address <b>*</b></span>
                  <input
                    type="text"
                    placeholder="e.g. 12 Market Road"
                    autoComplete="street-address"
                    required
                    value={newCustomer.address.address}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          address: e.target.value,
                        },
                      }))
                    }
                  />
                </label>

                <label className="form-field">
                  <span>State <b>*</b></span>
                  <input
                    type="text"
                    placeholder="e.g. Ogun"
                    autoComplete="address-level1"
                    required
                    value={newCustomer.address.state}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          state: e.target.value,
                        },
                      }))
                    }
                  />
                </label>

                <label className="form-field">
                  <span>Delivery phone number <b>*</b></span>
                  <input
                    type="tel"
                    placeholder="e.g. 09032456789"
                    autoComplete="tel"
                    required
                    value={newCustomer.address.phone}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          phone: e.target.value,
                        },
                      }))
                    }
                  />
                </label>

                <label className="form-field form-field-full">
                  <span>Temporary password <b>*</b></span>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={newCustomer.password}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                  <small>Use a temporary password and share it securely with the customer.</small>
                </label>
              </div>

              {formError && (
                <div className="form-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="modal-footer add-customer-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={savingCustomer}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={savingCustomer}
                >
                  {savingCustomer ? "Creating account..." : "Create Customer"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


    </div>
  );
};

export default Customers;