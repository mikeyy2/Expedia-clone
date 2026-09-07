// Firebase initialization for the Expedia-Clone project.
//
// Config values come from environment variables so that no project-specific
// values are committed to this public repository. Create React App only
// exposes variables prefixed with REACT_APP_ to the browser bundle.
//
// Setup: copy .env.example to .env, fill in the values from
// Firebase Console > Project settings > Your apps > SDK setup and configuration,
// then restart `npm start` (CRA reads .env only at startup).

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Fail loudly during development instead of throwing a confusing SDK error later.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "[firebase] Missing configuration. Copy .env.example to .env, fill in the " +
      "values from the Firebase console, and restart the dev server."
  );
}

const firebase_app = initializeApp(firebaseConfig);

export const auth = getAuth(firebase_app);
export const db = getFirestore(firebase_app);

export default firebase_app;
