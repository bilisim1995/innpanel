
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
    <div className="sticky top-0 z-20 bg-white shadow-md border-b border-gray-200 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              onClick={onBackClick}
              variant="ghost"
              className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-10 h-10 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group border-2 border-white shadow-lg">
              {location.facilityImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={location.facilityImage}
                    alt={location.name}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                    onClick={handleImageClick}
                  />
                  <div
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <MapPin className="w-7 h-7 text-gray-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {location.name}
              </h1>
              <p className="text-sm text-gray-600 truncate">{location.address}</p>
            </div>
          </div>
        </div>
      </div>

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
              <img
                src={location.facilityImage}
                alt={location.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
