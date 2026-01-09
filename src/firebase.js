// Import functions we need from Firebase SDK
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const storage = getStorage(app);
const db = getFirestore(app);

// Export services so other files can use them
export { storage, db };
