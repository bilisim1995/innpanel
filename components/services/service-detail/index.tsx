"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AssignmentData } from "@/lib/assignments";
import { ReservationModal } from "../reservation";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ServiceDetailHeader } from "./ServiceDetailHeader";
import { ServiceCoverImage } from "./ServiceCoverImage";
import { ServiceGeneralNotes } from "./ServiceGeneralNotes";
import { ServiceTourDetails } from "./ServiceTourDetails";
import ServiceTourInformation from "./ServiceTourInformation";
import { ServiceGallery } from "./ServiceGallery";
import { ServiceContact } from "./ServiceContact";
import { ServiceActionButtons } from "./ServiceActionButtons";
import { getDisplayCategoryColors } from "../../services-display/utils/categoryUtils";
import { useServiceModal } from "./hooks/useServiceModal";
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ServiceData } from "@/lib/services"; 
import { ServiceVehicleFeatures } from "./ServiceVehicleFeatures"; 
import { WhatsAppButton } from "@/components/services-display/WhatsAppButton";

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData; 
}

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: EnhancedAssignmentData | null;
  locale: string; 
}

function FullImageSlider({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)));
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

  const handlePointerUp = () => {
    if (dragStartX.current === null) return;

    if (isDragging.current && Math.abs(dragOffset) > 50) {
      if (dragOffset < 0 && currentIndex < images.length - 1) goTo(currentIndex + 1);
      else if (dragOffset > 0 && currentIndex > 0) goTo(currentIndex - 1);
      else setDragOffset(0);
    } else {
      setDragOffset(0);
    }

    dragStartX.current = null;
    isDragging.current = false;
  };

  const containerWidth = containerRef.current?.offsetWidth || 0;
  const step = 100 / images.length;
  const dragPercent = containerWidth > 0 ? (dragOffset / containerWidth) * step : 0;
  const translateX = -(currentIndex * step) + dragPercent;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-black/95 border-0 [&>h2]:hidden">
        <DialogTitle>
          <VisuallyHidden.Root>{t('image_viewer_title')}</VisuallyHidden.Root>
        </DialogTitle>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/25 transition-colors"
        >
          ✕
        </button>

        {images.length > 1 && (
          <div className="absolute top-4 left-4 z-20 text-white/80 text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full select-none"
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
            style={{ transform: `translateX(${translateX}%)`, width: `${images.length * 100}%` }}
          >
            {images.map((img, index) => (
              <div key={index} className="relative h-full shrink-0 p-6 md:p-12" style={{ width: `${100 / images.length}%` }}>
                <Image
                  src={img}
                  alt={t('activity_photo_alt')}
                  layout="fill"
                  objectFit="contain"
                  className="pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white w-5' : 'bg-white/40 w-2'
                }`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GalleryGridModal({
  images,
  onClose,
  onImageSelect,
}: {
  images: string[];
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}) {
  const { t } = useTranslation();

  const leftCol = images.filter((_, i) => i % 2 === 0);
  const rightCol = images.filter((_, i) => i % 2 === 1);

  const renderImage = (img: string, originalIndex: number, tall: boolean) => (
    <div
      key={originalIndex}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}
      onClick={() => onImageSelect(img)}
    >
      <Image
        src={img}
        alt={t('activity_photo_alt')}
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none  py-12 border-0 overflow-hidden bg-white [&>h2]:hidden">
        <DialogTitle>
          <VisuallyHidden.Root>{t('image_viewer_title')}</VisuallyHidden.Root>
        </DialogTitle>

        <button
          onClick={onClose}
          className="absolute top-1.5 left-2 z-20 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm text-xs"
        >
          ✕
        </button>

        <div className="overflow-y-auto px-2 pt-0 pb-3 h-full">
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-2">
              {leftCol.map((img, i) => renderImage(img, i * 2, i % 3 === 0))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {rightCol.map((img, i) => renderImage(img, i * 2 + 1, i % 3 === 1))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceDetailModal({ isOpen, onClose, assignment, locale }: ServiceDetailModalProps) {
  const { t } = useTranslation();
  
  const {
    isReservationModalOpen,
    setIsReservationModalOpen,
    handleImageClick
  } = useServiceModal();

  const [theme, setTheme] = useState<any>(null);
  const [showHeaderBack, setShowHeaderBack] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [fullImageIndex, setFullImageIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setShowHeaderBack(scrollRef.current.scrollTop > 340);
    }
  }, []);

  const handleGalleryOpen = useCallback((images: string[]) => {
    setGalleryImages(images);
    setIsGalleryOpen(true);
  }, []);

  const getAllServiceImages = useCallback(() => {
    if (!assignment?.serviceDetails) return [];
    const s = assignment.serviceDetails;
    const imgs: string[] = [];
    if (s.coverImage) imgs.push(s.coverImage);
    if (s.categoryDetails?.photos) {
      const extras = s.categoryDetails.photos.filter(
        (p: string | null) => p && p !== s.coverImage
      );
      imgs.push(...extras);
    }
    return imgs;
  }, [assignment]);

  const handleSingleImageClick = useCallback((_?: string) => {
    const imgs = getAllServiceImages();
    if (imgs.length > 0) {
      setGalleryImages(imgs);
      setIsGalleryOpen(true);
    }
  }, [getAllServiceImages]);

  useEffect(() => {
    const loadTheme = async () => {
      if (assignment?.serviceCategory) {
        const categoryColors = await getDisplayCategoryColors(assignment.serviceCategory);
        setTheme(categoryColors);
      }
    };
    
    if (isOpen && assignment) {
      loadTheme();
    }
  }, [isOpen, assignment]);

  if (!assignment || !assignment.serviceDetails) return null;

  const service = assignment.serviceDetails;
  
  const currentTheme = theme || {
    customStyle: { backgroundColor: '#dc2626' },
    decorativeIcons: []
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50 animate-in fade-in-0 zoom-in-95 duration-500 [&>button.absolute]:hidden">
        <DialogTitle>
          <VisuallyHidden.Root>{t('service_details_title')}</VisuallyHidden.Root>
        </DialogTitle>
        
        <ServiceDetailHeader 
          assignment={assignment}
          showBackButton={showHeaderBack}
          onClose={onClose}
        />
        
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="space-y-6 pb-32">
            <ServiceCoverImage 
              service={service}
              assignment={assignment}
              onImageClick={handleSingleImageClick}
              onClose={onClose}
              onGalleryOpen={handleGalleryOpen}
            />

            <div className="px-6 md:px-8 space-y-6">
              {assignment.serviceCategory === "transfer" && (
                <ServiceVehicleFeatures 
                  service={service}
                  theme={currentTheme}
                />
              )}

              <ServiceTourDetails 
                assignment={assignment}
                service={service}
                theme={currentTheme}
              />

              <ServiceTourInformation
                assignment={assignment}
                service={service}
                theme={currentTheme}
              />
              
              <ServiceGeneralNotes 
                service={service}
                theme={currentTheme}
              />

              <ServiceContact 
                service={service}
                theme={currentTheme}
              />
            </div>
          </div>
        </div>

        <ServiceActionButtons 
          service={service}
          theme={currentTheme}
          onReservationClick={() => setIsReservationModalOpen(true)}
        />
        <WhatsAppButton className="bottom-24 right-4 z-[60]" compactLabel="Info" />

        {isGalleryOpen && galleryImages.length > 0 && (
          <GalleryGridModal
            images={galleryImages}
            onClose={() => setIsGalleryOpen(false)}
            onImageSelect={(url) => { const idx = galleryImages.indexOf(url); setFullImageIndex(idx >= 0 ? idx : 0); }}
          />
        )}

        {fullImageIndex !== null && galleryImages.length > 0 && (
          <FullImageSlider
            images={galleryImages}
            startIndex={fullImageIndex}
            onClose={() => setFullImageIndex(null)}
          />
        )}

        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          assignment={assignment}
          locale={locale} 
        />
      </DialogContent>
    </Dialog>
  );
}
