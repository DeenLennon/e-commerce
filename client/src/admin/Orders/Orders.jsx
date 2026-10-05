// import { useEffect, useState } from "react";

// import {
//   FiRefreshCw,
//   FiEye,
//   FiMoreVertical,
//   FiPackage,
//   FiSearch,
//   FiTrash2,
//   FiX,
// } from "react-icons/fi";

// import {
//   getAdminOrders,
//   updateOrderStatus,
//   updatePaymentStatus,
//   deleteOrder,
// } from "../../services/adminService";

// import "./Orders.scss";

// const ORDER_STATUSES = [
//   "pending",
//   "processing",
//   "shipped",
//   "delivered",
//   "cancelled",
// ];

// const PAYMENT_STATUSES = [
//   "pending",
//   "paid",
//   "failed",
//   "refunded",
//   "partially_refunded",
// ];

// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     maximumFractionDigits: 2,
//   }).format(Number(amount) || 0);
// };

// const formatDate = (date) => {
//   if (!date) return "—";

//   return new Date(date).toLocaleDateString(
//     "en-NG",
//     {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     }
//   );
// };

// const formatDateTime = (date) => {
//   if (!date) return "—";

//   return new Date(date).toLocaleString(
//     "en-NG",
//     {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     }
//   );
// };

// const formatStatus = (status) => {
//   if (!status) return "Unknown";

//   return status
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (letter) =>
//       letter.toUpperCase()
//     );
// };

// const getCustomerName = (order) => {
//   const name = [
//     order.customer_first_name,
//     order.customer_last_name,
//   ]
//     .filter(Boolean)
//     .join(" ");

//   return name || "Unknown Customer";
// };

// const getInitials = (order) => {
//   const first =
//     order.customer_first_name?.charAt(0) || "";

//   const last =
//     order.customer_last_name?.charAt(0) || "";

//   return (
//     `${first}${last}`.toUpperCase() || "CU"
//   );
// };

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");

//   const [selectedOrder, setSelectedOrder] =
//     useState(null);

//   const [openMenu, setOpenMenu] = useState(null);

//   const [updatingOrder, setUpdatingOrder] =
//     useState(null);

//   const [deletingOrder, setDeletingOrder] =
//     useState(null);

//   const loadOrders = async (
//     showRefresh = false
//   ) => {
//     try {
//       setError("");

//       if (showRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       const response =
//         await getAdminOrders();

//       if (response.success) {
//         setOrders(response.orders || []);
//       } else {
//         setError(
//           response.message ||
//             "Failed to load orders"
//         );
//       }
//     } catch (err) {
//       console.error(
//         "Load orders error:",
//         err
//       );

//       setError(
//         err.response?.data?.message ||
//           "Failed to load orders"
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     loadOrders();
//   }, []);

//   const handleOrderStatusChange = async (
//     orderId,
//     status
//   ) => {
//     try {
//       setUpdatingOrder(orderId);

//       const response =
//         await updateOrderStatus(
//           orderId,
//           status
//         );

//       if (!response.success) {
//         throw new Error(
//           response.message ||
//             "Failed to update order status"
//         );
//       }

//       setOrders((currentOrders) =>
//         currentOrders.map((order) =>
//           order.id === orderId
//             ? {
//                 ...order,
//                 order_status: status,
//               }
//             : order
//         )
//       );

//       if (
//         selectedOrder?.id === orderId
//       ) {
//         setSelectedOrder((current) => ({
//           ...current,
//           order_status: status,
//         }));
//       }
//     } catch (err) {
//       console.error(
//         "Update order status error:",
//         err
//       );

//       alert(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to update order status"
//       );
//     } finally {
//       setUpdatingOrder(null);
//     }
//   };

//   const handlePaymentStatusChange =
//     async (orderId, status) => {
//       try {
//         setUpdatingOrder(orderId);

//         const response =
//           await updatePaymentStatus(
//             orderId,
//             status
//           );

//         if (!response.success) {
//           throw new Error(
//             response.message ||
//               "Failed to update payment status"
//           );
//         }

//         setOrders((currentOrders) =>
//           currentOrders.map((order) =>
//             order.id === orderId
//               ? {
//                   ...order,
//                   payment_status: status,
//                 }
//               : order
//           )
//         );

//         if (
//           selectedOrder?.id === orderId
//         ) {
//           setSelectedOrder((current) => ({
//             ...current,
//             payment_status: status,
//           }));
//         }
//       } catch (err) {
//         console.error(
//           "Update payment status error:",
//           err
//         );

//         alert(
//           err.response?.data?.message ||
//             err.message ||
//             "Failed to update payment status"
//         );
//       } finally {
//         setUpdatingOrder(null);
//       }
//     };

//   const handleDeleteOrder = async (
//     orderId
//   ) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this order? This action cannot be undone."
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       setDeletingOrder(orderId);

//       const response =
//         await deleteOrder(orderId);

//       if (!response.success) {
//         throw new Error(
//           response.message ||
//             "Failed to delete order"
//         );
//       }

//       setOrders((currentOrders) =>
//         currentOrders.filter(
//           (order) => order.id !== orderId
//         )
//       );

//       if (
//         selectedOrder?.id === orderId
//       ) {
//         setSelectedOrder(null);
//       }

//       setOpenMenu(null);
//     } catch (err) {
//       console.error(
//         "Delete order error:",
//         err
//       );

//       alert(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to delete order"
//       );
//     } finally {
//       setDeletingOrder(null);
//     }
//   };

//   const filteredOrders = orders.filter(
//     (order) => {
//       const searchValue =
//         search.toLowerCase().trim();

//       if (!searchValue) {
//         return true;
//       }

//       const customer =
//         getCustomerName(order)
//           .toLowerCase();

//       const orderNumber =
//         order.order_number
//           ?.toLowerCase() || "";

//       const email =
//         order.customer_email
//           ?.toLowerCase() || "";

//       const status =
//         order.order_status
//           ?.toLowerCase() || "";

//       return (
//         orderNumber.includes(searchValue) ||
//         customer.includes(searchValue) ||
//         email.includes(searchValue) ||
//         status.includes(searchValue)
//       );
//     }
//   );

//   return (
//     <div className="admin-orders">
//       {/* Header */}

//       <div className="orders-header">
//         <div>
//           <div className="orders-title-row">
//             <div className="orders-title-icon">
//               <FiPackage />
//             </div>

//             <div>
//               <h1>Orders</h1>

//               <p>
//                 Manage customer orders,
//                 payments and delivery status.
//               </p>
//             </div>
//           </div>
//         </div>

//         <button
//           type="button"
//           className="refresh-button"
//           onClick={() => loadOrders(true)}
//           disabled={refreshing}
//         >
//           <FiRefreshCw
//             className={
//               refreshing
//                 ? "spinning"
//                 : ""
//             }
//           />

//           {refreshing
//             ? "Refreshing..."
//             : "Refresh"}
//         </button>
//       </div>

//       {/* Toolbar */}

//       <div className="orders-toolbar">
//         <div className="orders-count">
//           <strong>
//             {filteredOrders.length}
//           </strong>

//           <span>
//             {filteredOrders.length === 1
//               ? "order"
//               : "orders"}
//           </span>
//         </div>

//         <div className="orders-search">
//           <FiSearch />

//           <input
//             type="text"
//             placeholder="Search orders, customers..."
//             value={search}
//             onChange={(event) =>
//               setSearch(
//                 event.target.value
//               )
//             }
//           />

//           {search && (
//             <button
//               type="button"
//               onClick={() =>
//                 setSearch("")
//               }
//               aria-label="Clear search"
//             >
//               <FiX />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Error */}

//       {error && (
//         <div className="orders-alert error">
//           <span>{error}</span>

//           <button
//             type="button"
//             onClick={() =>
//               loadOrders()
//             }
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       {/* Loading */}

//       {loading ? (
//         <div className="orders-loading">
//           <div className="orders-spinner" />

//           <p>Loading orders...</p>
//         </div>
//       ) : filteredOrders.length === 0 ? (
//         <div className="orders-empty">
//           <div className="orders-empty-icon">
//             <FiPackage />
//           </div>

//           <h2>
//             {search
//               ? "No matching orders"
//               : "No orders yet"}
//           </h2>

//           <p>
//             {search
//               ? "Try changing your search term."
//               : "Customer orders will appear here when they are created."}
//           </p>

//           {search && (
//             <button
//               type="button"
//               onClick={() =>
//                 setSearch("")
//               }
//             >
//               Clear search
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           {/* Desktop table */}

//           <div className="orders-table-wrapper">
//             <table className="orders-table">
//               <thead>
//                 <tr>
//                   <th>Order</th>
//                   <th>Customer</th>
//                   <th>Date</th>
//                   <th>Amount</th>
//                   <th>Payment</th>
//                   <th>Order Status</th>
//                   <th></th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredOrders.map(
//                   (order) => (
//                     <tr key={order.id}>
//                       {/* Order */}

//                       <td>
//                         <div className="order-number">
//                           {order.order_number}
//                         </div>

//                         <div className="order-id">
//                           ID #{order.id}
//                         </div>
//                       </td>

//                       {/* Customer */}

//                       <td>
//                         <div className="customer-cell">
//                           <div className="customer-avatar">
//                             {getInitials(
//                               order
//                             )}
//                           </div>

//                           <div>
//                             <strong>
//                               {getCustomerName(
//                                 order
//                               )}
//                             </strong>

//                             <span>
//                               {
//                                 order.customer_email
//                               }
//                             </span>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Date */}

//                       <td>
//                         <div className="date-cell">
//                           {formatDate(
//                             order.created_at
//                           )}
//                         </div>

//                         <span className="date-time">
//                           {new Date(
//                             order.created_at
//                           ).toLocaleTimeString(
//                             "en-NG",
//                             {
//                               hour: "2-digit",
//                               minute:
//                                 "2-digit",
//                             }
//                           )}
//                         </span>
//                       </td>

//                       {/* Amount */}

//                       <td>
//                         <strong className="order-amount">
//                           {formatCurrency(
//                             order.total_amount
//                           )}
//                         </strong>
//                       </td>

//                       {/* Payment */}

//                       <td>
//                         <select
//                           className={`status-select payment-${order.payment_status}`}
//                           value={
//                             order.payment_status ||
//                             "pending"
//                           }
//                           disabled={
//                             updatingOrder ===
//                             order.id
//                           }
//                           onChange={(event) =>
//                             handlePaymentStatusChange(
//                               order.id,
//                               event.target
//                                 .value
//                             )
//                           }
//                         >
//                           {PAYMENT_STATUSES.map(
//                             (status) => (
//                               <option
//                                 key={status}
//                                 value={status}
//                               >
//                                 {formatStatus(
//                                   status
//                                 )}
//                               </option>
//                             )
//                           )}
//                         </select>
//                       </td>

//                       {/* Order Status */}

//                       <td>
//                         <select
//                           className={`status-select order-${order.order_status}`}
//                           value={
//                             order.order_status ||
//                             "pending"
//                           }
//                           disabled={
//                             updatingOrder ===
//                             order.id
//                           }
//                           onChange={(event) =>
//                             handleOrderStatusChange(
//                               order.id,
//                               event.target
//                                 .value
//                             )
//                           }
//                         >
//                           {ORDER_STATUSES.map(
//                             (status) => (
//                               <option
//                                 key={status}
//                                 value={status}
//                               >
//                                 {formatStatus(
//                                   status
//                                 )}
//                               </option>
//                             )
//                           )}
//                         </select>
//                       </td>

//                       {/* Actions */}

//                       <td>
//                         <div className="order-actions">
//                           <button
//                             type="button"
//                             className="icon-button"
//                             title="View order"
//                             onClick={() =>
//                               setSelectedOrder(
//                                 order
//                               )
//                             }
//                           >
//                             <FiEye />
//                           </button>

//                           <button
//                             type="button"
//                             className="icon-button"
//                             title="More actions"
//                             onClick={() =>
//                               setOpenMenu(
//                                 openMenu ===
//                                   order.id
//                                   ? null
//                                   : order.id
//                               )
//                             }
//                           >
//                             <FiMoreVertical />
//                           </button>

//                           {openMenu ===
//                             order.id && (
//                             <div className="order-menu">
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setSelectedOrder(
//                                     order
//                                   );
//                                   setOpenMenu(
//                                     null
//                                   );
//                                 }}
//                               >
//                                 <FiEye />
//                                 View order
//                               </button>

//                               <button
//                                 type="button"
//                                 className="danger"
//                                 disabled={
//                                   deletingOrder ===
//                                   order.id
//                                 }
//                                 onClick={() =>
//                                   handleDeleteOrder(
//                                     order.id
//                                   )
//                                 }
//                               >
//                                 <FiTrash2 />
//                                 {deletingOrder ===
//                                 order.id
//                                   ? "Deleting..."
//                                   : "Delete order"}
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile cards */}

//           <div className="orders-mobile-list">
//             {filteredOrders.map(
//               (order) => (
//                 <div
//                   className="order-card"
//                   key={order.id}
//                 >
//                   <div className="order-card-header">
//                     <div>
//                       <strong>
//                         {order.order_number}
//                       </strong>

//                       <span>
//                         {formatDateTime(
//                           order.created_at
//                         )}
//                       </span>
//                     </div>

//                     <button
//                       type="button"
//                       className="icon-button"
//                       onClick={() =>
//                         setSelectedOrder(
//                           order
//                         )
//                       }
//                     >
//                       <FiEye />
//                     </button>
//                   </div>

//                   <div className="order-card-customer">
//                     <div className="customer-avatar">
//                       {getInitials(order)}
//                     </div>

//                     <div>
//                       <strong>
//                         {getCustomerName(
//                           order
//                         )}
//                       </strong>

//                       <span>
//                         {
//                           order.customer_email
//                         }
//                       </span>
//                     </div>
//                   </div>

//                   <div className="order-card-total">
//                     <span>Total</span>

//                     <strong>
//                       {formatCurrency(
//                         order.total_amount
//                       )}
//                     </strong>
//                   </div>

//                   <div className="mobile-statuses">
//                     <select
//                       className="status-select"
//                       value={
//                         order.payment_status ||
//                         "pending"
//                       }
//                       disabled={
//                         updatingOrder ===
//                         order.id
//                       }
//                       onChange={(event) =>
//                         handlePaymentStatusChange(
//                           order.id,
//                           event.target
//                             .value
//                         )
//                       }
//                     >
//                       {PAYMENT_STATUSES.map(
//                         (status) => (
//                           <option
//                             key={status}
//                             value={status}
//                           >
//                             Payment:{" "}
//                             {formatStatus(
//                               status
//                             )}
//                           </option>
//                         )
//                       )}
//                     </select>

//                     <select
//                       className="status-select"
//                       value={
//                         order.order_status ||
//                         "pending"
//                       }
//                       disabled={
//                         updatingOrder ===
//                         order.id
//                       }
//                       onChange={(event) =>
//                         handleOrderStatusChange(
//                           order.id,
//                           event.target
//                             .value
//                         )
//                       }
//                     >
//                       {ORDER_STATUSES.map(
//                         (status) => (
//                           <option
//                             key={status}
//                             value={status}
//                           >
//                             Order:{" "}
//                             {formatStatus(
//                               status
//                             )}
//                           </option>
//                         )
//                       )}
//                     </select>
//                   </div>

//                   <button
//                     type="button"
//                     className="mobile-view-button"
//                     onClick={() =>
//                       setSelectedOrder(
//                         order
//                       )
//                     }
//                   >
//                     <FiEye />
//                     View order
//                   </button>
//                 </div>
//               )
//             )}
//           </div>
//         </>
//       )}

//       {/* Order Details Modal */}

//       {selectedOrder && (
//         <div
//           className="order-modal-overlay"
//           onClick={() =>
//             setSelectedOrder(null)
//           }
//         >
//           <div
//             className="order-modal"
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//           >
//             <div className="order-modal-header">
//               <div>
//                 <span>
//                   Order #{selectedOrder.id}
//                 </span>

//                 <h2>
//                   {
//                     selectedOrder.order_number
//                   }
//                 </h2>
//               </div>

//               <button
//                 type="button"
//                 className="modal-close"
//                 onClick={() =>
//                   setSelectedOrder(null)
//                 }
//               >
//                 <FiX />
//               </button>
//             </div>

//             <div className="order-modal-body">
//               {/* Customer */}

//               <section className="order-detail-section">
//                 <h3>Customer</h3>

//                 <div className="detail-customer">
//                   <div className="customer-avatar large">
//                     {getInitials(
//                       selectedOrder
//                     )}
//                   </div>

//                   <div>
//                     <strong>
//                       {getCustomerName(
//                         selectedOrder
//                       )}
//                     </strong>

//                     <span>
//                       {
//                         selectedOrder.customer_email
//                       }
//                     </span>

//                     <span>
//                       {
//                         selectedOrder.customer_phone
//                       }
//                     </span>
//                   </div>
//                 </div>
//               </section>

//               {/* Shipping */}

//               <section className="order-detail-section">
//                 <h3>Shipping Information</h3>

//                 <div className="shipping-details">
//                   <strong>
//                     {
//                       selectedOrder.shipping_first_name
//                     }{" "}
//                     {
//                       selectedOrder.shipping_last_name
//                     }
//                   </strong>

//                   <span>
//                     {
//                       selectedOrder.shipping_phone
//                     }
//                   </span>

//                   <span>
//                     {
//                       selectedOrder.shipping_address
//                     }
//                   </span>

//                   <span>
//                     {
//                       selectedOrder.shipping_city
//                     }
//                     ,{" "}
//                     {
//                       selectedOrder.shipping_state
//                     }
//                   </span>

//                   <span>
//                     {
//                       selectedOrder.shipping_country
//                     }

//                     {selectedOrder.shipping_postal_code
//                       ? `, ${selectedOrder.shipping_postal_code}`
//                       : ""}
//                   </span>
//                 </div>
//               </section>

//               {/* Items */}

//               {selectedOrder.items &&
//                 selectedOrder.items.length >
//                   0 && (
//                   <section className="order-detail-section">
//                     <h3>
//                       Order Items
//                     </h3>

//                     <div className="order-items">
//                       {selectedOrder.items.map(
//                         (item) => (
//                           <div
//                             className="order-item"
//                             key={item.id}
//                           >
//                             <div className="order-item-info">
//                               <strong>
//                                 {
//                                   item.product_name
//                                 }
//                               </strong>

//                               <span>
//                                 SKU:{" "}
//                                 {
//                                   item.product_sku
//                                 }
//                               </span>

//                               <span>
//                                 {
//                                   formatCurrency(
//                                     item.price
//                                   )}{" "}
//                                 ×{" "}
//                                 {
//                                   item.quantity
//                                 }
//                               </span>
//                             </div>

//                             <strong>
//                               {formatCurrency(
//                                 item.subtotal
//                               )}
//                             </strong>
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </section>
//                 )}

//               {/* Summary */}

//               <section className="order-detail-section">
//                 <h3>Order Summary</h3>

//                 <div className="order-summary">
//                   <div>
//                     <span>
//                       Subtotal
//                     </span>

//                     <strong>
//                       {formatCurrency(
//                         selectedOrder.subtotal
//                       )}
//                     </strong>
//                   </div>

//                   <div>
//                     <span>
//                       Shipping
//                     </span>

//                     <strong>
//                       {formatCurrency(
//                         selectedOrder.shipping_fee
//                       )}
//                     </strong>
//                   </div>

//                   <div>
//                     <span>
//                       Discount
//                     </span>

//                     <strong>
//                       -
//                       {formatCurrency(
//                         selectedOrder.discount
//                       )}
//                     </strong>
//                   </div>

//                   <div className="summary-total">
//                     <span>
//                       Total
//                     </span>

//                     <strong>
//                       {formatCurrency(
//                         selectedOrder.total_amount
//                       )}
//                     </strong>
//                   </div>
//                 </div>
//               </section>

//               {/* Status */}

//               <section className="order-detail-section">
//                 <h3>Status</h3>

//                 <div className="modal-status-controls">
//                   <label>
//                     <span>
//                       Order Status
//                     </span>

//                     <select
//                       value={
//                         selectedOrder.order_status
//                       }
//                       disabled={
//                         updatingOrder ===
//                         selectedOrder.id
//                       }
//                       onChange={(event) =>
//                         handleOrderStatusChange(
//                           selectedOrder.id,
//                           event.target
//                             .value
//                         )
//                       }
//                     >
//                       {ORDER_STATUSES.map(
//                         (status) => (
//                           <option
//                             key={status}
//                             value={status}
//                           >
//                             {formatStatus(
//                               status
//                             )}
//                           </option>
//                         )
//                       )}
//                     </select>
//                   </label>

//                   <label>
//                     <span>
//                       Payment Status
//                     </span>

//                     <select
//                       value={
//                         selectedOrder.payment_status
//                       }
//                       disabled={
//                         updatingOrder ===
//                         selectedOrder.id
//                       }
//                       onChange={(event) =>
//                         handlePaymentStatusChange(
//                           selectedOrder.id,
//                           event.target
//                             .value
//                         )
//                       }
//                     >
//                       {PAYMENT_STATUSES.map(
//                         (status) => (
//                           <option
//                             key={status}
//                             value={status}
//                           >
//                             {formatStatus(
//                               status
//                             )}
//                           </option>
//                         )
//                       )}
//                     </select>
//                   </label>
//                 </div>
//               </section>

//               {/* Date */}

//               <section className="order-detail-section">
//                 <div className="order-meta">
//                   <span>
//                     Created
//                   </span>

//                   <strong>
//                     {formatDateTime(
//                       selectedOrder.created_at
//                     )}
//                   </strong>
//                 </div>

//                 <div className="order-meta">
//                   <span>
//                     Last updated
//                   </span>

//                   <strong>
//                     {formatDateTime(
//                       selectedOrder.updated_at
//                     )}
//                   </strong>
//                 </div>
//               </section>
//             </div>

//             <div className="order-modal-footer">
//               <button
//                 type="button"
//                 className="secondary-button"
//                 onClick={() =>
//                   setSelectedOrder(null)
//                 }
//               >
//                 Close
//               </button>

//               <button
//                 type="button"
//                 className="danger-button"
//                 onClick={() =>
//                   handleDeleteOrder(
//                     selectedOrder.id
//                   )
//                 }
//               >
//                 <FiTrash2 />
//                 Delete Order
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;



import { useEffect, useMemo, useState } from "react";
import {
    FiSearch,
    FiRefreshCw,
    FiEye,
    FiChevronDown,
    FiShoppingBag,
    FiClock,
    FiTruck,
    FiCheckCircle,
    FiXCircle,
    FiDollarSign,
} from "react-icons/fi";

import {
    getAdminOrders,
    getAdminOrderStats,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
} from "../../services/orderService";

import "./Orders.scss";


const ORDER_STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const PAYMENT_STATUSES = [
    "pending",
    "paid",
    "failed",
    "refunded",
    "partially_refunded",
];


const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};


const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


const formatStatus = (status) => {
    if (!status) return "-";

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};


const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
};


const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    });


    const [search, setSearch] = useState("");
    const [orderStatusFilter, setOrderStatusFilter] =
        useState("all");

    const [paymentStatusFilter, setPaymentStatusFilter] =
        useState("all");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] = useState("");

    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const handleViewOrder = async (orderId) => {
        try {
            setError("");
            setSelectedOrder(null);

            const response =
                await getOrderById(orderId);

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to retrieve order"
                );
            }

            setSelectedOrder(response.order);

        } catch (err) {
            console.error(
                "Get order details error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to retrieve order details"
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Load Orders
    |--------------------------------------------------------------------------
    */

    const loadOrders = async (
        showRefresh = false
    ) => {
        try {
            setError("");

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [
                ordersResponse,
                statsResponse,
            ] = await Promise.all([
                getAdminOrders(),
                getAdminOrderStats(),
            ]);

            if (ordersResponse?.success) {
                setOrders(
                    ordersResponse.orders || []
                );
            } else {
                throw new Error(
                    ordersResponse?.message ||
                    "Failed to load orders"
                );
            }

            if (statsResponse?.success) {
                setStats(
                    statsResponse.data || {}
                );
            }

        } catch (err) {
            console.error(
                "Load orders error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load orders"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        loadOrders();
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Filter Orders
    |--------------------------------------------------------------------------
    */

    const filteredOrders = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return orders.filter((order) => {
            const customerName =
                `${order.customer_first_name || ""} ${order.customer_last_name || ""
                    }`.trim();

            const matchesSearch =
                !normalizedSearch ||
                order.order_number
                    ?.toLowerCase()
                    .includes(normalizedSearch) ||
                customerName
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                order.customer_email
                    ?.toLowerCase()
                    .includes(normalizedSearch);

            const matchesOrderStatus =
                orderStatusFilter === "all" ||
                order.order_status ===
                orderStatusFilter;

            const matchesPaymentStatus =
                paymentStatusFilter === "all" ||
                order.payment_status ===
                paymentStatusFilter;

            return (
                matchesSearch &&
                matchesOrderStatus &&
                matchesPaymentStatus
            );
        });
    }, [
        orders,
        search,
        orderStatusFilter,
        paymentStatusFilter,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Update Order Status
    |--------------------------------------------------------------------------
    */

    const handleOrderStatusChange = async (
        orderId,
        status
    ) => {
        try {
            setUpdatingOrderId(orderId);
            setError("");

            const response =
                await updateOrderStatus(
                    orderId,
                    status
                );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to update order status"
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            order_status:
                                status,
                        }
                        : order
                )
            );

            setSelectedOrder((current) =>
                current?.id === orderId
                    ? {
                        ...current,
                        order_status:
                            status,
                    }
                    : current
            );

            await loadOrders(true);

        } catch (err) {
            console.error(
                "Update order status error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update order status"
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Update Payment Status
    |--------------------------------------------------------------------------
    */

    const handlePaymentStatusChange = async (
        orderId,
        paymentStatus
    ) => {
        try {
            setUpdatingOrderId(orderId);
            setError("");

            const response =
                await updatePaymentStatus(
                    orderId,
                    paymentStatus
                );

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to update payment status"
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            payment_status:
                                paymentStatus,
                        }
                        : order
                )
            );

            setSelectedOrder((current) =>
                current?.id === orderId
                    ? {
                        ...current,
                        payment_status:
                            paymentStatus,
                    }
                    : current
            );

            await loadOrders(true);

        } catch (err) {
            console.error(
                "Update payment status error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update payment status"
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const statCards = [
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: FiShoppingBag,
            className: "blue",
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: FiClock,
            className: "orange",
        },
        {
            title: "Processing",
            value: stats.processing,
            icon: FiRefreshCw,
            className: "purple",
        },
        {
            title: "Shipped",
            value: stats.shipped,
            icon: FiTruck,
            className: "cyan",
        },
        {
            title: "Delivered",
            value: stats.delivered,
            icon: FiCheckCircle,
            className: "green",
        },
        {
            title: "Cancelled",
            value: stats.cancelled,
            icon: FiXCircle,
            className: "red",
        },
        {
            title: "Revenue",
            value: formatCurrency(
                stats.totalRevenue
            ),
            icon: FiDollarSign,
            className: "revenue",
        },
    ];


    return (
        <div className="admin-orders">

            {/* -------------------------------------------------
                Header
            ------------------------------------------------- */}

            <div className="orders-header">

                <div>
                    <h1>Orders</h1>

                    <p>
                        Manage and track customer
                        orders.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-button"
                    onClick={() =>
                        loadOrders(true)
                    }
                    disabled={refreshing}
                >
                    <FiRefreshCw
                        className={
                            refreshing
                                ? "spinning"
                                : ""
                        }
                    />

                    <span>
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </span>
                </button>

            </div>


            {/* -------------------------------------------------
                Error
            ------------------------------------------------- */}

            {error && (
                <div className="orders-error">
                    {error}
                </div>
            )}


            {/* -------------------------------------------------
                Statistics
            ------------------------------------------------- */}

            <div className="order-stats">

                {statCards.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            className={`order-stat-card ${stat.className}`}
                            key={stat.title}
                        >
                            <div className="stat-icon">
                                <Icon />
                            </div>

                            <div className="stat-content">
                                <span>
                                    {stat.title}
                                </span>

                                <strong>
                                    {stat.value}
                                </strong>
                            </div>
                        </div>
                    );
                })}

            </div>


            {/* -------------------------------------------------
                Filters
            ------------------------------------------------- */}

            <div className="orders-toolbar">

                <div className="order-search">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Search order number, customer..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="order-filter">

                    <select
                        value={
                            orderStatusFilter
                        }
                        onChange={(event) =>
                            setOrderStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Order Statuses
                        </option>

                        {ORDER_STATUSES.map(
                            (status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {formatStatus(
                                        status
                                    )}
                                </option>
                            )
                        )}
                    </select>

                    <FiChevronDown />

                </div>


                <div className="order-filter">

                    <select
                        value={
                            paymentStatusFilter
                        }
                        onChange={(event) =>
                            setPaymentStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Payment Statuses
                        </option>

                        {PAYMENT_STATUSES.map(
                            (status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {formatStatus(
                                        status
                                    )}
                                </option>
                            )
                        )}
                    </select>

                    <FiChevronDown />

                </div>

            </div>


            {/* -------------------------------------------------
                Orders Table
            ------------------------------------------------- */}

            <div className="orders-card">

                <div className="orders-card-header">

                    <div>
                        <h2>
                            All Orders
                        </h2>

                        <span>
                            {filteredOrders.length}{" "}
                            {filteredOrders.length === 1
                                ? "order"
                                : "orders"}
                        </span>
                    </div>

                </div>


                {loading ? (
                    <div className="orders-loading">

                        <FiRefreshCw className="spinning" />

                        <p>
                            Loading orders...
                        </p>

                    </div>
                ) : filteredOrders.length ===
                    0 ? (
                    <div className="orders-empty">

                        <FiShoppingBag />

                        <h3>
                            No orders found
                        </h3>

                        <p>
                            There are no orders
                            matching your current
                            filters.
                        </p>

                    </div>
                ) : (
                    <div className="orders-table-wrapper">

                        <table className="orders-table">

                            <thead>
                                <tr>
                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Payment
                                    </th>

                                    <th>
                                        Order Status
                                    </th>

                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>


                            <tbody>

                                {filteredOrders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order.id
                                            }
                                        >

                                            <td>
                                                <strong className="order-number">
                                                    #
                                                    {
                                                        order.order_number
                                                    }
                                                </strong>
                                            </td>


                                            <td>
                                                <div className="customer-cell">

                                                    <div className="customer-avatar">
                                                        {getInitials(
                                                            order.customer_first_name,
                                                            order.customer_last_name
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                order.customer_first_name
                                                            }{" "}
                                                            {
                                                                order.customer_last_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                order.customer_email
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>


                                            <td>
                                                <div className="date-cell">

                                                    <strong>
                                                        {formatDate(
                                                            order.created_at
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {formatDateTime(
                                                            order.created_at
                                                        )
                                                            .split(
                                                                ", "
                                                            )
                                                            .pop()}
                                                    </span>

                                                </div>
                                            </td>


                                            <td>
                                                <strong className="order-total">
                                                    {formatCurrency(
                                                        order.total_amount
                                                    )}
                                                </strong>
                                            </td>


                                            <td>

                                                <select
                                                    className={`status-select payment-${order.payment_status}`}
                                                    value={
                                                        order.payment_status
                                                    }
                                                    disabled={
                                                        updatingOrderId ===
                                                        order.id
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handlePaymentStatusChange(
                                                            order.id,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    {PAYMENT_STATUSES.map(
                                                        (
                                                            status
                                                        ) => (
                                                            <option
                                                                key={
                                                                    status
                                                                }
                                                                value={
                                                                    status
                                                                }
                                                            >
                                                                {formatStatus(
                                                                    status
                                                                )}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                            </td>


                                            <td>

                                                <select
                                                    className={`status-select order-${order.order_status}`}
                                                    value={
                                                        order.order_status
                                                    }
                                                    disabled={
                                                        updatingOrderId ===
                                                        order.id
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleOrderStatusChange(
                                                            order.id,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    {ORDER_STATUSES.map(
                                                        (
                                                            status
                                                        ) => (
                                                            <option
                                                                key={
                                                                    status
                                                                }
                                                                value={
                                                                    status
                                                                }
                                                            >
                                                                {formatStatus(
                                                                    status
                                                                )}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="view-order-button"
                                                    onClick={() =>
                                                        handleViewOrder(order.id)
                                                    }
                                                    title="View order"
                                                >
                                                    <FiEye />
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>


            {/* -------------------------------------------------
                Order Details Modal
            ------------------------------------------------- */}

            {/* {selectedOrder && (
                <div
                    className="order-modal-overlay"
                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >

                    <div
                        className="order-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="order-modal-header">

                            <div>
                                <span>
                                    Order Details
                                </span>

                                <h2>
                                    #
                                    {
                                        selectedOrder.order_number
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedOrder(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="order-modal-body">

                            <div className="detail-section">

                                <h3>
                                    Customer
                                </h3>

                                <div className="customer-detail">

                                    <div className="customer-avatar large">
                                        {getInitials(
                                            selectedOrder.customer_first_name,
                                            selectedOrder.customer_last_name
                                        )}
                                    </div>

                                    <div>
                                        <strong>
                                            {
                                                selectedOrder.customer_first_name
                                            }{" "}
                                            {
                                                selectedOrder.customer_last_name
                                            }
                                        </strong>

                                        <span>
                                            {
                                                selectedOrder.customer_email
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>


                            <div className="detail-section">

                                <h3>
                                    Shipping Address
                                </h3>

                                <p>
                                    {
                                        selectedOrder.shipping_first_name
                                    }{" "}
                                    {
                                        selectedOrder.shipping_last_name
                                    }

                                    <br />

                                    {
                                        selectedOrder.shipping_address
                                    }

                                    <br />

                                    {
                                        selectedOrder.shipping_city
                                    }
                                    ,{" "}
                                    {
                                        selectedOrder.shipping_state
                                    }

                                    <br />

                                    {
                                        selectedOrder.shipping_country
                                    }

                                    <br />

                                    Phone:{" "}
                                    {
                                        selectedOrder.shipping_phone
                                    }
                                </p>

                            </div>


                            <div className="detail-grid">

                                <div>
                                    <span>
                                        Order Date
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedOrder.created_at
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedOrder.subtotal
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Shipping
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedOrder.shipping_fee
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Discount
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedOrder.discount
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Payment
                                    </span>

                                    <strong>
                                        {formatStatus(
                                            selectedOrder.payment_status
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Order Status
                                    </span>

                                    <strong>
                                        {formatStatus(
                                            selectedOrder.order_status
                                        )}
                                    </strong>
                                </div>

                            </div>


                            <div className="modal-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {formatCurrency(
                                        selectedOrder.total_amount
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>
            )} */}

            {selectedOrder && (
                <div
                    className="order-modal-overlay"
                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >
                    <div
                        className="order-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* -------------------------------------------------
                Modal Header
            ------------------------------------------------- */}

                        <div className="order-modal-header">

                            <div>
                                <span>
                                    Order Details
                                </span>

                                <h2>
                                    #
                                    {
                                        selectedOrder.order_number
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedOrder(null)
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        {/* -------------------------------------------------
                Modal Body
            ------------------------------------------------- */}

                        <div className="order-modal-body">

                            {/* =============================================
                    Customer
                ============================================= */}

                            <div className="detail-section">

                                <h3>
                                    Customer
                                </h3>

                                <div className="customer-detail">

                                    <div className="customer-avatar large">
                                        {getInitials(
                                            selectedOrder.customer_first_name,
                                            selectedOrder.customer_last_name
                                        )}
                                    </div>

                                    <div>
                                        <strong>
                                            {
                                                selectedOrder.customer_first_name
                                            }{" "}
                                            {
                                                selectedOrder.customer_last_name
                                            }
                                        </strong>

                                        <span>
                                            {
                                                selectedOrder.customer_email
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>


                            {/* =============================================
                    Order Information
                ============================================= */}

                            <div className="detail-section">

                                <h3>
                                    Order Information
                                </h3>

                                <div className="detail-grid">

                                    <div>
                                        <span>
                                            Order Number
                                        </span>

                                        <strong>
                                            #
                                            {
                                                selectedOrder.order_number
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Order Date
                                        </span>

                                        <strong>
                                            {formatDateTime(
                                                selectedOrder.created_at
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Order Status
                                        </span>

                                        <strong>
                                            {formatStatus(
                                                selectedOrder.order_status
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Payment Status
                                        </span>

                                        <strong>
                                            {formatStatus(
                                                selectedOrder.payment_status
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* =============================================
                    Shipping Address
                ============================================= */}

                            <div className="detail-section">

                                <h3>
                                    Shipping Address
                                </h3>

                                <div className="shipping-address">

                                    <strong>
                                        {
                                            selectedOrder.shipping_first_name
                                        }{" "}
                                        {
                                            selectedOrder.shipping_last_name
                                        }
                                    </strong>

                                    <p>
                                        {
                                            selectedOrder.shipping_address
                                        }

                                        <br />

                                        {
                                            selectedOrder.shipping_city
                                        }
                                        ,{" "}
                                        {
                                            selectedOrder.shipping_state
                                        }

                                        <br />

                                        {
                                            selectedOrder.shipping_country
                                        }

                                        {
                                            selectedOrder.shipping_postal_code
                                                ? `, ${selectedOrder.shipping_postal_code}`
                                                : ""
                                        }

                                        <br />

                                        Phone:{" "}
                                        {
                                            selectedOrder.shipping_phone
                                        }
                                    </p>

                                </div>

                            </div>


                            {/* =============================================
                    Order Items
                ============================================= */}

                            <div className="detail-section">

                                <div className="section-heading-row">

                                    <h3>
                                        Order Items
                                    </h3>

                                    <span>
                                        {
                                            selectedOrder.items?.length ||
                                            0
                                        }{" "}
                                        {
                                            selectedOrder.items?.length ===
                                                1
                                                ? "item"
                                                : "items"
                                        }
                                    </span>

                                </div>


                                {selectedOrder.items?.length > 0 ? (
                                    <div className="order-items">

                                        {selectedOrder.items.map(
                                            (item) => (
                                                <div
                                                    className="order-item"
                                                    key={item.id}
                                                >

                                                    <div className="order-item-image">
                                                        <FiShoppingBag />
                                                    </div>


                                                    <div className="order-item-info">

                                                        <strong>
                                                            {
                                                                item.product_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            SKU:{" "}
                                                            {
                                                                item.product_sku
                                                            }
                                                        </span>

                                                        <span>
                                                            Qty:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="order-item-price">

                                                        <span>
                                                            {formatCurrency(
                                                                item.price
                                                            )}{" "}
                                                            ×{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                        <strong>
                                                            {formatCurrency(
                                                                item.subtotal
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <div className="no-order-items">
                                        No order items found.
                                    </div>
                                )}

                            </div>


                            {/* =============================================
                    Payment Records
                ============================================= */}

                            <div className="detail-section">

                                <div className="section-heading-row">

                                    <h3>
                                        Payment Records
                                    </h3>

                                    <span>
                                        {
                                            selectedOrder.payments?.length ||
                                            0
                                        }{" "}
                                        {
                                            selectedOrder.payments?.length ===
                                                1
                                                ? "payment"
                                                : "payments"
                                        }
                                    </span>

                                </div>


                                {selectedOrder.payments?.length > 0 ? (
                                    <div className="payment-records">

                                        {selectedOrder.payments.map(
                                            (payment) => (
                                                <div
                                                    className="payment-record"
                                                    key={payment.id}
                                                >

                                                    <div>
                                                        <strong>
                                                            {
                                                                payment.provider
                                                            }
                                                        </strong>

                                                        <span>
                                                            Reference:{" "}
                                                            {
                                                                payment.reference
                                                            }
                                                        </span>
                                                    </div>


                                                    <div>
                                                        <strong>
                                                            {formatCurrency(
                                                                payment.amount
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {formatStatus(
                                                                payment.status
                                                            )}
                                                        </span>
                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>
                                ) : (
                                    <div className="no-order-items">
                                        No payment records found.
                                    </div>
                                )}

                            </div>


                            {/* =============================================
                    Financial Summary
                ============================================= */}

                            <div className="order-summary">

                                <div className="summary-row">
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedOrder.subtotal
                                        )}
                                    </strong>
                                </div>


                                <div className="summary-row">
                                    <span>
                                        Shipping
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedOrder.shipping_fee
                                        )}
                                    </strong>
                                </div>


                                <div className="summary-row">
                                    <span>
                                        Discount
                                    </span>

                                    <strong>
                                        -{" "}
                                        {formatCurrency(
                                            selectedOrder.discount
                                        )}
                                    </strong>
                                </div>


                                <div className="summary-row total">
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedOrder.total_amount
                                        )}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};


export default Orders;