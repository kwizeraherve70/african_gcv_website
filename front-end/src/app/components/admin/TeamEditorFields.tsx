import { useEffect, useId, useState } from 'react';
import { TEAM_LOCALES, type LocalizedText, type TeamLocale, type TeamPersonInput } from '../../types/team';

export const teamInputClass = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/25 focus:border-brand-purple transition-colors disabled:opacity-60';
export const teamButtonClass = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple-light disabled:opacity-60 disabled:cursor-not-allowed';
export const teamSecondaryButtonClass = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed';
export const teamLanguageNames: Record<TeamLocale, string> = { en: 'English', fr: 'French', rw: 'Kinyarwanda', sw: 'Swahili' };

export function TeamLocaleTabs({ locale, onChange }: { locale: TeamLocale; onChange: (locale: TeamLocale) => void }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Content language">
        {TEAM_LOCALES.map(code => (
          <button key={code} type="button" aria-pressed={locale === code} onClick={() => onChange(code)} className={`px-3 py-2 rounded-xl text-sm font-medium border ${locale === code ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/30' : 'border-border hover:bg-accent'}`}>
            {teamLanguageNames[code]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">English is the default. Empty translations display the English text. Switching language keeps your edits.</p>
    </div>
  );
}

export function TeamLocalizedField({ label, value, locale, onChange, multiline = false, requiredEnglish = false, help, maxLength }: {
  label: string;
  value: LocalizedText;
  locale: TeamLocale;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  requiredEnglish?: boolean;
  help?: string;
  maxLength?: number;
}) {
  const id = useId();
  const translationMissing = locale !== 'en' && !value[locale]?.trim();
  const props = {
    id,
    value: value[locale] ?? '',
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [locale]: event.target.value }),
    className: teamInputClass,
    required: requiredEnglish && locale === 'en',
    'aria-describedby': `${id}-help`,
  };
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">{label} <span className="font-normal text-muted-foreground">({teamLanguageNames[locale]}){requiredEnglish && locale === 'en' ? ' *' : ''}</span></label>
      {multiline ? <textarea {...props} rows={4} maxLength={maxLength ?? 8000} /> : <input {...props} type="text" maxLength={maxLength ?? 300} />}
      <p id={`${id}-help`} className="mt-1 text-xs text-muted-foreground">
        {translationMissing ? `No ${teamLanguageNames[locale]} translation. English fallback: ${value.en || 'not entered yet'}` : help ?? (requiredEnglish ? 'Required in English before publication.' : 'Optional; leave empty when not needed.')}
      </p>
    </div>
  );
}

export function TeamNotice({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <div role={error ? 'alert' : 'status'} className={`px-4 py-3 rounded-xl text-sm ${error ? 'bg-destructive/10 text-destructive' : 'bg-brand-green/10 text-foreground'}`}>{children}</div>;
}

function PhotoPreview({ src, label }: { src: string | null; label: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium mb-2">{label}</p>
      {src && !failed ? (
        <img src={src} alt={label} onError={() => setFailed(true)} className="w-24 h-24 rounded-2xl object-cover border border-border" />
      ) : (
        <div className="w-24 h-24 rounded-2xl border border-dashed border-border flex items-center justify-center p-2 text-center text-xs text-muted-foreground">{failed ? 'Image unavailable' : 'No photo'}</div>
      )}
      {failed && <p className="mt-2 text-xs text-destructive max-w-xs" role="status">This image could not be displayed. Check that the URL opens a public image.</p>}
    </div>
  );
}

export function TeamPhotoField({ currentUrl, action, url, file, onActionChange, onUrlChange, onFileChange }: {
  currentUrl: string | null;
  action: TeamPersonInput['photo']['action'];
  url: string;
  file: File | null;
  onActionChange: (action: TeamPersonInput['photo']['action']) => void;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
}) {
  const id = useId();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setFilePreview(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const changeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    if (next && (!['image/jpeg', 'image/png', 'image/webp'].includes(next.type) || next.size > 5 * 1024 * 1024)) {
      setFileError('Choose a JPEG, PNG, or WebP image no larger than 5 MB.');
      onFileChange(null);
      event.target.value = '';
      return;
    }
    setFileError(null);
    onFileChange(next);
  };
  let safePreviewUrl: string | null = null;
  try { const parsed = new URL(url); if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) safePreviewUrl = parsed.href; } catch { /* Preview only valid HTTPS links. */ }
  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-semibold mb-3">Photo</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        {([{ value: 'KEEP', label: currentUrl ? 'Keep current photo' : 'No photo yet' }, { value: 'UPLOAD', label: 'Upload photo' }, { value: 'URL', label: 'Photo URL' }] as const).map(option => (
          <label key={option.value} className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name={`${id}-source`} checked={action === option.value} onChange={() => { setFileError(null); onActionChange(option.value); }} className="accent-brand-purple" />
            {option.label}
          </label>
        ))}
      </div>
      {action === 'UPLOAD' && <div>
        <label htmlFor={`${id}-file`} className="block text-sm font-medium mb-1.5">Choose a photo</label>
        <input id={`${id}-file`} type="file" accept="image/jpeg,image/png,image/webp" onChange={changeFile} className="block w-full max-w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-purple/10 file:text-brand-purple file:font-medium" />
        <p className="mt-2 text-xs text-muted-foreground">JPEG, PNG, or WebP, up to 5 MB. Uploaded to Cloudinary when you save.</p>
        {file && <p className="mt-1 text-xs text-muted-foreground break-all">Selected: {file.name}</p>}
      </div>}
      {action === 'URL' && <div>
        <label htmlFor={`${id}-url`} className="block text-sm font-medium mb-1.5">Public image URL</label>
        <input id={`${id}-url`} type="url" required maxLength={2048} value={url} onChange={event => onUrlChange(event.target.value)} placeholder="https://…" className={teamInputClass} />
        <p className="mt-1 text-xs text-muted-foreground">Use a public HTTPS link to the image itself. This image stays at its current host.</p>
      </div>}
      {fileError && <TeamNotice error>{fileError}</TeamNotice>}
      <div className="flex gap-6 flex-wrap">
        <PhotoPreview src={currentUrl} label="Current photo" />
        {action !== 'KEEP' && <PhotoPreview src={action === 'UPLOAD' ? filePreview : safePreviewUrl} label="Replacement preview" />}
      </div>
      <p className="text-xs text-muted-foreground">The current photo remains until a replacement is saved successfully.</p>
    </fieldset>
  );
}
