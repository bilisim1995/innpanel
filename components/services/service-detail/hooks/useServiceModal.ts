import { useState } from "react";

export function useServiceModal() {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isGeneralNotesOpen, setIsGeneralNotesOpen] = useState(false);
  const [isTourDetailsOpen, setIsTourDetailsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  return {
    isReservationModalOpen,
    setIsReservationModalOpen,
    selectedImage,
    isImageModalOpen,
    setIsImageModalOpen,
    isGeneralNotesOpen,
    setIsGeneralNotesOpen,
    isTourDetailsOpen,
    setIsTourDetailsOpen,
    isGalleryOpen,
    setIsGalleryOpen,
    isContactOpen,
    setIsContactOpen,
    handleImageClick
  };
}