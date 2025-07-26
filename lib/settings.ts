import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, limit } from 'firebase/firestore';

export interface SettingsData {
  id?: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SETTINGS_COLLECTION = 'settings';

export const saveSetting = async (key: string, value: string, description?: string): Promise<string> => {
  try {
    // Check if setting already exists
    const existingSetting = await getSetting(key);
    
    if (existingSetting) {
      // Update existing setting
      await updateSetting(existingSetting.id!, { value, description });
      return existingSetting.id!;
    } else {
      // Create new setting
      const now = new Date();
      const docRef = await addDoc(collection(db, SETTINGS_COLLECTION), {
        key,
        value,
        description: description || '',
        createdAt: now,
        updatedAt: now,
      });
      
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving setting:', error);
    throw new Error('Ayar kaydedilirken bir hata oluştu');
  }
};

export const getSetting = async (key: string): Promise<SettingsData | null> => {
  try {
    const q = query(
      collection(db, SETTINGS_COLLECTION), 
      where('key', '==', key),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as SettingsData;
  } catch (error) {
    console.error('Error fetching setting:', error);
    return null;
  }
};

export const getSettings = async (): Promise<SettingsData[]> => {
  try {
    const q = query(collection(db, SETTINGS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as SettingsData[];
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Ayarlar yüklenirken bir hata oluştu');
  }
};

export const updateSetting = async (id: string, settingData: Partial<SettingsData>): Promise<void> => {
  try {
    const settingRef = doc(db, SETTINGS_COLLECTION, id);
    await updateDoc(settingRef, {
      ...settingData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    throw new Error('Ayar güncellenirken bir hata oluştu');
  }
};

export const deleteSetting = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SETTINGS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw new Error('Ayar silinirken bir hata oluştu');
  }
};

// Helper functions for specific settings
export const saveWhatsAppNumber = async (phoneNumber: string): Promise<void> => {
  await saveSetting('whatsapp_number', phoneNumber, 'WhatsApp iletişim numarası');
};

export const getWhatsAppNumber = async (): Promise<string | null> => {
  const setting = await getSetting('whatsapp_number');
  return setting?.value || null;
};

export const saveNotificationEmail = async (email: string): Promise<void> => {
  await saveSetting('notification_email', email, 'Rezervasyon bildirim e-postası');
};

export const getNotificationEmail = async (): Promise<string | null> => {
  const setting = await getSetting('notification_email');
  return setting?.value || null;
};
