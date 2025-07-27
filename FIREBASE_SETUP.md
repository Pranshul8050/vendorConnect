# Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `vendor-connect-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Phone" authentication
5. Add your domain to authorized domains if deploying

## 3. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (</>)
4. Register your app with name: `vendor-connect-web`
5. Copy the configuration object

## 5. Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

## 6. Security Rules (Optional)

For Firestore, update rules in Firebase Console:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Buying groups - members can read, owners can write
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.ownerId == request.auth.uid);
    }
    
    // Orders - vendors and suppliers can read relevant orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

## 7. Test the Setup

1. Restart your development server
2. Go to `/login`
3. You should see "Firebase Mode Active" instead of "Demo Mode"
4. Try phone authentication with a real phone number

## Demo Mode

If you don't set up Firebase, the app runs in demo mode:
- Use any phone number
- Use OTP: `123456`
- Data is stored in memory (resets on refresh)
