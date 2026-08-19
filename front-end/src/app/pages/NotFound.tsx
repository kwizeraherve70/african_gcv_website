import { Link } from 'react-router';
import { Home, ArrowRight } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Big 404 */}
        <div className="mb-8">
          <h1 className="text-[9rem] font-bold leading-none bg-gradient-to-br from-brand-purple to-brand-purple-light bg-clip-text text-transparent select-none">
            404
          </h1>
        </div>

        <h2 className="text-3xl font-bold mb-3 tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you
          back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3.5 bg-brand-purple text-white rounded-xl hover:bg-brand-purple-light transition-all duration-200 inline-flex items-center justify-center gap-2 font-semibold shadow-lg shadow-brand-purple/20 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/news"
            className="px-6 py-3.5 border border-border rounded-xl hover:bg-accent transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium"
          >
            Browse News
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
