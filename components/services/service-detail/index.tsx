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

export function ServiceDetailModal({ isOpen, onClose, assignment, locale }: ServiceDetailModalProps) {
  const { t } = useTranslation();
  
  const {
    isReservationModalOpen,
    setIsReservationModalOpen,
    selectedImage,
    isImageModalOpen,
    setIsImageModalOpen,
    handleImageClick
  } = useServiceModal();

  const [theme, setTheme] = useState<any>(null);
  const [showHeaderBack, setShowHeaderBack] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setShowHeaderBack(scrollRef.current.scrollTop > 340);
    }
  }, []);

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
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50 animate-in fade-in-0 zoom-in-95 duration-500">
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
              onImageClick={handleImageClick}
              onClose={onClose}
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

              <ServiceGallery 
                assignment={assignment}
                service={service}
                theme={currentTheme}
                onImageClick={handleImageClick}
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

        {isImageModalOpen && selectedImage && (
          <Dialog open={isImageModalOpen} onOpenChange={() => setIsImageModalOpen(false)}>
            <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-black/95 border-0">
              <DialogTitle>
                <VisuallyHidden.Root>{t('image_viewer_title')}</VisuallyHidden.Root>
              </DialogTitle>
              
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 w-10 h-10 rounded-lg flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="w-full h-full flex items-center justify-center p-8">
                <Image
                  src={selectedImage}
                  alt={t('activity_photo_alt')}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </DialogContent>
          </Dialog>
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
