import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface VehicleData {
  id?: string;
  vehicleTypeName: string;
  maxPassengerCapacity: number;
  vehicleImages: Array<string | null>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VEHICLES_COLLECTION = 'vehicles';

export const saveVehicle = async (vehicleData: Omit<VehicleData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
      ...vehicleData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving vehicle:', error);
    throw new Error('Araç kaydedilirken bir hata oluştu');
  }
};

export const getVehicles = async (): Promise<VehicleData[]> => {
  try {
    const q = query(collection(db, VEHICLES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as VehicleData[];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw new Error('Araçlar yüklenirken bir hata oluştu');
  }
};

export const updateVehicle = async (id: string, vehicleData: Partial<VehicleData>): Promise<void> => {
  try {
    const vehicleRef = doc(db, VEHICLES_COLLECTION, id);
    await updateDoc(vehicleRef, {
      ...vehicleData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw new Error('Araç güncellenirken bir hata oluştu');
  }
};

export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, VEHICLES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw new Error('Araç silinirken bir hata oluştu');
  }
};