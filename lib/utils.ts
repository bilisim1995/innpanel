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
 * Helper function to convert Firestore Timestamps to Date objects recursively
 */
export const convertTimestampsToDate = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Check if it's a Firestore Timestamp
  if (obj && typeof obj === 'object' && typeof obj.toDate === 'function') {
    return obj.toDate();
  }
  
  // If it's an array, recursively convert each element
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestampsToDate(item));
  }
  
  // If it's an object, recursively convert each property
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertTimestampsToDate(obj[key]);
      }
    }
    return converted;
  }
  
  // Return primitive values as-is
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
      // Special handling for Date objects - keep them as is for Firestore
      if (value instanceof Date) {
        cleaned[key] = value;
      } else {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
  }
  return cleaned;
};