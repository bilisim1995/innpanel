import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, setDoc } from 'firebase/firestore';

export interface CategoryDefinition {
  id?: string;
  slug: string;
  labels: {
    tr: string;
    en: string;
  };
  iconKey: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryColorSettings {
  id?: string;
  categoryId: string;
  categoryName: string;
  colorType: 'solid' | 'gradient' | 'rgb' | 'hex';
  primaryColor: string;
  secondaryColor?: string; // For gradients
  useImage: boolean; // Whether to use image instead of color
  categoryImage?: string; // Image URL for category
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORIES_COLLECTION = 'categories';
const CATEGORY_COLORS_COLLECTION = 'category_colors';

export const saveCategory = async (
  categoryData: Omit<CategoryDefinition, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving category:', error);
    throw new Error('Kategori kaydedilirken bir hata oluştu');
  }
};

export const getCategories = async (): Promise<CategoryDefinition[]> => {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('sortOrder', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate() || new Date(),
      updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
    })) as CategoryDefinition[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Kategoriler yüklenirken bir hata oluştu');
  }
};

export const updateCategory = async (
  id: string,
  categoryData: Partial<CategoryDefinition>
): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, id);
    await setDoc(categoryRef, {
      ...categoryData,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Kategori güncellenirken bir hata oluştu');
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Kategori silinirken bir hata oluştu');
  }
};

export const saveCategoryColor = async (colorData: Omit<CategoryColorSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date();
    const docRef = await addDoc(collection(db, CATEGORY_COLORS_COLLECTION), {
      ...colorData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving category color:', error);
    throw new Error('Kategori rengi kaydedilirken bir hata oluştu');
  }
};

export const getCategoryColors = async (): Promise<CategoryColorSettings[]> => {
  try {
    const q = query(collection(db, CATEGORY_COLORS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as CategoryColorSettings[];
  } catch (error) {
    console.error('Error fetching category colors:', error);
    throw new Error('Kategori renkleri yüklenirken bir hata oluştu');
  }
};

export const updateCategoryColor = async (id: string, colorData: Partial<CategoryColorSettings>): Promise<void> => {
  try {
    const colorRef = doc(db, CATEGORY_COLORS_COLLECTION, id);
    await updateDoc(colorRef, {
      ...colorData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating category color:', error);
    throw new Error('Kategori rengi güncellenirken bir hata oluştu');
  }
};

export const deleteCategoryColor = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, CATEGORY_COLORS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting category color:', error);
    throw new Error('Kategori rengi silinirken bir hata oluştu');
  }
};

// Helper function to get color preview
export const getColorPreview = (colorSettings: CategoryColorSettings): string => {
  switch (colorSettings.colorType) {
    case 'solid':
      return colorSettings.primaryColor;
    case 'gradient':
      return `linear-gradient(135deg, ${colorSettings.primaryColor}, ${colorSettings.secondaryColor || colorSettings.primaryColor})`;
    case 'rgb':
      return colorSettings.primaryColor;
    case 'hex':
      return colorSettings.primaryColor;
    default:
      return colorSettings.primaryColor;
  }
};

// Helper function to validate color format
export const validateColor = (color: string, type: string): boolean => {
  switch (type) {
    case 'hex':
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    case 'rgb':
      return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);
    case 'solid':
    case 'gradient':
      return color.length > 0;
    default:
      return false;
  }
};