import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DEMO",
}

// Check if we have valid Firebase config
const hasValidConfig = firebaseConfig.apiKey !== "demo-key" && firebaseConfig.projectId !== "demo-project"

let app: any = null
let auth: any = null
let db: any = null
let storage: any = null
let functions: any = null
let analytics: any = null

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    functions = getFunctions(app)

    if (typeof window !== "undefined" && firebaseConfig.measurementId) {
      analytics = getAnalytics(app)
    }

    // Connect to emulators in development
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
      try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
        connectFirestoreEmulator(db, "localhost", 8080)
        connectStorageEmulator(storage, "localhost", 9199)
        connectFunctionsEmulator(functions, "localhost", 5001)
      } catch (error) {
        console.log("Emulators already connected")
      }
    }
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export { auth, db, storage, functions, analytics, hasValidConfig }
export default app
