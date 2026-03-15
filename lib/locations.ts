import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { createSlug } from './utils';

export interface LocationData {
  id?: string;
  name: string;
  slug: string;
  type: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  email: string;
  website: string;
  socialMedia: string;
  season: string;
  workingHours: { start: string; end: string };
  shortDescription: string;
  fullDescription: string;
  isActive: boolean;
  maxCapacity: string;
  notes: string;
  photos: Array<string | null>;
  facilityImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LOCATIONS_COLLECTION = 'locations';

export const saveLocation = async (locationData: Omit<LocationData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date();
    
    // Slug oluştur (6 haneli rakam ile)
    const slug = createSlug(locationData.name);
    
    const docRef = await addDoc(collection(db, LOCATIONS_COLLECTION), {
      ...locationData,
      slug,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving location:', error);
    throw new Error('Hizmet noktası kaydedilirken bir hata oluştu');
  }
};

export const getLocations = async (): Promise<LocationData[]> => {
  try {
    const q = query(collection(db, LOCATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      slug: doc.data().slug || createSlug(doc.data().name || '', true), // Eski kayıtlar için fallback
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as LocationData[];
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw new Error('Hizmet noktaları yüklenirken bir hata oluştu');
  }
};

export const updateLocation = async (id: string, locationData: Partial<LocationData>): Promise<void> => {
  try {
    const locationRef = doc(db, LOCATIONS_COLLECTION, id);
    
    const updateData: any = {
      ...locationData,
      updatedAt: new Date(),
    };
    if (locationData.slug !== undefined) {
      updateData.slug = locationData.slug;
    }
    await updateDoc(locationRef, updateData);
  } catch (error) {
    console.error('Error updating location:', error);
    throw new Error('Hizmet noktası güncellenirken bir hata oluştu');
  }
};

export const deleteLocation = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, LOCATIONS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting location:', error);
    throw new Error('Hizmet noktası silinirken bir hata oluştu');
  }
};

/**
 * Slug ile lokasyon bulma
 */
export const getLocationBySlug = async (slug: string): Promise<LocationData | null> => {
  try {
    const locations = await getLocations();
    return locations.find(location => location.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching location by slug:', error);
    return null;
  }
};
