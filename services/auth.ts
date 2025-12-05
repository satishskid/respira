
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../constants';
import { UserProfile } from '../types';

// Initialize Firebase only if config is present and no app exists
let auth: any;

const isConfigValid = () => {
  return FIREBASE_CONFIG.apiKey && 
         FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" && 
         FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY";
};

if (!getApps().length && isConfigValid()) {
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
}

export const authService = {
  
  isConfigured: () => {
    return isConfigValid();
  },

  signInWithGoogle: async (): Promise<UserProfile | null> => {
    if (!auth) throw new Error("Firebase not initialized. Check constants.ts.");
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account' // Forces account selection
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      return {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error("Sign in failed detailed:", error);
      
      // 🚨 FOOLPROOF ERROR HANDLING FOR DEVELOPMENT 🚨
      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        throw new Error(`DOMAIN ERROR: Go to Firebase Console > Authentication > Settings > Authorized Domains and add: "${domain}"`);
      }
      
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error("AUTH ERROR: Go to Firebase Console > Authentication > Sign-in method and Enable 'Google'.");
      }

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in cancelled.");
      }
      
      if (error.code === 'auth/api-key-not-valid-please-pass-a-valid-api-key') {
         throw new Error("API KEY ERROR: Check constants.ts. The key looks invalid.");
      }

      throw error;
    }
  },

  logout: async () => {
    if (!auth) return;
    await signOut(auth);
  },

  onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
    if (!auth) return () => {};
    
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        callback({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        callback(null);
      }
    });
  }
};
