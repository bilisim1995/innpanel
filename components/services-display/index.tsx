"use client";

import { useState, useEffect } from "react";
import { LocationData, getLocationBySlug } from "@/lib/locations";
import { ServiceData, getServices } from "@/lib/services";
import { AssignmentData, getAssignmentsByLocation } from "@/lib/assignments";
import { ImageModal } from "@/components/services/image-modal";
import { ServiceDetailModal } from "@/components/services/service-detail";
import { PageHeader } from "./PageHeader";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { CategoryGrid } from "./CategoryGrid";
import { ActivityGrid } from "./ActivityGrid";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { useServicesData } from "./hooks/useServicesData";
import { useImageSlider } from "./hooks/useImageSlider";
import { useRouter } from "next/navigation";

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

interface ServicesDisplayProps {
  locationSlug: string;
}

export function ServicesDisplay({ locationSlug }: ServicesDisplayProps) {
  const router = useRouter();
  
  // Remove qr_scan parameter from URL after page loads
  useEffect(() => {
    // Check if we're in the browser and if the URL has the qr_scan parameter
    if (typeof window !== 'undefined' && window.location.href.includes('qr_scan=true')) {
      // Create a new URL without the qr_scan parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('qr_scan');
      
      // Replace the current URL without reloading the page
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);
  
  const {
    location,
    assignments,
    filteredAssignments,
    selectedCategory,
    loading,
    error,
    categoryColors,
    handleCategorySelect,
    handleClearFilter
  } = useServicesData(locationSlug);

  const {
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
  } = useImageSlider();

  if (loading) {
    return <LoadingState />;
  }

  if (error || !location) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        location={location} 
        showBackButton={!!selectedCategory}
        onBackClick={handleClearFilter}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {selectedCategory ? (
              <div className="space-y-6">
                <ActivityGrid
                  assignments={filteredAssignments}
                  onClearFilter={handleClearFilter}
                  categoryColors={categoryColors}
                  currentImageIndex={currentImageIndex}
                  isDragging={isDragging}
                  onImageClick={handleImageClick}
                  onServiceSelect={handleServiceSelect}
                  onPrevImage={handlePrevImage}
                  onNextImage={handleNextImage}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragMove={handleDragMove}
                />
              </div>
            ) : (
              <CategoryGrid
                assignments={assignments}
                onCategorySelect={handleCategorySelect}
                onServiceSelect={handleServiceSelect}
                categoryColors={categoryColors}
              />
            )}
          </div>
        )}
      </div>

      <Footer />
      
      {/* Bottom padding to prevent content being hidden behind fixed footer */}
      <div className="h-16"></div>
      
      <WhatsAppButton />

      {/* Modals */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage}
        onServiceSelect={() => {
          setIsImageModalOpen(false);
          if (selectedService) {
            setIsServiceModalOpen(true);
          }
        }}
      />

      <ServiceDetailModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        assignment={selectedService}
      />
    </div>
  );
}