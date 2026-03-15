"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface ServiceCoverImageProps {
  service: any;
  assignment: AssignmentData;
  onImageClick: (imageUrl: string) => void;
  onClose: () => void;
  onGalleryOpen?: (images: string[]) => void;
}

export function ServiceCoverImage({ service, assignment, onImageClick, onClose, onGalleryOpen }: ServiceCoverImageProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getAllImages = () => {
    const images: string[] = [];
    if (service.coverImage) images.push(service.coverImage);
    if (service.categoryDetails?.photos) {
      const extras = service.categoryDetails.photos.filter(
        (p: string | null) => p && p !== service.coverImage
      );
      images.push(...extras);
    }
    return images;
  };

  const allImages = getAllImages();
  if (allImages.length === 0) return null;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, allImages.length - 1));
    setCurrentIndex(clamped);
    setDragOffset(0);
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = x;
    isDragging.current = false;
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = x - dragStartX.current;
    if (Math.abs(diff) > 5) isDragging.current = true;
    if (isDragging.current) setDragOffset(diff);
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const x = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = x - dragStartX.current;

    if (isDragging.current && Math.abs(diff) > 50 && allImages.length > 1) {
      if (diff < 0 && currentIndex < allImages.length - 1) {
        goTo(currentIndex + 1);
      } else if (diff > 0 && currentIndex > 0) {
        goTo(currentIndex - 1);
      } else {
        setDragOffset(0);
      }
    } else if (!isDragging.current) {
      onGalleryOpen?.(allImages);
    } else {
      setDragOffset(0);
    }

    dragStartX.current = null;
    isDragging.current = false;
  };

  const containerWidth = containerRef.current?.offsetWidth || 0;
  const step = 100 / allImages.length;
  const dragPercent = containerWidth > 0 ? (dragOffset / containerWidth) * step : 0;
  const translateX = -(currentIndex * step) + dragPercent;

  return (
    <div className="relative animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div
        ref={containerRef}
        className="relative overflow-hidden h-[420px] rounded-2xl mx-4 md:mx-8 shadow-xl select-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={() => { if (dragStartX.current !== null) { setDragOffset(0); dragStartX.current = null; } }}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <div
          className={`flex h-full ${dragOffset === 0 ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{ transform: `translateX(${translateX}%)`, width: `${allImages.length * 100}%` }}
        >
          {allImages.map((img, index) => (
            <div key={index} className="relative h-full shrink-0" style={{ width: `${100 / allImages.length}%` }}>
              <Image
                src={img}
                alt={t('cover_image_alt', { serviceName: assignment.serviceName })}
                layout="fill"
                objectFit="cover"
                className="pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Geri Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Sayaç */}
        {allImages.length > 1 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1 text-xs text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {currentIndex + 1}/{allImages.length}
            </div>
          </div>
        )}

        {/* Resim Sayısı Badge */}
        {allImages.length > 1 && (
          <button
            className="absolute bottom-4 right-4 z-20 flex items-center gap-2 text-white bg-black/60 backdrop-blur-sm pl-3 pr-4 py-2.5 rounded-full border border-white/20 hover:bg-black/70 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onGalleryOpen?.(allImages); }}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-base font-semibold">{allImages.length}</span>
          </button>
        )}

        {/* Dot Indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); goTo(index); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white shadow-md w-5' : 'bg-white/50 w-2'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
