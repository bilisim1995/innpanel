
"use client";

import { useState, useEffect } from "react";
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

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: any;
}

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: EnhancedAssignmentData | null;
}

export function ServiceDetailModal({ isOpen, onClose, assignment }: ServiceDetailModalProps) {
  const {
    isReservationModalOpen,
    setIsReservationModalOpen,
    selectedImage,
    isImageModalOpen,
    setIsImageModalOpen,
    isGeneralNotesOpen,
    setIsGeneralNotesOpen,
    isTourDetailsOpen,
    setIsTourDetailsOpen,
    isTourInformationOpen,
    setIsTourInformationOpen,
    isGalleryOpen,
    setIsGalleryOpen,
    isContactOpen,
    setIsContactOpen,
    handleImageClick
  } = useServiceModal();

  const [theme, setTheme] = useState<any>(null);

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
          <VisuallyHidden.Root>Hizmet Detayları</VisuallyHidden.Root>
        </DialogTitle>
        
        <ServiceDetailHeader 
          assignment={assignment}
          onClose={onClose}
        />
        
        <div className="flex-1 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="space-y-8 pb-32">
            <ServiceCoverImage 
              service={service}
              assignment={assignment}
              onImageClick={handleImageClick}
            />

            <div className="px-8 space-y-8">
              <ServiceTourDetails 
                assignment={assignment}
                service={service}
                theme={currentTheme}
                isOpen={isTourDetailsOpen}
                onToggle={setIsTourDetailsOpen}
              />

              <ServiceTourInformation
                assignment={assignment}
                service={service}
                theme={currentTheme}
                isOpen={isTourInformationOpen}
                onToggle={setIsTourInformationOpen}
              />
              
              <ServiceGeneralNotes 
                service={service}
                theme={currentTheme}
                isOpen={isGeneralNotesOpen}
                onToggle={setIsGeneralNotesOpen}
              />

              <ServiceGallery 
                assignment={assignment}
                service={service}
                theme={currentTheme}
                isOpen={isGalleryOpen}
                onToggle={setIsGalleryOpen}
                onImageClick={handleImageClick}
              />

              <ServiceContact 
                service={service}
                theme={currentTheme}
                isOpen={isContactOpen}
                onToggle={setIsContactOpen}
              />
            </div>
          </div>
        </div>

        <ServiceActionButtons 
          service={service}
          theme={currentTheme}
          onReservationClick={() => setIsReservationModalOpen(true)}
        />

        {isImageModalOpen && selectedImage && (
          <Dialog open={isImageModalOpen} onOpenChange={() => setIsImageModalOpen(false)}>
            <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 bg-black/95 border-0">
              <DialogTitle>
                <VisuallyHidden.Root>Fotoğraf Görüntüleyici</VisuallyHidden.Root>
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
                  alt="Aktivite Fotoğrafı"
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
        />
      </DialogContent>
    </Dialog>
  );
}
