import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, and } from 'firebase/firestore';
import { convertTimestampsToDate, removeUndefinedValues } from './utils';

export interface AssignmentData {
  id?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  companyName: string;
  locationId: string;
  locationSlug?: string;
  locationName: string;
  locationType: string;
  managerName: string;
  assignedAt: Date;
  isActive: boolean;
  notes?: string;
  // Pricing and commission settings
  pricingSettings?: {
    prepaymentEnabled: boolean;
    prepaymentAmount?: number;
    displayPrice?: number;
    paymentMethods?: {
      fullPayment: boolean;
      prePayment: boolean;
      fullAtLocation: boolean;
    };
    commissionAmount?: number;
    dateRanges?: Array<{
      id: string;
      startDate: Date;
      endDate: Date;
      timeSlots: Array<{
        id: string;
        startTime: string;
        endTime: string;
        price: number;
        currency: 'TL' | 'USD' | 'EUR';
        vehiclePrices?: Array<{
          vehicleId: string;
          vehicleTypeName: string;
          maxPassengerCapacity: number;
          price: number;
          currency: 'TL' | 'USD' | 'EUR';
        }>;
        quota?: number;
        vehicleId?: string | null;
        vehicleCount?: number | null;
        routeId?: string | null;
      }>;
    }>;
  };
}

const ASSIGNMENTS_COLLECTION = 'assignments';

export const checkExistingAssignment = async (serviceId: string, locationId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION),
      and(
        where('serviceId', '==', serviceId),
        where('locationId', '==', locationId),
        where('isActive', '==', true)
      )
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking existing assignment:', error);
    throw new Error('Mevcut atama kontrolü yapılırken bir hata oluştu');
  }
};

export const saveAssignment = async (assignmentData: Omit<AssignmentData, 'id' | 'assignedAt'>): Promise<string> => {
  try {
    // Check if assignment already exists
    const exists = await checkExistingAssignment(assignmentData.serviceId, assignmentData.locationId);
    if (exists) {
      throw new Error('Bu hizmet zaten bu hizmet noktasına atanmış durumda');
    }

    const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), {
      ...assignmentData,
      assignedAt: new Date(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving assignment:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Atama kaydedilirken bir hata oluştu');
  }
};

export const getAssignments = async (): Promise<AssignmentData[]> => {
  try {
    const q = query(collection(db, ASSIGNMENTS_COLLECTION), orderBy('assignedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        assignedAt: data.assignedAt?.toDate() || new Date(),
        // Convert all nested Timestamps in pricingSettings
        pricingSettings: data.pricingSettings ? convertTimestampsToDate(data.pricingSettings) : undefined,
      };
    }) as AssignmentData[];
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw new Error('Atamalar yüklenirken bir hata oluştu');
  }
};

export const updateAssignment = async (id: string, assignmentData: Partial<AssignmentData>): Promise<void> => {
  try {
    console.log('updateAssignment called with data:', JSON.stringify(assignmentData, null, 2));
    
    const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, id);
    // Remove undefined values to prevent Firestore errors
    const cleanedData = removeUndefinedValues(assignmentData);
    
    console.log('Cleaned data for Firestore:', JSON.stringify(cleanedData, null, 2));
    
    await updateDoc(assignmentRef, cleanedData);
    
    console.log('Assignment updated successfully in Firestore');
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw new Error('Atama güncellenirken bir hata oluştu');
  }
};

export const deleteAssignment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw new Error('Atama silinirken bir hata oluştu');
  }
};

export const getAssignmentsByService = async (serviceId: string): Promise<AssignmentData[]> => {
  try {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION), 
      where('serviceId', '==', serviceId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        assignedAt: data.assignedAt?.toDate() || new Date(),
        // Convert all nested Timestamps in pricingSettings
        pricingSettings: data.pricingSettings ? convertTimestampsToDate(data.pricingSettings) : undefined,
      };
    }) as AssignmentData[];
  } catch (error) {
    console.error('Error fetching assignments by service:', error);
    throw new Error('Hizmet atamaları yüklenirken bir hata oluştu');
  }
};

export const getAssignmentsByLocation = async (locationId: string): Promise<AssignmentData[]> => {
  try {
    const q = query(
      collection(db, ASSIGNMENTS_COLLECTION), 
      where('locationId', '==', locationId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        assignedAt: data.assignedAt?.toDate() || new Date(),
        // Convert all nested Timestamps in pricingSettings
        pricingSettings: data.pricingSettings ? convertTimestampsToDate(data.pricingSettings) : undefined,
      };
    }) as AssignmentData[];
  } catch (error) {
    console.error('Error fetching assignments by location:', error);
    throw new Error('Hizmet noktası atamaları yüklenirken bir hata oluştu');
  }
};