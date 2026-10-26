import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// ADMIN
// =====================================================

import AdminLayout from "./admin/AdminLayout/AdminLayout";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

import Dashboard from "./admin/Dashboard/Dashboard";
import Products from "./admin/Products/Products";
import CreateProduct from "./admin/CreateProduct/CreateProduct";
import EditProduct from "./admin/EditProduct/EditProduct";
import Orders from "./admin/Orders/Orders";
import Categories from "./admin/Categories/Categories";
import Customers from "./admin/Customers/Customers";
import AdminLogin from "./admin/adminLogin/AdminLogin";

// =====================================================
// CUSTOMER PAGES
// =====================================================

import Home from "./pages/Home/Home";
import ProductsPage from "./pages/Products/Products";
import ProductDetails from "./pages/ProductDetails/ProductDetails";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";

import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";

import OrderDetails from "./pages/Orders/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";

import PaymentCallback from "./pages/Payment/PaymentCallback";


function App() {
  return (
    <Routes>

      {/* =====================================================
          CUSTOMER STOREFRONT
      ===================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/products"
        element={<ProductsPage />}
      />

      <Route
        path="/products/:slug"
        element={<ProductDetails />}
      />


      {/* =====================================================
          CUSTOMER AUTH
      ===================================================== */}

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />


      {/* =====================================================
          CUSTOMER CART
      ===================================================== */}

      <Route
        path="/cart"
        element={<Cart />}
      />


      {/* =====================================================
          CUSTOMER CHECKOUT
      ===================================================== */}

      <Route
        path="/checkout"
        element={<Checkout />}
      />


      {/* CUSTOMER ORDERS */}

      <Route
        path="/orders/:id"
        element={<OrderDetails />}
      />

      <Route
        path="/order-success"
        element={<OrderSuccess />}
      />


      {/* PAYSTACK CALLBACK */}

      <Route
        path="/payment/callback"
        element={<PaymentCallback />}
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/*PROTECTED ADMIN AREA*/}

      <Route element={<ProtectedAdminRoute />}>

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* Dashboard */}

          <Route
            index
            element={<Dashboard />}
          />


          {/* Products */}

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="products/create"
            element={<CreateProduct />}
          />

          <Route
            path="products/:id/edit"
            element={<EditProduct />}
          />


          {/* Categories */}

          <Route
            path="categories"
            element={<Categories />}
          />


          {/* Orders */}

          <Route
            path="orders"
            element={<Orders />}
          />


          {/* Customers */}

          <Route
            path="customers"
            element={<Customers />}
          />

        </Route>

      </Route>


      {/*UNKNOWN ROUTES */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;