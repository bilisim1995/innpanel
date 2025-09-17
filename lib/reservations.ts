import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
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
  customerEmail: string;
  customerPhone: string;
  visitorNote?: string;
  flightCode?: string; // flightCode eklendi
  
  // Reservation Details
  reservationDate: Date;
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
    price: number;
    currency: string;
  };
  
  // Participant Details
  adults: number;
  children: number;
  personCount?: number;
  personCountForTransfer?: number;
  vehicleCount?: number;
  selectedVehicles?: any[];
  selectedVehicle?: any;
  
  // Pricing
  totalAmount: number;
  unitPrice?: number;
  prepaymentAmount?: number;
  remainingAmount?: number;
  commissionAmount?: number;
  
  // Payment
  paymentMethod: 'full_start' | 'prepayment' | 'full_location';
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Locale
  locale?: string;
}

const RESERVATIONS_COLLECTION = 'reservations';

interface SaveReservationData extends Omit<ReservationData, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
    currency: string;
}

export const saveReservation = async (reservationData: SaveReservationData): Promise<string> => {
  try {
    const now = new Date();
    const { currency, locale, ...dbData } = reservationData;

    const dataToSave = {
      ...dbData,
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    };
    
    const cleanedData = removeUndefinedValues(dataToSave);
    
    const docRef = await addDoc(collection(db, RESERVATIONS_COLLECTION), cleanedData);

    try {
      const emailPayload = {
        serviceName: cleanedData.serviceName,
        totalAmount: cleanedData.totalAmount,
        currency: currency,
        reservationDetails: {
          date: cleanedData.reservationDate,
          timeSlot: `${cleanedData.timeSlot.startTime} - ${cleanedData.timeSlot.endTime}`,
          adults: cleanedData.adults,
          children: cleanedData.children,
          ...(cleanedData.serviceCategory === 'transfer' && cleanedData.flightCode && { flightCode: cleanedData.flightCode }) // Flight code eklendi
        },
        customerInfo: {
          name: `${cleanedData.customerName} ${cleanedData.customerSurname}`,
          email: cleanedData.customerEmail,
          phone: cleanedData.customerPhone,
          notes: cleanedData.visitorNote || '',
        },
        locale: locale, // locale eklendi
      };

      fetch('/api/send-reservation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

    } catch (emailError) {
      console.error('Failed to trigger reservation email:', emailError);
    }
    
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
