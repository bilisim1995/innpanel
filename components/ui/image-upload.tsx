"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bunnyStorage } from "@/lib/bunny-storage";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  folder?: "hizmetler" | "hizmetnoktalari" | "profile" | "arac";
  aspectRatio?: "square" | "video" | "auto";
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'hizmetler',
  aspectRatio = "auto",
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir resim dosyası seçin",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 5MB'dan küçük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Delete old image if exists
      if (value) {
        await bunnyStorage.deleteFile(value);
      }

      // Upload new image
      const result = await bunnyStorage.uploadFile(file, folder);
      
      if (result.success && result.url) {
        onChange(result.url);
        toast({
          title: "Başarılı",
          description: "Resim başarıyla yüklendi",
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      await bunnyStorage.deleteFile(value);
      onChange(null);
      toast({
        title: "Başarılı",
        description: "Resim başarıyla silindi",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Hata",
        description: "Resim silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  }[aspectRatio];

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div
        className={cn(
          "relative border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden",
          aspectRatioClass,
          !value && "min-h-[200px]",
          "hover:border-muted-foreground/50 transition-colors"
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute top-2 right-2 space-x-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRemove}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Resim yüklemek için tıklayın
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG (max 5MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {!value && !disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Resim Seç
            </>
          )}
        </Button>
      )}
    </div>
  );
}