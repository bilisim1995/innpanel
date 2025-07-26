"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleClose = () => {
    setZoom(1);
    onClose();
  };

  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black/95 border-0">
        <DialogTitle>
          <VisuallyHidden.Root>Görsel Detayları</VisuallyHidden.Root>
        </DialogTitle>
        
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md border border-white/30">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetZoom}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleClose}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Kapat</span>
            </Button>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center p-8 pt-20">
          <div 
            className="relative w-full h-full"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
          >
            <Image
              src={imageUrl}
              alt="Hizmet Fotoğrafı"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      </DialogContent>
    </Dialog>
  );
}
