"use client";

import { MapPin, Eye } from "lucide-react";
import { LocationData } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface PageHeaderProps {
  location: LocationData;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function PageHeader({ location, showBackButton = false, onBackClick }: PageHeaderProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleImageClick = () => {
    if (location.facilityImage) {
      setIsImageModalOpen(true);
    }
  };

  return (
    <div>
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            {showBackButton && (
              <Button
                onClick={onBackClick}
                variant="ghost"
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-medium p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center text-sm flex-shrink-0 w-10 h-10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative group">
              {location.facilityImage ? (
                <div className="relative w-full h-full">
                  <img 
                    src={location.facilityImage} 
                    alt={location.name}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110 border-2 border-gray-200 rounded-lg shadow-md"
                    onClick={handleImageClick}
                  />
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <MapPin className="w-6 h-6 text-gray-600" />
              )}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-1 drop-shadow-sm">
                {location.name}
              </h1>
              <p className="text-gray-600 text-sm font-medium drop-shadow-sm">{location.address}</p>
            </div>
          </div>
        </div>
      </div>

      {location.facilityImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95 border-0">
            <DialogTitle>
              <VisuallyHidden.Root>Tesis Fotoğrafı</VisuallyHidden.Root>
            </DialogTitle>
            
            <div className="absolute top-4 right-4 z-20">
              <Button
                onClick={() => setIsImageModalOpen(false)}
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 w-10 h-10 rounded-lg flex items-center justify-center"
              >
                ✕
              </Button>
            </div>

            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={location.facilityImage}
                alt={location.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}