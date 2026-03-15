import { useState, useEffect, useCallback } from "react";
import { LocationData, getLocationBySlug } from "@/lib/locations";
import { ServiceData, getServices } from "@/lib/services";
import { AssignmentData, getAssignmentsByLocation } from "@/lib/assignments";
import { getCategories } from "@/lib/categories";
import { getDisplayCategoryColors } from "../utils/categoryUtils";

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

export function useServicesData(locationSlug: string, locale: string) { // locale parametresi eklendi
  const [location, setLocation] = useState<LocationData | null>(null);
  const [assignments, setAssignments] = useState<EnhancedAssignmentData[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<EnhancedAssignmentData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryColors, setCategoryColors] = useState<{[key: string]: any}>({});
  const [categoryMetaMap, setCategoryMetaMap] = useState<{[key: string]: { label: string; iconKey: string }}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); 

      try {
        const currentLocation = await getLocationBySlug(locationSlug);

        if (!currentLocation) {
          setError("Hizmet noktası bulunamadı");
          setLoading(false);
          return;
        }

        setLocation(currentLocation);

        const [assignmentsData, servicesData, categoryRows] = await Promise.all([
          getAssignmentsByLocation(currentLocation.id!),
          getServices(),
          getCategories(),
        ]);

        const enhancedAssignments = assignmentsData.map(assignment => {
          const serviceDetails = servicesData.find(service => service.id === assignment.serviceId);
          return {
            ...assignment,
            serviceDetails
          };
        }).filter(assignment => 
          assignment.serviceDetails && 
          assignment.isActive && 
          assignment.serviceDetails.isActive &&
          assignment.serviceDetails.language === locale // Dil filtresi eklendi
        );

        setAssignments(enhancedAssignments);
        setFilteredAssignments(enhancedAssignments);

        const metaMap: {[key: string]: { label: string; iconKey: string }} = {};
        categoryRows.forEach((category) => {
          if (!category.slug) return;
          metaMap[category.slug] = {
            label: locale === "en" ? (category.labels?.en || category.slug) : (category.labels?.tr || category.slug),
            iconKey: category.iconKey || "more-horizontal",
          };
        });
        setCategoryMetaMap(metaMap);
      } catch (err) {
        console.error('Firebase veri yükleme hatası:', err);
        setError("Veriler yüklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [locationSlug, locale]); // locale bağımlılıklara eklendi

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadCategoryColors = async () => {
      const colors: {[key: string]: any} = {};
      const categoryIds = Array.from(new Set(assignments.map((assignment) => assignment.serviceCategory)));
      
      for (const categoryId of categoryIds) {
        colors[categoryId] = await getDisplayCategoryColors(categoryId);
      }
      
      setCategoryColors(colors);
    };
    
    if (assignments.length === 0) {
      setCategoryColors({});
      return;
    }

    loadCategoryColors();
  }, [assignments]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const filtered = assignments.filter(assignment => assignment.serviceCategory === categoryId);
    setFilteredAssignments(filtered);
  };

  const handleClearFilter = () => {
    setSelectedCategory(null);
    setFilteredAssignments(assignments);
  };

  return {
    location,
    assignments,
    filteredAssignments,
    selectedCategory,
    categoryColors,
    categoryMetaMap,
    loading,
    error,
    handleCategorySelect,
    handleClearFilter
  };
}