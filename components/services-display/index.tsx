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
  locale: string; 
}

export function ServicesDisplay({ locationSlug, locale }: ServicesDisplayProps) {
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.href.includes('qr_scan=true')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('qr_scan');
      
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
    categoryMetaMap,
    handleCategorySelect,
    handleClearFilter
  } = useServicesData(locationSlug, locale); 

  const {
    selectedImage,
    selectedService,
    isImageModalOpen,
    isServiceModalOpen,
    currentImageIndex,
    isDragging,
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
                  categoryMetaMap={categoryMetaMap}
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
                categoryMetaMap={categoryMetaMap}
              />
            )}
          </div>
        )}
      </div>

      <Footer />

      {!isServiceModalOpen && (
        <WhatsAppButton className="bottom-0 left-0 right-0 z-[60] md:bottom-6 md:right-6 md:left-auto" fullWidth />
      )}

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage}
      />

      <ServiceDetailModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        assignment={selectedService}
        locale={locale} // locale prop'u eklendi
      />
    </div>
  );
}
