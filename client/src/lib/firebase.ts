// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC...", // your real API key
  authDomain: "smartpromptiq.firebaseapp.com",
  projectId: "smartpromptiq",
  storageBucket: "smartpromptiq.appspot.com",
  messagingSenderId: "935539862545",
  appId: "1:935539862545:web:..." // your actual app ID
  // measurementId: "G-..." // optional
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

export { auth };
// export { auth, db, storage };
