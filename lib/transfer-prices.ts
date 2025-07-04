import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface VehiclePrice {
  vehicleId: string;
  vehicleTypeName: string;
  maxPassengerCapacity: number;
  price: number;
}

export interface TransferPriceData {
  id?: string;
  departurePoint: string;
  arrivalPoint: string;
  transferDuration: number; // in minutes
  vehiclePrices: VehiclePrice[]; // Array of vehicles and their prices
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TRANSFER_PRICES_COLLECTION = 'transfer_prices';

export const saveTransferPrice = async (transferPriceData: Omit<TransferPriceData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, TRANSFER_PRICES_COLLECTION), {
      ...transferPriceData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving transfer price:', error);
    throw new Error('Transfer fiyatı kaydedilirken bir hata oluştu');
  }
};

export const getTransferPrices = async (): Promise<TransferPriceData[]> => {
  try {
    const q = query(collection(db, TRANSFER_PRICES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as TransferPriceData[];
  } catch (error) {
    console.error('Error fetching transfer prices:', error);
    throw new Error('Transfer fiyatları yüklenirken bir hata oluştu');
  }
};

export const updateTransferPrice = async (id: string, transferPriceData: Partial<TransferPriceData>): Promise<void> => {
  try {
    const transferPriceRef = doc(db, TRANSFER_PRICES_COLLECTION, id);
    await updateDoc(transferPriceRef, {
      ...transferPriceData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating transfer price:', error);
    throw new Error('Transfer fiyatı güncellenirken bir hata oluştu');
  }
};

export const deleteTransferPrice = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, TRANSFER_PRICES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting transfer price:', error);
    throw new Error('Transfer fiyatı silinirken bir hata oluştu');
  }
};

export const getTransferPricesByRoute = async (departurePoint: string, arrivalPoint: string): Promise<TransferPriceData[]> => {
  try {
    const transferPrices = await getTransferPrices();
    return transferPrices.filter(price => 
      price.departurePoint.toLowerCase() === departurePoint.toLowerCase() &&
      price.arrivalPoint.toLowerCase() === arrivalPoint.toLowerCase() &&
      price.isActive
    );
  } catch (error) {
    console.error('Error fetching transfer prices by route:', error);
    throw new Error('Güzergah transfer fiyatları yüklenirken bir hata oluştu');
  }
};