// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjz-8h0vrYIvAv86XWzsHhp1lc6XbtJn4",
  authDomain: "mern-student-dashboard.firebaseapp.com",
  projectId: "mern-student-dashboard",
  storageBucket: "mern-student-dashboard.appspot.com",
  messagingSenderId: "853754839022",
  appId: "1:853754839022:web:75309e9d1c2ebddafa98ff",
  measurementId: "G-Q03KE190FZ",
  databaseURL:
    "https://mern-student-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default firebaseConfig;
