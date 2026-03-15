import { Star, Heart, Sparkles, Award } from "lucide-react";
import { getCategoryColors as getLibCategoryColors, getColorPreview, CategoryColorSettings } from "@/lib/categories";

// Default red colors as fallback
const getDefaultColors = (category: string) => {
  return {
    bg: "bg-gradient-to-br from-red-400 via-red-500 to-red-600",
    border: "border-red-300",
    text: "text-red-50",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: "text-red-50",
    decorativeIcons: [Star, Heart, Sparkles, Award]
  };
};

// Cache for category colors to avoid repeated API calls
let categoryColorsCache: CategoryColorSettings[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedCategoryColors = async (): Promise<CategoryColorSettings[]> => {
  const now = Date.now();
  
  if (!categoryColorsCache || (now - cacheTimestamp) > CACHE_DURATION) {
    try {
      categoryColorsCache = await getLibCategoryColors();
      cacheTimestamp = now;
    } catch (error) {
      console.error('Error fetching category colors:', error);
      categoryColorsCache = [];
    }
  }
  
  return categoryColorsCache || [];
};

export const getDisplayCategoryColors = async (category: string) => {
  try {
    const categoryColors = await getCachedCategoryColors();
    const colorSettings = categoryColors.find(color => color.categoryId === category);
    
    if (colorSettings) {
      // If using image, return image-based styling
      if (colorSettings.useImage && colorSettings.categoryImage) {
        return {
          bg: `bg-gray-600`, // Fallback background
          border: `border-gray-300`,
          text: "text-white",
          badge: `bg-gray-100 text-gray-800 border-gray-200`,
          icon: "text-white",
          decorativeIcons: [Star, Heart, Sparkles, Award],
          customStyle: {
            backgroundImage: `url(${colorSettings.categoryImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          },
          useImage: true,
          categoryImage: colorSettings.categoryImage
        };
      }
      
      // Generate colors based on the custom settings
      if (colorSettings.colorType === 'gradient' && colorSettings.secondaryColor) {
        return {
          bg: `bg-gradient-to-br from-[${colorSettings.primaryColor}] to-[${colorSettings.secondaryColor}]`,
          border: `border-[${colorSettings.primaryColor}]/80`,
          text: "text-white",
          badge: `bg-[${colorSettings.primaryColor}]/10 text-[${colorSettings.primaryColor}] border-[${colorSettings.primaryColor}]/20`,
          icon: "text-white",
          decorativeIcons: [Star, Heart, Sparkles, Award],
          customStyle: {
            background: `linear-gradient(135deg, ${colorSettings.primaryColor}, ${colorSettings.secondaryColor})`
          },
          useImage: false
        };
      } else {
        return {
          bg: `bg-[${colorSettings.primaryColor}]`,
          border: `border-[${colorSettings.primaryColor}]`,
          text: "text-white",
          badge: `bg-[${colorSettings.primaryColor}]/10 text-[${colorSettings.primaryColor}] border-[${colorSettings.primaryColor}]/20`,
          icon: "text-white",
          decorativeIcons: [Star, Heart, Sparkles, Award],
          customStyle: {
            backgroundColor: colorSettings.primaryColor
          },
          useImage: false
        };
      }
    }
  } catch (error) {
    console.error('Error getting category colors:', error);
  }
  
  // Return default red colors if no custom colors found
  return getDefaultColors(category);
};

// Synchronous version for components that can't use async
export const getCategoryColorsSync = (category: string) => {
  return {
    ...getDefaultColors(category),
    decorativeIcons: [Star, Heart, Sparkles, Award],
    useImage: false
  };
};