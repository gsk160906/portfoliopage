import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Scroll to top on navigation
import ScrollToTop from './components/ScrollToTop';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import Home from './pages/public/Home';
import AllServices from './pages/public/AllServices';
import ServiceCategory from './pages/public/ServiceCategory';
import ServiceDetails from './pages/public/ServiceDetails';
import HowItWorks from './pages/public/HowItWorks';
import About from './pages/public/About';
import FAQ from './pages/public/FAQ';
import Contact from './pages/public/Contact';
import BlogList from './pages/public/BlogList';
import BlogDetails from './pages/public/BlogDetails';
import BecomeProvider from './pages/public/BecomeProvider';
import Login from './pages/public/Login';
import SignUp from './pages/public/SignUp';
import ForgotPassword from './pages/public/ForgotPassword';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import Cancellation from './pages/public/Cancellation';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import BookService from './pages/customer/BookService';
import Schedule from './pages/customer/Schedule';
import AddressSelect from './pages/customer/AddressSelect';
import Checkout from './pages/customer/Checkout';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import MyBookings from './pages/customer/MyBookings';
import BookingDetails from './pages/customer/BookingDetails';
import CustomerProfile from './pages/customer/Profile';
import SavedAddresses from './pages/customer/SavedAddresses';
import PaymentHistory from './pages/customer/PaymentHistory';
import Notifications from './pages/customer/Notifications';

// Provider Pages
import ProviderOnboarding from './pages/provider/Onboarding';
import ProviderDashboard from './pages/provider/Dashboard';
import JobRequests from './pages/provider/JobRequests';
import JobDetails from './pages/provider/JobDetails';
import ActiveJobs from './pages/provider/ActiveJobs';
import CompletedJobs from './pages/provider/CompletedJobs';
import Availability from './pages/provider/Availability';
import ServiceManagement from './pages/provider/ServiceManagement';
import Earnings from './pages/provider/Earnings';
import PayoutSettings from './pages/provider/PayoutSettings';
import ProviderProfile from './pages/provider/Profile';
import ProviderReviews from './pages/provider/Reviews';
import ProviderSupport from './pages/provider/Support';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminServiceManagement from './pages/admin/ServiceManagement';
import BookingManagement from './pages/admin/BookingManagement';
import Reports from './pages/admin/Reports';
import BlogManagement from './pages/admin/BlogManagement';
import FAQManagement from './pages/admin/FAQManagement';

// Public Layout Wrapper
function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><AllServices /></PublicLayout>} />
        <Route path="/services/category/:categoryId" element={<PublicLayout><ServiceCategory /></PublicLayout>} />
        <Route path="/services/:serviceId" element={<PublicLayout><ServiceDetails /></PublicLayout>} />
        <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogList /></PublicLayout>} />
        <Route path="/blog/:blogId" element={<PublicLayout><BlogDetails /></PublicLayout>} />
        <Route path="/become-provider" element={<PublicLayout><BecomeProvider /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
        <Route path="/cancellation-policy" element={<PublicLayout><Cancellation /></PublicLayout>} />

        {/* Customer Routes */}
        <Route path="/customer" element={<DashboardLayout role="customer" />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="book-service" element={<BookService />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="address" element={<AddressSelect />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="confirmation" element={<BookingConfirmation />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:bookingId" element={<BookingDetails />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="addresses" element={<SavedAddresses />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Provider Routes */}
        <Route path="/provider/onboarding" element={<ProviderOnboarding />} />
        <Route path="/provider" element={<DashboardLayout role="provider" />}>
          <Route index element={<ProviderDashboard />} />
          <Route path="job-requests" element={<JobRequests />} />
          <Route path="jobs/:jobId" element={<JobDetails />} />
          <Route path="active-jobs" element={<ActiveJobs />} />
          <Route path="completed-jobs" element={<CompletedJobs />} />
          <Route path="availability" element={<Availability />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="payout" element={<PayoutSettings />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="reviews" element={<ProviderReviews />} />
          <Route path="support" element={<ProviderSupport />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="services" element={<AdminServiceManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="blog" element={<BlogManagement />} />
          <Route path="faq" element={<FAQManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
