import { useEffect, useState } from 'react';

/**
 * Real file picker with a live preview, wired to the backend's Cloudinary
 * upload middleware (see api/client.ts's toFormData and
 * backend/src/utils/cloudinary.ts) — replaces the old raw-URL text field
 * that never actually uploaded anything.
 */
export function ImageUploadField({
  label,
  existingUrl,
  onFileChange,
}: {
  label: string;
  existingUrl?: string;
  onFileChange: (file: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    onFileChange(file);
  };

  const displayUrl = previewUrl ?? existingUrl;

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt=""
            className="w-20 h-20 rounded-xl object-cover border border-border flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl border border-dashed border-border flex-shrink-0" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-purple/10 file:text-brand-purple file:text-sm file:font-medium hover:file:bg-brand-purple/20 file:cursor-pointer cursor-pointer"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">
        {existingUrl && !previewUrl
          ? 'Current image shown — choose a file to replace it.'
          : 'Uploaded to Cloudinary when you save.'}
      </p>
    </div>
  );
}
