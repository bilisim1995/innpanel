"use client";

import { Camera, Search } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface ServiceGalleryProps {
  assignment: AssignmentData;
  service: any;
  theme: any;
  onImageClick: (imageUrl: string) => void;
}

export function ServiceGallery({ assignment, service, theme, onImageClick }: ServiceGalleryProps) {
  const { t } = useTranslation();
  const accentColor = theme.customStyle?.backgroundColor || '#dc2626';

  const getAllImages = () => {
    const images: string[] = [];

    if (service.coverImage) {
      images.push(service.coverImage);
    }

    if (service.categoryDetails?.photos) {
      const galleryImages = service.categoryDetails.photos
        .filter((photo: string | null) => photo && photo !== service.coverImage);
      images.push(...galleryImages);
    }

    return images;
  };

  const allImages = getAllImages();

  if (allImages.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        <Camera className="w-4 h-4" style={{ color: accentColor }} />
        {t('photo_gallery_title')}
        <span className="text-xs text-gray-400 font-normal">({allImages.length})</span>
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {allImages.map((photo: string, index: number) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer"
            onClick={() => onImageClick(photo)}
          >
            <Image
              src={photo}
              alt={t('activity_photo_gallery_alt', { serviceName: assignment.serviceName, index: index + 1 })}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Search className="w-3 h-3 text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
