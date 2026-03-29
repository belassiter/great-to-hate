import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgsU6n3H0P8tKwjG5ehSNAn2LlhwKYKU4",
  authDomain: "great-to-hate.firebaseapp.com",
  projectId: "great-to-hate",
  storageBucket: "great-to-hate.firebasestorage.app",
  messagingSenderId: "149404521851",
  appId: "1:149404521851:web:40fe0c81efa9bce358d9de",
  measurementId: "G-BNVT56HDGC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
