// Import the functions you need from the SDKs you need
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBoFmxAwQHb63LBTJ7Fz8vw7SXdNE93j-U",
	authDomain: "momento-5d8dd.firebaseapp.com",
	projectId: "momento-5d8dd",
	storageBucket: "momento-5d8dd.firebasestorage.app",
	messagingSenderId: "736319476564",
	appId: "1:736319476564:web:100e8212e38a72f093aec1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log("firebase.js loaded", { app, db });
