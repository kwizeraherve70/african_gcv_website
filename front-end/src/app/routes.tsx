import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { News } from './pages/News';
import { NewsCountries } from './pages/NewsCountries';
import { NewsDetail } from './pages/NewsDetail';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { AdminContacts } from './pages/admin/AdminContacts';
import { AdminNews } from './pages/admin/AdminNews';
import { AdminNewsForm } from './pages/admin/AdminNewsForm';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';
import { Team } from './pages/Team';
import { Ambassadors } from './pages/Ambassadors';
import { IndustryAlliance } from './pages/IndustryAlliance';
import { Merchants } from './pages/Merchants';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },

      // News & Media
      { path: 'news', element: <NewsCountries /> },
      { path: 'news/all', element: <News /> },
      { path: 'news/country/:country', element: <News /> },
      { path: 'news/:slug', element: <NewsDetail /> },

      // Shop / Market
      { path: 'shop', element: <Shop /> },
      { path: 'shop/product/:slug', element: <ProductDetail /> },

      // Cart & Checkout
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'order-confirmation', element: <OrderConfirmation /> },

      // Auth
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },

      // Admin (ADMIN role only — see components/ProtectedRoute.tsx)
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'products/new', element: <AdminProductForm /> },
          { path: 'products/:id/edit', element: <AdminProductForm /> },
          { path: 'orders', element: <AdminOrders /> },
          { path: 'orders/:id', element: <AdminOrderDetail /> },
          { path: 'contacts', element: <AdminContacts /> },
          { path: 'news', element: <AdminNews /> },
          { path: 'news/new', element: <AdminNewsForm /> },
          { path: 'news/:id/edit', element: <AdminNewsForm /> },
        ],
      },

      // Static pages
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },

      // People
      { path: 'team', element: <Team /> },
      { path: 'ambassadors', element: <Ambassadors /> },

      // Alliance
      { path: 'industry-alliance', element: <IndustryAlliance /> },
      { path: 'merchants', element: <Merchants /> },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
