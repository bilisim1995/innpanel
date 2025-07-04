import { create } from 'zustand';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({
        isAuthenticated: true,
        user: userCredential.user,
      });
      
      // Store minimal auth state in localStorage
      localStorage.setItem('inn-auth', JSON.stringify({
        isAuthenticated: true,
        email: userCredential.user.email
      }));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ isAuthenticated: false, user: null });
      localStorage.removeItem('inn-auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  updateUserProfile: async (displayName: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      await updateProfile(currentUser, {
        displayName: displayName
      });

      // Update the user state
      set({ user: { ...currentUser, displayName } });
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Profil güncellenirken bir hata oluştu');
    }
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error('Password change error:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Mevcut şifre yanlış');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Yeni şifre çok zayıf');
      } else {
        throw new Error('Şifre değiştirilirken bir hata oluştu');
      }
    }
  },
}));

// Listen to auth state changes
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    useAuth.setState({
      isAuthenticated: !!user,
      user,
    });
  });
}