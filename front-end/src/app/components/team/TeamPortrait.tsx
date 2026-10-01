import { Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function TeamPortrait({ src, name, className, loading = 'lazy' }: {
  src: string | null;
  name: string;
  className: string;
  loading?: 'eager' | 'lazy';
}) {
  const { t } = useTranslation('about');
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (!src || failedSource === src) {
    return (
      <span role="img" aria-label={t('team.ui.photoUnavailable', { name })}
        className={`${className} inline-flex items-center justify-center bg-brand-surface text-muted-foreground`}>
        <Users className="w-1/2 h-1/2 max-w-16 max-h-16" aria-hidden="true" />
      </span>
    );
  }

  return <img src={src} alt={name} className={className} loading={loading} onError={() => setFailedSource(src)} />;
}
