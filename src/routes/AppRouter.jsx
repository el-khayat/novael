import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import MainLayout from '../components/layout/MainLayout.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const Home = lazy(() => import('../pages/Home.jsx'))
const Shop = lazy(() => import('../pages/Shop.jsx'))
const ProductDetail = lazy(() => import('../pages/ProductDetail.jsx'))
const Cart = lazy(() => import('../pages/Cart.jsx'))
const Checkout = lazy(() => import('../pages/Checkout.jsx'))
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation.jsx'))
const Account = lazy(() => import('../pages/Account.jsx'))
const OrderHistory = lazy(() => import('../pages/OrderHistory.jsx'))
const Login = lazy(() => import('../pages/Login.jsx'))
const Register = lazy(() => import('../pages/Register.jsx'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx'))
const About = lazy(() => import('../pages/About.jsx'))
const Contact = lazy(() => import('../pages/Contact.jsx'))
const NotFound = lazy(() => import('../pages/NotFound.jsx'))

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'))
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders.jsx'))
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts.jsx'))
const AdminStock = lazy(() => import('../pages/admin/AdminStock.jsx'))
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers.jsx'))
const AdminMarketing = lazy(() => import('../pages/admin/AdminMarketing.jsx'))

const FullLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <Spinner label="Loading" />
  </div>
)

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

function PageFade({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: 'linear' }}
    >
      {children}
    </motion.div>
  )
}

export default function AppRouter() {
  const location = useLocation()
  return (
    <Suspense fallback={<FullLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<PageFade><Home /></PageFade>} />
            <Route path="/shop" element={<PageFade><Shop /></PageFade>} />
            <Route path="/shop/:slug" element={<PageFade><ProductDetail /></PageFade>} />
            <Route path="/cart" element={<PageFade><Cart /></PageFade>} />
            <Route path="/checkout" element={<PageFade><Checkout /></PageFade>} />
            <Route path="/order-confirmation/:orderId" element={<PageFade><OrderConfirmation /></PageFade>} />
            <Route path="/about" element={<PageFade><About /></PageFade>} />
            <Route path="/contact" element={<PageFade><Contact /></PageFade>} />
            <Route path="/login" element={<PageFade><Login /></PageFade>} />
            <Route path="/register" element={<PageFade><Register /></PageFade>} />
            <Route path="/forgot-password" element={<PageFade><ForgotPassword /></PageFade>} />

            <Route element={<ProtectedRoute requiredAuth />}>
              <Route path="/account" element={<PageFade><Account /></PageFade>} />
              <Route path="/account/orders" element={<PageFade><OrderHistory /></PageFade>} />
            </Route>

            <Route path="*" element={<PageFade><NotFound /></PageFade>} />
          </Route>

          <Route element={<ProtectedRoute requiredAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="stock" element={<AdminStock />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="marketing" element={<AdminMarketing />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}
