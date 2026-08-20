import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  aspectRatio?: 'square' | 'video' | 'banner';
  placeholder?: string;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'video',
  placeholder = 'https://...',
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>(value && !value.startsWith('data:') ? value : '');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Resize and compress uploaded image to prevent localStorage overflow
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let maxDim = aspectRatio === 'banner' ? 1280 : 640;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onChange(compressedDataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[140px]'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9] max-w-[320px]'
      : 'aspect-video max-w-[200px]';

  return (
    <div className="space-y-1.5 p-3 rounded-2xl bg-surface-dark border border-white/10">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase text-gray-300 tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 bg-surface-card p-0.5 rounded-lg border border-white/10 text-[9px] font-bold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded transition-all flex items-center space-x-1 ${
              mode === 'upload' ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-2.5 h-2.5" />
            <span>Fichier PC</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded transition-all flex items-center space-x-1 ${
              mode === 'url' ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-2.5 h-2.5" />
            <span>Lien Web</span>
          </button>
        </div>
      </div>

      {/* Main Preview & Upload Body */}
      <div className="flex items-center space-x-3">
        {/* Live Preview Container */}
        {value ? (
          <div className={`relative rounded-xl overflow-hidden border-2 border-brand-gold/60 shadow-lg group flex-shrink-0 ${aspectClass}`}>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1 right-1 p-1 rounded-md bg-rose-950/80 text-rose-300 hover:bg-rose-600 hover:text-white transition-all shadow"
              title="Supprimer l'image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className={`rounded-xl border-2 border-dashed border-white/15 bg-surface-card flex flex-col items-center justify-center text-gray-500 flex-shrink-0 ${aspectClass}`}>
            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-[9px] font-bold">Aucune image</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex-1 space-y-2">
          {mode === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                isDragging
                  ? 'border-brand-accent bg-brand-accent/20 scale-102'
                  : 'border-white/20 hover:border-brand-gold/60 bg-surface-card/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-4 h-4 text-brand-gold" />
              <span className="text-[10px] font-black text-white uppercase">
                {value ? 'Changer l’image depuis le PC' : 'Sélectionner une image PC'}
              </span>
              <span className="text-[9px] text-gray-400">
                Glissez-déposez ou cliquez (PNG, JPG, WebP)
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  onChange(e.target.value);
                }}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-white text-xs font-mono outline-none focus:border-brand-gold"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="px-3 py-2 rounded-xl bg-surface-light hover:bg-white hover:text-gray-950 text-xs font-bold transition-all flex items-center space-x-1 flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>OK</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
