// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOtORiDf0Lmvr-3gGRcfpmduXJSkvUv1E",
  authDomain: "finote-keep-track.firebaseapp.com",
  projectId: "finote-keep-track",
  storageBucket: "finote-keep-track.firebasestorage.app",
  messagingSenderId: "859853161067",
  appId: "1:859853161067:web:6ba6d8f526e1802035672e",
  measurementId: "G-0S5R3J75LB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optionally export analytics
export { analytics };
export default app;
