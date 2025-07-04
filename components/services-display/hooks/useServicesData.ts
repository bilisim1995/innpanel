import { useState, useEffect } from "react";
import { LocationData, getLocationBySlug } from "@/lib/locations";
import { ServiceData, getServices } from "@/lib/services";
import { AssignmentData, getAssignmentsByLocation } from "@/lib/assignments";
import { getCategoryLabel, getDisplayCategoryColors } from "../utils/categoryUtils";

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

export function useServicesData(locationSlug: string) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [assignments, setAssignments] = useState<EnhancedAssignmentData[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<EnhancedAssignmentData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryColors, setCategoryColors] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [locationSlug]);

  // Load category colors
  useEffect(() => {
    const loadCategoryColors = async () => {
      const colors: {[key: string]: any} = {};
      const categories = ["region-tours", "motor-tours", "balloon", "transfer", "other"];
      
      for (const category of categories) {
        colors[category] = await getDisplayCategoryColors(category);
      }
      
      setCategoryColors(colors);
    };
    
    loadCategoryColors();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null); 

      // Firestore rules'a takılmamak için try-catch içinde çalıştır
      try {
        // Sadece slug ile lokasyonu bul
        const currentLocation = await getLocationBySlug(locationSlug);

        if (!currentLocation) {
          setError("Hizmet noktası bulunamadı");
          setLoading(false);
          return;
        }

        setLocation(currentLocation);

        // Paralel olarak verileri yükle
        const [assignmentsData, servicesData] = await Promise.all([
          getAssignmentsByLocation(currentLocation.id!),
          getServices(),
        ]);

        // Atamaları hizmet detayları ile birleştir
        const enhancedAssignments = assignmentsData.map(assignment => {
          const serviceDetails = servicesData.find(service => service.id === assignment.serviceId);
          return {
            ...assignment,
            serviceDetails
          };
        }).filter(assignment => 
          assignment.serviceDetails && 
          assignment.isActive && 
          assignment.serviceDetails.isActive
        );

        setAssignments(enhancedAssignments);
        setFilteredAssignments(enhancedAssignments);
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
  };

  const handleCategorySelect = (categoryId: string) => {
    const categoryLabel = getCategoryLabel(categoryId);
    setSelectedCategory(categoryLabel);
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
    loading,
    error,
    handleCategorySelect,
    handleClearFilter
  };
}