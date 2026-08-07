import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import PrivateRoute from "./PrivateRoute";

// Public pages
import HomePage from "../pages/Home/HomePage";
import MotorcyclePage from "../pages/Motorcycle/MotorcyclePage";
import MotorcycleDetailPage from "../pages/Motorcycle/MotorcycleDetailPage";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Order/CheckoutPage";
import PaymentPage from "../pages/Order/PaymentPage";
import OrderHistoryPage from "../pages/Order/OrderHistoryPage";
import UserProfilePage from "../pages/User/UserProfilePage";
import AccountSettingsPage from "../pages/User/AccountSettingsPage";
import BookingPage from "../pages/Booking/BookingPage";
import BookingHistoryPage from "../pages/Booking/BookingHistoryPage";
import ContactPage from "../pages/Contact/ContactPage";
import AboutPage from "../pages/About/AboutPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPasswordPage";

// Admin pages
import DashboardPage from "../pages/Admin/Dashboard/DashboardPage";
import MotorcycleManagement from "../pages/Admin/Motorcycle/MotorcycleManagement";
import MotorcycleForm from "../pages/Admin/Motorcycle/MotorcycleForm";
import BrandManagement from "../pages/Admin/Brand/BrandManagement";
import BrandForm from "../pages/Admin/Brand/BrandForm";
import CategoryManagement from "../pages/Admin/Category/CategoryManagement";
import CategoryForm from "../pages/Admin/Category/CategoryForm";
import OrderManagement from "../pages/Admin/Order/OrderManagement";
import BookingManagement from "../pages/Admin/Booking/BookingManagement";
import UserManagement from "../pages/Admin/User/UserManagement";
import PasswordResetManagement from "../pages/Admin/User/PasswordResetManagement";
import ReviewManagement from "../pages/Admin/Review/ReviewManagement";
import ContactManagement from "../pages/Admin/Contact/ContactManagement";
import StatisticsPage from "../pages/Admin/Statistics/StatisticsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/motorcycles" element={<MotorcyclePage />} />
        <Route path="/motorcycles/:slug" element={<MotorcycleDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Cần đăng nhập */}
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/settings"
          element={
            <PrivateRoute>
              <AccountSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <PrivateRoute>
              <OrderHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <PaymentPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <PrivateRoute>
              <BookingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <BookingHistoryPage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="motorcycles" element={<MotorcycleManagement />} />
        <Route path="motorcycles/add" element={<MotorcycleForm />} />
        <Route path="motorcycles/edit/:id" element={<MotorcycleForm />} />
        <Route path="brands" element={<BrandManagement />} />
        <Route path="brands/add" element={<BrandForm />} />
        <Route path="brands/edit/:id" element={<BrandForm />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="categories/add" element={<CategoryForm />} />
        <Route path="categories/edit/:id" element={<CategoryForm />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="password-reset-requests" element={<PasswordResetManagement />} />
        <Route path="reviews" element={<ReviewManagement />} />
        <Route path="contacts" element={<ContactManagement />} />
        <Route path="statistics" element={<StatisticsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
