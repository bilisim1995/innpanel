"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Banknote } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import { ServiceData } from "@/lib/services";
import { getCategoryIcon, getCategoryColorsSync } from "./utils/categoryUtils";
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

interface ServiceCardProps {
  assignment: EnhancedAssignmentData;
  categoryColors: {[key: string]: any};
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
  const CategoryIcon = getCategoryIcon(assignment.serviceCategory);
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
      className="group overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500 bg-white animate-in slide-in-from-bottom-4 duration-700 shadow-lg border-2"
      style={{ borderColor: backgroundColor }}
    >
      <CardContent className="p-0">
        <div 
          className="p-4 relative overflow-hidden"
          style={{ backgroundColor }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg border border-white/30">
              <CategoryIcon className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0 text-center">
              <h3 className="font-bold text-xl text-white leading-tight mb-1 drop-shadow-lg tracking-wide" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                {assignment.serviceName}
              </h3>
            </div>
          </div>
        </div>

        {allImages.length > 0 && (
          <div className="relative group/image">
            {assignment.pricingSettings?.displayPrice && assignment.pricingSettings.displayPrice > 0 && (
              <div className="absolute top-3 right-3 z-10">
                <div className="flex items-center gap-1 text-xs text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30 shadow-lg">
                  <Banknote className="w-3 h-3" />
                  <span>{assignment.pricingSettings.displayPrice} ₺</span>
                </div>
              </div>
            )}
            
            {allImages.length > 1 && (
              <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center gap-1 text-xs text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30 shadow-lg">
                  <span>{currentIndex + 1}/{allImages.length}</span>
                </div>
              </div>
            )}
            
            <div className="relative w-full h-48 overflow-hidden bg-gray-100">
              <Image 
                src={currentImage}
                alt={assignment.serviceName}
                layout="fill"
                objectFit="cover"
                className={`transition-transform duration-300 group-hover:scale-105 ${isDragging[assignment.id!] ? 'cursor-grabbing' : 'cursor-pointer'}`}
                onClick={() => onImageClick(currentImage)}
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 group-hover/image:opacity-100 transition-all duration-300 hover:bg-red-700 hover:scale-110 z-30 shadow-xl border border-white"
                >
                  <ChevronLeft className="w-5 h-5 drop-shadow-lg font-bold" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNextImage(assignment.id!, allImages.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 group-hover/image:opacity-100 transition-all duration-300 hover:bg-red-700 hover:scale-110 z-30 shadow-xl border border-white"
                >
                  <ChevronRight className="w-5 h-5 drop-shadow-lg font-bold" />
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

        <div className="p-4 pt-6 space-y-3">
          <Button 
            onClick={() => onServiceSelect(assignment)}
            className="w-full hover:opacity-90 text-white font-bold py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-0 text-lg tracking-wide"
            style={{ backgroundColor }}
          >
            {t('activity_details_button')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}