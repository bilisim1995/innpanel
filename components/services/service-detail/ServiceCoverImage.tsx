"use client";

import { Sparkles, Eye, Banknote } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import Image from 'next/image';

interface ServiceCoverImageProps {
  service: any;
  assignment: AssignmentData;
  onImageClick: (imageUrl: string) => void;
}

export function ServiceCoverImage({ service, assignment, onImageClick }: ServiceCoverImageProps) {
  if (!service.coverImage) return null;

  return (
    <div className="relative animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="relative overflow-hidden group h-80">
        <Image 
          src={service.coverImage} 
          alt={assignment.serviceName}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-700 group-hover:scale-110 cursor-pointer"
          onClick={() => onImageClick(service.coverImage)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {assignment.pricingSettings?.displayPrice && assignment.pricingSettings.displayPrice > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1 text-white bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 shadow-lg">
              <Banknote className="w-4 h-4" />
              <span className="font-medium text-base">{assignment.pricingSettings.displayPrice} ₺</span>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 text-white bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30 shadow-lg">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="font-medium text-sm">Premium Aktivite Deneyimi</span>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-xl border border-white/50">
            <Eye className="w-8 h-8 text-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
