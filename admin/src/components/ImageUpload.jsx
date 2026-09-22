import { useEffect, useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

export default function ImageUpload({ existingUrl, value, onChange, disabled = false }) {
  const { file = null, remove = false } = value || {};
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file]);

  const shownUrl = file ? previewUrl : !remove && existingUrl ? existingUrl : null;

  function handleFiles(files) {
    if (disabled || !files || files.length === 0) return;
    onChange({ file: files[0], remove: false });
  }

  function handleRemove() {
    if (disabled) return;
    onChange({ file: null, remove: true });
  }

  return (
    <div className="image-upload">
      <div
        className={`image-upload-drop${dragOver ? ' drag-over' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {shownUrl ? (
          <img src={shownUrl} alt="Vista previa" className="image-upload-preview" />
        ) : (
          <div className="image-upload-empty">
            <UploadCloud size={28} />
            <span>Arrastra una imagen o haz clic para seleccionar</span>
            <span className="image-upload-hint">JPG, PNG o WebP · máx. 5 MB</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="image-upload-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {shownUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </button>
        {shownUrl && (
          <button type="button" className="icon-btn icon-btn-danger" onClick={handleRemove} disabled={disabled}>
            <X size={16} /> Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
