"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Banknote } from "lucide-react";
import { useState, useEffect } from "react";
import { AssignmentData } from "@/lib/assignments";
import { ServiceData } from "@/lib/services";
import { getCategoryColorsSync } from "./utils/categoryUtils";
import { getCategoryIcon as getDynamicCategoryIcon } from "@/lib/category-icons";
import Image from 'next/image';

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

interface CategoryGridProps {
  assignments: EnhancedAssignmentData[];
  onCategorySelect: (categoryId: string) => void;
  onServiceSelect: (assignment: EnhancedAssignmentData) => void;
  categoryColors: {[key: string]: any};
  categoryMetaMap: {[key: string]: { label: string; iconKey: string }};
}

export function CategoryGrid({ assignments, onCategorySelect, onServiceSelect, categoryColors, categoryMetaMap }: CategoryGridProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderAssignments, setSliderAssignments] = useState<EnhancedAssignmentData[]>([]);

  useEffect(() => {
    const assignmentsWithImages = assignments
      .filter(assignment => assignment.serviceDetails?.coverImage)
      .filter((assignment, index, self) => 
        self.findIndex(a => a.serviceDetails?.coverImage === assignment.serviceDetails?.coverImage) === index
      ); 
    
    setSliderAssignments(assignmentsWithImages);
  }, [assignments]);

  useEffect(() => {
    if (sliderAssignments.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderAssignments.length);
    }, 4000); 
    
    return () => clearInterval(interval);
  }, [sliderAssignments.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % sliderAssignments.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + sliderAssignments.length) % sliderAssignments.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSlideClick = () => {
    if (sliderAssignments[currentSlide]) {
      onServiceSelect(sliderAssignments[currentSlide]);
    }
  };

  const getAvailableCategories = () => {
    const categories = assignments.reduce((acc, assignment) => {
      if (!acc.find(cat => cat.id === assignment.serviceCategory)) {
        const colors = categoryColors[assignment.serviceCategory] || getCategoryColorsSync(assignment.serviceCategory);
        const categoryMeta = categoryMetaMap[assignment.serviceCategory];
        acc.push({
          id: assignment.serviceCategory,
          label: categoryMeta?.label || assignment.serviceCategory,
          icon: getDynamicCategoryIcon(categoryMeta?.iconKey || "more-horizontal"),
          colors: colors,
          count: assignments.filter(a => a.serviceCategory === assignment.serviceCategory).length
        });
      }
      return acc;
    }, [] as Array<{id: string, label: string, icon: any, colors: any, count: number}>);
    
    return categories.sort((a, b) => b.count - a.count);
  };

  const availableCategories = getAvailableCategories();
  const currentAssignment = sliderAssignments[currentSlide];

  return (
    <div className="space-y-6">
      {sliderAssignments.length > 0 && (
        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-2xl cursor-pointer group" onClick={handleSlideClick} style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' }}>
          <div className="relative w-full h-full">
            {sliderAssignments.map((assignment, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={assignment.serviceDetails!.coverImage!}
                  alt={assignment.serviceName}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </div>
            ))}
          </div>

          {sliderAssignments.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 z-10 shadow-lg border border-white/30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 z-10 shadow-lg border border-white/30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {sliderAssignments.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {sliderAssignments.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white shadow-lg scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}

          {currentAssignment && (
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="space-y-2">
                <h2 className="text-white text-xl font-bold drop-shadow-lg leading-tight">
                  {currentAssignment.serviceName}
                </h2>
              </div>
            </div>
          )}

          {currentAssignment && (
            <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-6 z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 shadow-lg">
                {categoryMetaMap[currentAssignment.serviceCategory]?.label || currentAssignment.serviceCategory}
              </span>
              
              {currentAssignment.pricingSettings?.displayPrice && currentAssignment.pricingSettings.displayPrice > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-600/80 backdrop-blur-sm text-white border border-green-500/50 shadow-lg">
                  <Banknote className="w-3 h-3" />
                  {currentAssignment.pricingSettings.displayPrice} ₺
                </span>
              )}
            </div>
          )}

          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 shadow-xl border border-white/30">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {availableCategories.map((category, index) => {
          const CategoryIcon = category.icon;
          return (
            <Card
              key={category.id}
              className="group cursor-pointer overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 bg-white animate-in slide-in-from-bottom-4 shadow-xl border-2"
              style={{ animationDelay: `${index * 200}ms` }}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-0">
                <div 
                  className="p-6 relative overflow-hidden h-32"
                  style={category.colors.useImage && category.colors.categoryImage ? {
                    backgroundImage: `url(${category.colors.categoryImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: 'white'
                  } : category.colors.customStyle?.background ? 
                    { background: category.colors.customStyle.background, color: 'white' } : 
                    { backgroundColor: category.colors.customStyle?.backgroundColor || '#dc2626', color: 'white' }
                  }
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full translate-y-10 -translate-x-10"></div>
                  
                  <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    {!category.colors.useImage && (
                      <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border border-white/50 group-hover:scale-110 transition-transform duration-300 relative">
                        <CategoryIcon className="w-8 h-8 text-white drop-shadow-lg" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
                          {category.count}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white group-hover:from-gray-100 group-hover:to-gray-50 transition-all duration-300 h-20 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-2 text-gray-800 group-hover:text-gray-900 font-bold text-lg">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{category.label}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}