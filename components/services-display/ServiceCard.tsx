"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Banknote } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import { ServiceData } from "@/lib/services";
import { getCategoryColorsSync } from "./utils/categoryUtils";
import { getCategoryIcon as getDynamicCategoryIcon } from "@/lib/category-icons";
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

interface ServiceCardProps {
  assignment: EnhancedAssignmentData;
  categoryColors: {[key: string]: any};
  categoryMetaMap: {[key: string]: { label: string; iconKey: string }};
  currentImageIndex: {[key: string]: number};
  isDragging: {[key: string]: boolean};
  onImageClick: (imageUrl: string) => void;
  onServiceSelect: (assignment: EnhancedAssignmentData) => void;
  onPrevImage: (assignmentId: string, totalImages: number) => void;
  onNextImage: (assignmentId: string, totalImages: number) => void;
  onDragStart: (assignmentId: string, e: React.MouseEvent | React.TouchEvent) => void;
  onDragEnd: (assignmentId: string, totalImages: number, e: React.MouseEvent | React.TouchEvent) => void;
  onDragMove: (assignmentId: string, e: React.MouseEvent | React.TouchEvent) => void;
}

export function ServiceCard({
  assignment,
  categoryColors,
  categoryMetaMap,
  currentImageIndex,
  isDragging,
  onImageClick,
  onServiceSelect,
  onPrevImage,
  onNextImage,
  onDragStart,
  onDragEnd,
  onDragMove
}: ServiceCardProps) {
  const { t } = useTranslation();
  const CategoryIcon = getDynamicCategoryIcon(
    categoryMetaMap[assignment.serviceCategory]?.iconKey || "more-horizontal"
  );
  const colors = categoryColors[assignment.serviceCategory] || getCategoryColorsSync(assignment.serviceCategory);
  
  const backgroundColor = colors.customStyle?.background || colors.customStyle?.backgroundColor || '#dc2626';
  
  const getAllImages = () => {
    const images: string[] = [];
    
    if (assignment.serviceDetails?.coverImage) {
      images.push(assignment.serviceDetails.coverImage);
    }
    
    if (assignment.serviceDetails?.categoryDetails?.photos) {
      const galleryImages = assignment.serviceDetails.categoryDetails.photos
        .filter((photo: string | null) => photo && photo !== assignment.serviceDetails?.coverImage);
      images.push(...galleryImages);
    }
    
    return images;
  };

  const allImages = getAllImages();
  const currentIndex = currentImageIndex[assignment.id!] || 0;
  const currentImage = allImages[currentIndex];

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white animate-in slide-in-from-bottom-4 duration-700 shadow-lg border border-gray-100 rounded-2xl"
    >
      <CardContent className="p-0">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${backgroundColor}15` }}
            >
              <CategoryIcon className="w-4 h-4" style={{ color: backgroundColor }} />
            </div>
            <h3 className="font-semibold text-sm text-gray-900 leading-snug">
              {assignment.serviceName}
            </h3>
          </div>
        </div>

        {allImages.length > 0 && (
          <div className="relative group/image px-3 pt-3">
            {assignment.pricingSettings?.displayPrice && assignment.pricingSettings.displayPrice > 0 && (
              <div className="absolute top-5 right-5 z-10">
                <div className="flex items-center gap-1 text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Banknote className="w-3 h-3" />
                  <span>{assignment.pricingSettings.displayPrice} {assignment.pricingSettings.displayPriceCurrency}</span>
                </div>
              </div>
            )}
            
            {allImages.length > 1 && (
              <div className="absolute top-5 left-5 z-10">
                <div className="flex items-center gap-1 text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span>{currentIndex + 1}/{allImages.length}</span>
                </div>
              </div>
            )}
            
            <div className="relative w-full h-48 overflow-hidden bg-gray-100 rounded-xl">
              <Image 
                src={currentImage}
                alt={assignment.serviceName}
                layout="fill"
                objectFit="cover"
                className={`transition-transform duration-300 group-hover:scale-105 ${isDragging[assignment.id!] ? 'cursor-grabbing' : 'cursor-pointer'}`}
                onClick={() => onServiceSelect(assignment)}
                onMouseDown={(e) => onDragStart(assignment.id!, e)}
                onMouseUp={(e) => onDragEnd(assignment.id!, allImages.length, e)}
                onMouseMove={(e) => onDragMove(assignment.id!, e)}
                onTouchStart={(e) => onDragStart(assignment.id!, e)}
                onTouchEnd={(e) => onDragEnd(assignment.id!, allImages.length, e)}
                onTouchMove={(e) => onDragMove(assignment.id!, e)}
                draggable={false}
              />
            </div>
            
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevImage(assignment.id!, allImages.length);
                  }}
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 hover:bg-white z-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextImage(assignment.id!, allImages.length);
                  }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 hover:bg-white z-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-3 pb-3 pt-2">
          <Button 
            onClick={() => onServiceSelect(assignment)}
            variant="outline"
            className="w-full font-medium py-4 rounded-xl transition-all duration-200 text-sm border-0 hover:opacity-80"
            style={{ backgroundColor: `${backgroundColor}15`, color: backgroundColor }}
          >
            {t('activity_details_button')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
