import { useTranslation } from 'react-i18next';

export function TeamContentState({ status, onRetry }: {
  status: 'loading' | 'error';
  onRetry: () => void;
}) {
  const { t } = useTranslation('about');
  if (status === 'loading') {
    return (
      <div role="status" aria-live="polite" className="py-8">
        <p className="text-sm text-muted-foreground mb-5">{t('team.ui.loading')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-hidden="true">
          {[0, 1].map(index => (
            <div key={index} className="h-36 rounded-2xl bg-brand-surface motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div role="alert" className="my-6 rounded-2xl border border-border bg-card p-6">
      <p className="text-muted-foreground mb-4">{t('team.ui.error')}</p>
      <button type="button" onClick={onRetry}
        className="rounded-xl bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:bg-brand-purple-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple">
        {t('team.ui.retry')}
      </button>
    </div>
  );
}
