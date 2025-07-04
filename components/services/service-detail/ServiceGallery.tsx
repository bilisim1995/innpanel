"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Camera, Sparkles, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";

interface ServiceGalleryProps {
  assignment: AssignmentData;
  service: any;
  theme: any;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onImageClick: (imageUrl: string) => void;
}

export function ServiceGallery({ assignment, service, theme, isOpen, onToggle, onImageClick }: ServiceGalleryProps) {
  // Get the background style from theme
  const backgroundStyle = theme.customStyle?.background ? 
    { background: theme.customStyle.background } : 
    { backgroundColor: theme.customStyle?.backgroundColor || '#dc2626' };
  
  // Get text color based on background style
  const textColor = theme.customStyle?.backgroundColor || '#dc2626';
  
  // Get all images for gallery
  const getAllImages = () => {
    const images: string[] = [];
    
    // Add cover image first
    if (service.coverImage) {
      images.push(service.coverImage);
    }
    
    // Add gallery images
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
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card 
        className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-right-4 delay-500 border-2"
        style={{ 
          backgroundColor: `${textColor}10`,
          borderColor: `${textColor}20`
        }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-white/20 transition-colors duration-200">
            <CardTitle 
              className="flex items-center justify-between text-lg"
              style={{ color: textColor }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={backgroundStyle}
                >
                  <Camera className="h-5 w-5 text-white" />
                </div>
                Fotoğraf Galerisi
                <Sparkles 
                  className="w-5 h-5 animate-pulse"
                  style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                />
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((photo: string, index: number) => (
                <div 
                  key={index} 
                  className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 group animate-in zoom-in-95 cursor-pointer" 
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => onImageClick(photo)}
                >
                  <img 
                    src={photo}
                    alt={`${assignment.serviceName} - ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border border-white/50"
                      style={backgroundStyle}
                    >
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}