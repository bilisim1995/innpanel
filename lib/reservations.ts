import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { removeUndefinedValues } from './utils';

export interface ReservationData {
  id?: string;
  // Service and Assignment Info
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  companyName: string;
  assignmentId: string;
  locationId: string;
  locationName: string;
  
  // Customer Info
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  
  // Reservation Details
  reservationDate: Date;
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    price: number;
  };
  
  // Participant Details
  personCount?: number; // For regular services
  personCountForTransfer?: number; // For transfer services
  vehicleCount?: number; // For motor tours and transfer
  
  // Selected Vehicles (for transfer)
  selectedVehicles?: Array<{
    vehicleId: string;
    vehicleTypeName: string;
    maxPassengerCapacity: number;
    count: number;
  }>;
  
  // Selected Vehicle (for motor tours)
  selectedVehicle?: {
    vehicleId: string;
    vehicleTypeName: string;
    maxPassengerCapacity: number;
  };
  
  // Pricing
  unitPrice: number;
  totalAmount: number;
  commissionAmount?: number;
  
  // Payment
  paymentMethod: 'full_start' | 'prepayment' | 'full_location';
  prepaymentAmount?: number;
  remainingAmount?: number;
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const RESERVATIONS_COLLECTION = 'reservations';

export const saveReservation = async (reservationData: Omit<ReservationData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date();
    const dataToSave = {
      ...reservationData,
      status: 'pending', // Default status
      createdAt: now,
      updatedAt: now,
    };
    
    // Remove undefined values to prevent Firestore errors
    const cleanedData = removeUndefinedValues(dataToSave);
    
    const docRef = await addDoc(collection(db, RESERVATIONS_COLLECTION), cleanedData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving reservation:', error);
    throw new Error('Rezervasyon kaydedilirken bir hata oluştu');
  }
};

export const getReservations = async (): Promise<ReservationData[]> => {
  try {
    const q = query(collection(db, RESERVATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reservationDate: doc.data().reservationDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ReservationData[];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw new Error('Rezervasyonlar yüklenirken bir hata oluştu');
  }
};

export const updateReservation = async (id: string, reservationData: Partial<ReservationData>): Promise<void> => {
  try {
    const reservationRef = doc(db, RESERVATIONS_COLLECTION, id);
    await updateDoc(reservationRef, {
      ...reservationData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw new Error('Rezervasyon güncellenirken bir hata oluştu');
  }
};

export const deleteReservation = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, RESERVATIONS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw new Error('Rezervasyon silinirken bir hata oluştu');
  }
};

export const getReservationsByService = async (serviceId: string): Promise<ReservationData[]> => {
  try {
    const q = query(
      collection(db, RESERVATIONS_COLLECTION), 
      where('serviceId', '==', serviceId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reservationDate: doc.data().reservationDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ReservationData[];
  } catch (error) {
    console.error('Error fetching reservations by service:', error);
    throw new Error('Hizmet rezervasyonları yüklenirken bir hata oluştu');
  }
};

export const getReservationsByLocation = async (locationId: string): Promise<ReservationData[]> => {
  try {
    const q = query(
      collection(db, RESERVATIONS_COLLECTION), 
      where('locationId', '==', locationId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reservationDate: doc.data().reservationDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ReservationData[];
  } catch (error) {
    console.error('Error fetching reservations by location:', error);
    throw new Error('Lokasyon rezervasyonları yüklenirken bir hata oluştu');
  }
};