import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * Role-gated route guard. Redirects as a debounced side effect rather than
 * calling navigate() in the render body or via a bare <Navigate> on the
 * first render — see architecture-context.md "React Router v7 + side
 * effects in render": navigate() is wrapped in startTransition, so this
 * component can render against a transient/stale auth snapshot in the
 * instant a transition starts, one tick before AuthContext has propagated.
 * Checkout.tsx hit the identical race with CartContext; this reuses that
 * fix's shape.
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole: string;
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const allowed = isAuthenticated && !!user?.roles.includes(requiredRole);

  useEffect(() => {
    if (allowed) return;
    const timeout = setTimeout(() => {
      navigate(isAuthenticated ? '/' : '/login', {
        replace: true,
        state: isAuthenticated ? undefined : { from: location.pathname },
      });
    }, 150);
    return () => clearTimeout(timeout);
  }, [allowed, isAuthenticated, navigate, location.pathname]);

  if (!allowed) return null;
  return <>{children}</>;
}
