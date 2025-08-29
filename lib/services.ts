import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { convertTimestampsToDate } from './utils';

export interface ServiceData {
  id?: string;
  category: string;
  serviceName: string;
  companyName: string;
  companyAddress: string;
  contactNumber: string;
  manager: string;
  isActive: boolean;
  quota: number;
  coverImage?: string | null;
  paymentOptions: Array<{id: string, amount: string}>;
  categoryDetails?: {
    vehicleDetails?: {
      features: string;
      baggageCapacity: string;
    };
    [key: string]: any; // Diğer categoryDetails alanları için
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SERVICES_COLLECTION = 'services';

export const saveService = async (serviceData: Omit<ServiceData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), {
      ...serviceData,
      quota: parseInt(serviceData.quota.toString()) || 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving service:', error);
    throw new Error('Hizmet kaydedilirken bir hata oluştu');
  }
};

export const getServices = async (): Promise<ServiceData[]> => {
  try {
    const q = query(collection(db, SERVICES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();

      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Convert all nested Timestamps in categoryDetails
        categoryDetails: convertTimestampsToDate(data.categoryDetails),
      };
    }) as ServiceData[];
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Hizmetler yüklenirken bir hata oluştu');
  }
};

export const updateService = async (id: string, serviceData: Partial<ServiceData>): Promise<void> => {
  try {
    // Create update payload, excluding undefined values
    const updatePayload: any = {
      updatedAt: new Date(),
    };
    
    // Only include defined fields in the update
    Object.keys(serviceData).forEach(key => {
      const value = (serviceData as any)[key];
      if (value !== undefined) {
        if (key === 'quota') {
          updatePayload[key] = parseInt(value.toString()) || 0;
        } else {
          updatePayload[key] = value;
        }
      }
    });
    
    const serviceRef = doc(db, SERVICES_COLLECTION, id);
    await updateDoc(serviceRef, updatePayload);
  } catch (error) {
    console.error('Error updating service:', error);
    throw new Error('Hizmet güncellenirken bir hata oluştu');
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SERVICES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting service:', error);
    throw new Error('Hizmet silinirken bir hata oluştu');
  }
};