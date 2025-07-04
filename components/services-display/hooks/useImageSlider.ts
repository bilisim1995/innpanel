import { useState } from "react";
import { AssignmentData } from "@/lib/assignments";
import { ServiceData } from "@/lib/services";

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

export function useImageSlider() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<EnhancedAssignmentData | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [isDragging, setIsDragging] = useState<{[key: string]: boolean}>({});
  const [dragStart, setDragStart] = useState<{[key: string]: number}>({});

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleServiceSelect = (assignment: EnhancedAssignmentData) => {
    setSelectedService(assignment);
    setIsServiceModalOpen(true);
  };

  const handlePrevImage = (assignmentId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [assignmentId]: prev[assignmentId] > 0 ? prev[assignmentId] - 1 : totalImages - 1
    }));
  };

  const handleNextImage = (assignmentId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [assignmentId]: (prev[assignmentId] || 0) < totalImages - 1 ? (prev[assignmentId] || 0) + 1 : 0
    }));
  };

  const handleDragStart = (assignmentId: string, e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setIsDragging(prev => ({ ...prev, [assignmentId]: true }));
    setDragStart(prev => ({ ...prev, [assignmentId]: clientX }));
  };

  const handleDragEnd = (assignmentId: string, totalImages: number, e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const dragDistance = dragStart[assignmentId] - clientX;
    const threshold = 50; // Minimum drag distance to trigger slide

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        // Dragged left, go to next image
        handleNextImage(assignmentId, totalImages);
      } else {
        // Dragged right, go to previous image
        handlePrevImage(assignmentId, totalImages);
      }
    }

    setIsDragging(prev => ({ ...prev, [assignmentId]: false }));
    setDragStart(prev => ({ ...prev, [assignmentId]: 0 }));
  };

  const handleDragMove = (assignmentId: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging[assignmentId]) return;
    e.preventDefault(); // Prevent default scrolling behavior
  };

  return {
    selectedImage,
    selectedService,
    isImageModalOpen,
    isServiceModalOpen,
    currentImageIndex,
    isDragging,
    dragStart,
    handleImageClick,
    handleServiceSelect,
    setIsImageModalOpen,
    setIsServiceModalOpen,
    handlePrevImage,
    handleNextImage,
    handleDragStart,
    handleDragEnd,
    handleDragMove
  };
}