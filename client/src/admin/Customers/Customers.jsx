import React, { useMemo, useState } from "react";
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

const customersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@gmail.com",
    phone: "+234 801 234 5678",
    avatar: "JD",
    status: "Active",
    orders: 24,
    spent: 845000,
    joined: "Jan 12, 2026",
    location: "Lagos, Nigeria",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah.williams@gmail.com",
    phone: "+234 803 445 6677",
    avatar: "SW",
    status: "Active",
    orders: 18,
    spent: 624500,
    joined: "Feb 03, 2026",
    location: "Abuja, Nigeria",
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael.johnson@gmail.com",
    phone: "+234 805 123 4567",
    avatar: "MJ",
    status: "Inactive",
    orders: 9,
    spent: 289000,
    joined: "Feb 19, 2026",
    location: "Port Harcourt, Nigeria",
  },
  {
    id: 4,
    name: "Grace Anderson",
    email: "grace.anderson@gmail.com",
    phone: "+234 807 654 3210",
    avatar: "GA",
    status: "Active",
    orders: 32,
    spent: 1250000,
    joined: "Mar 08, 2026",
    location: "Lagos, Nigeria",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@gmail.com",
    phone: "+234 809 876 5432",
    avatar: "DB",
    status: "Blocked",
    orders: 5,
    spent: 115000,
    joined: "Mar 21, 2026",
    location: "Ibadan, Nigeria",
  },
  {
    id: 6,
    name: "Mary Thompson",
    email: "mary.thompson@gmail.com",
    phone: "+234 810 222 3344",
    avatar: "MT",
    status: "Active",
    orders: 27,
    spent: 935000,
    joined: "Apr 02, 2026",
    location: "Lagos, Nigeria",
  },
  {
    id: 7,
    name: "Daniel Wilson",
    email: "daniel.wilson@gmail.com",
    phone: "+234 812 444 5566",
    avatar: "DW",
    status: "Active",
    orders: 14,
    spent: 412000,
    joined: "Apr 17, 2026",
    location: "Benin City, Nigeria",
  },
  {
    id: 8,
    name: "Jennifer Davis",
    email: "jennifer.davis@gmail.com",
    phone: "+234 814 777 8899",
    avatar: "JD",
    status: "Inactive",
    orders: 7,
    spent: 186000,
    joined: "May 06, 2026",
    location: "Enugu, Nigeria",
  },
];

const Customers = () => {
  const [customers, setCustomers] = useState(customersData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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

        <button className="add-customer-btn">
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

              {filteredCustomers.length > 0 ? (
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

    </div>
  );
};

export default Customers;