
# Imran's Student & Batch Management System

Professional, high-performance management platform for teachers and educators.

## Features
- **Batch Management**: Detailed scheduling and fee tracking.
- **Attendance System**: Real-time tracking with automated absence alerts.
- **Honorarium Board**: Monthly payment grid with one-click SMS reminders.
- **Session Planner**: Lesson goal tracking with "Indigo Alerts" for active classes.
- **Data Portability**: Export your entire database as JSON for backup.

## Setup Instructions

### Firebase Configuration
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Create a **Firestore Database** in production mode.
4. Go to Project Settings and add a Web App to get your configuration.

### Netlify Deployment
1. Connect your GitHub repository to Netlify.
2. In Netlify's **Site Settings > Build & deploy > Environment**, add the following variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Ensure your `FirebaseConfig.ts` uses `import.meta.env.VITE_FIREBASE_...` to read these variables.

## Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide-React
- **Database/Auth**: Firebase Firestore & Auth
