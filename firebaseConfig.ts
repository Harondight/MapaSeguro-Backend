// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxZTmSPjRtFWORGymY2A7hIoISvAnzgMI",
  authDomain: "mapaseguro-889ab.firebaseapp.com",
  projectId: "mapaseguro-889ab",
  storageBucket: "mapaseguro-889ab.firebasestorage.app",
  messagingSenderId: "1029943270044",
  appId: "1:1029943270044:web:d113878a448e5a60eeeb59",
  measurementId: "G-TFGQ7M4TN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);