import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { News } from './pages/News';
import { NewsDetail } from './pages/NewsDetail';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';
import { Team } from './pages/Team';
import { Founders } from './pages/Founders';
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
      { path: 'news', element: <News /> },
      { path: 'news/:slug', element: <NewsDetail /> },

      // Shop / Market
      { path: 'shop', element: <Shop /> },
      { path: 'shop/product/:slug', element: <ProductDetail /> },

      // Cart & Checkout
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'order-confirmation', element: <OrderConfirmation /> },

      // Static pages
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },

      // People
      { path: 'team', element: <Team /> },
      { path: 'founders', element: <Founders /> },
      { path: 'ambassadors', element: <Ambassadors /> },

      // Alliance
      { path: 'industry-alliance', element: <IndustryAlliance /> },
      { path: 'merchants', element: <Merchants /> },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
