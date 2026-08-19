import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { SEO } from '../components/SEO';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-all';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      // `from` is only ever set when ProtectedRoute bounced an unauthenticated
      // visitor off an /admin/* URL, so honoring it already sends admins to
      // the right place; otherwise send admins straight to the dashboard
      // instead of the public homepage.
      const redirectTo = from ?? (user.roles.includes('ADMIN') ? '/admin' : '/');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 min-h-[70vh] flex items-center bg-accent/40">
      <SEO title="Log In" url="/login" noIndex />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl shadow-black/5">
          <div className="w-12 h-12 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-5">
            <LogIn className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Log in to your Pi Global GCV Alliance account.</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-purple/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-purple font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
