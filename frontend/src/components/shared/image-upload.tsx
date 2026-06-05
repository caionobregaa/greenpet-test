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

const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.85;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas não suportado")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error("Imagem inválida"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido. Use JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    setIsProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
      toast.success("Imagem carregada!");
    } catch {
      toast.error("Erro ao processar imagem. Tente novamente.");
    } finally {
      setIsProcessing(false);
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
          disabled={isProcessing}
          className={cn(
            "w-full max-w-[200px] aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent/30 transition-colors cursor-pointer",
            isProcessing && "opacity-60 cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs">Processando...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8" />
              <div className="text-center px-2">
                <p className="text-xs font-medium">Clique ou arraste</p>
                <p className="text-[10px] text-muted-foreground/70">JPG, PNG, WebP · máx. 10MB</p>
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
