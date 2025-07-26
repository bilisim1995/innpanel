
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 6 haneli rastgele sayı oluşturur
 */
export function generateRandomNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Türkçe karakterleri İngilizce karşılıklarına çevirir ve URL-friendly slug oluşturur
 */
export function createSlug(text: string, addRandomNumber: boolean = true): string {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G', 
    'ı': 'i', 'I': 'I',
    'İ': 'I', 'i': 'i',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };

  const baseSlug = text
    .split('')
    .map(char => turkishChars[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Sadece harf, rakam, boşluk ve tire
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
    .replace(/^-|-$/g, ''); // Başta ve sonda tire varsa kaldır

  if (addRandomNumber) {
    return `${baseSlug}-${generateRandomNumber()}`;
  }
  
  return baseSlug;
}

/**
 * Slug'dan okunabilir metin oluşturur
 */
export function slugToText(slug: string): string {
  // Son 6 haneli sayıyı kaldır
  const withoutNumber = slug.replace(/-\d{6}$/, '');
  
  return withoutNumber
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Slug'dan sadece rakam kısmını çıkarır
 */
export function extractSlugNumber(slug: string): string | null {
  const match = slug.match(/-(\d{6})$/);
  return match ? match[1] : null;
}

/**
 * Mevcut slug'ı günceller (yeni metin + mevcut rakam)
 */
export function updateSlug(newText: string, currentSlug: string): string {
  const existingNumber = extractSlugNumber(currentSlug);
  const baseSlug = createSlug(newText, false);
  
  if (existingNumber) {
    return `${baseSlug}-${existingNumber}`;
  }
  
  // Eğer mevcut slug'da rakam yoksa yeni rakam oluştur
  return `${baseSlug}-${generateRandomNumber()}`;
}


/**
 * Telefon numarasını WhatsApp API formatına (90...) getirir.
 */
export function formatPhoneNumberForWhatsApp(phoneNumber: string): string | null {
  if (!phoneNumber) return null;
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('90') && cleaned.length === 12) return cleaned;
  if (cleaned.startsWith('0') && cleaned.length === 11) return `90${cleaned.substring(1)}`;
  if (cleaned.length === 10 && cleaned.startsWith('5')) return `90${cleaned}`;
  console.warn(`Geçersiz telefon numarası formatı: ${phoneNumber}`);
  return null;
}

/**
 * Helper function to convert Firestore Timestamps to Date objects recursively
 */
export const convertTimestampsToDate = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj && typeof obj === 'object' && typeof obj.toDate === 'function') {
    return obj.toDate();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestampsToDate(item));
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertTimestampsToDate(obj[key]);
      }
    }
    return converted;
  }
  
  return obj;
};

/**
 * Helper function to remove undefined values from an object
 */
export const removeUndefinedValues = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues);
  }
  
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value instanceof Date) {
        cleaned[key] = value;
      } else {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
  }
  return cleaned;
};
