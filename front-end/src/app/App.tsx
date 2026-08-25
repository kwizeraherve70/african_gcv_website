import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import i18n from './i18n';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { router } from './routes';

// Keeps <html lang="..."> in sync with the active i18n language — matters
// for screen readers and search engines, not just visual text.
function useDocumentLangSync() {
  useEffect(() => {
    const applyLang = (lng: string) => {
      document.documentElement.lang = lng;
    };
    applyLang(i18n.language);
    i18n.on('languageChanged', applyLang);
    return () => i18n.off('languageChanged', applyLang);
  }, []);
}

export default function App() {
  useDocumentLangSync();
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}