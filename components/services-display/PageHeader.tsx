"use client";

import { MapPin, Eye, Phone, Mail, Globe, User, Clock, X } from "lucide-react";
import { LocationData } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import { LanguageSelector } from "@/components/language-selector";

interface PageHeaderProps {
  location: LocationData;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function PageHeader({ location, showBackButton = false, onBackClick }: PageHeaderProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleImageClick = () => {
    if (location.facilityImage) {
      setIsImageModalOpen(true);
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white shadow-md border-b border-gray-200 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              onClick={onBackClick}
              variant="ghost"
              className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-10 h-10 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group border-2 border-white shadow-md">
              {location.facilityImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={location.facilityImage}
                    alt={location.name}
                    layout="fill"
                    objectFit="cover"
                    className="cursor-pointer transition-transform duration-300 group-hover:scale-110"
                    onClick={handleImageClick}
                  />
                  <div
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <MapPin className="w-6 h-6 text-gray-500" />
              )}
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => setIsInfoModalOpen(true)}
            >
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {location.name}
              </h1>
              <p className="text-xs text-gray-500 truncate">{location.address}</p>
            </div>
          </div>

          <div className="ml-auto">
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Tesis Görseli Modal */}
      {location.facilityImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/90 border-0">
            <DialogTitle>
              <VisuallyHidden.Root>Tesis Fotoğrafı</VisuallyHidden.Root>
            </DialogTitle>

            <div className="absolute top-4 right-4 z-20">
              <Button
                onClick={() => setIsImageModalOpen(false)}
                variant="ghost"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 w-10 h-10 rounded-full"
              >
                ✕
              </Button>
            </div>

            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="relative w-full h-full">
                <Image
                  src={location.facilityImage}
                  alt={location.name}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Hizmet Noktası Bilgi Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="max-w-md w-[92vw] p-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
          <DialogTitle>
            <VisuallyHidden.Root>{location.name}</VisuallyHidden.Root>
          </DialogTitle>

          {location.facilityImage && (
            <div className="relative w-full h-40">
              <Image
                src={location.facilityImage}
                alt={location.name}
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-white font-semibold text-base">{location.name}</h2>
              </div>
            </div>
          )}

          <div className={`px-5 pb-5 space-y-3 ${!location.facilityImage ? 'pt-5' : ''}`}>
            {!location.facilityImage && (
              <h2 className="font-semibold text-gray-900 text-base">{location.name}</h2>
            )}

            {location.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">{location.address}</p>
              </div>
            )}

            {location.phone && (
              <a href={`tel:${location.phone}`} className="flex items-center gap-3 group">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{location.phone}</p>
              </a>
            )}

            {location.email && (
              <a href={`mailto:${location.email}`} className="flex items-center gap-3 group">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{location.email}</p>
              </a>
            )}

            {location.website && (
              <a href={location.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors truncate">{location.website}</p>
              </a>
            )}

            {location.managerName && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700">{location.managerName}</p>
              </div>
            )}

            {location.workingHours?.start && location.workingHours?.end && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-700">{location.workingHours.start} - {location.workingHours.end}</p>
              </div>
            )}

            {location.shortDescription && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">{location.shortDescription}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
