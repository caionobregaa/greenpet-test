"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro no upload");
      onChange(json.url ?? null);
      toast.success("Imagem carregada com sucesso!");
    } catch (err: unknown) {
      toast.error("Erro ao carregar imagem", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border border-border group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Imagem do produto"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          disabled={isUploading}
          className={cn(
            "w-full max-w-[200px] aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent/30 transition-colors cursor-pointer",
            isUploading && "opacity-60 cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs">Enviando...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8" />
              <div className="text-center px-2">
                <p className="text-xs font-medium">Clique ou arraste</p>
                <p className="text-[10px] text-muted-foreground/70">JPG, PNG, WebP · máx. 5MB</p>
              </div>
              <Upload className="w-4 h-4" />
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
