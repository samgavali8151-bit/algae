# Firebase Setup Guide

This guide walks you through setting up Firebase for the **Microalgae Carbon Capture & Recovery System**.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `microalgae-carbon-capture` (or your choice), and disable Google Analytics if not needed.
3. Click **Create project**.

## 2. Enable Firebase Authentication
1. Navigate to **Build > Authentication** and click **Get started**.
2. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google** (configure support email)

## 3. Enable Realtime Database
1. Navigate to **Build > Realtime Database** and click **Create Database**.
2. Select your closest database location (e.g. `United States (us-central1)` or `Singapore (asia-southeast1)`).
3. Start in **Locked mode** or test mode.
4. Go to the **Rules** tab, paste the contents of `firebase/database.rules.json`, and click **Publish**.
5. Note your database URL: `https://<YOUR-PROJECT-ID>-default-rtdb.firebaseio.com/`.

## 4. Enable Cloud Firestore
1. Navigate to **Build > Firestore Database** and click **Create Database**.
2. Start in **Production mode**.
3. Select your location and finalize creation.
4. Go to the **Rules** tab, paste the contents of `firebase/firestore.rules`, and click **Publish**.

## 5. Web App Configuration (Frontend)
1. Go to **Project Settings** (gear icon) > **General**.
2. Scroll down to **Your apps** and click the **Web** icon (`</>`).
3. Register app with nickname `algae-dashboard`.
4. Copy the `firebaseConfig` object and populate `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://your_project_id-default-rtdb.firebaseio.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
   ```

## 6. Service Account for Backend & Simulator
1. Go to **Project Settings** > **Service accounts**.
2. Click **Generate new private key**, then **Generate key**.
3. Save the downloaded JSON file as `backend/serviceAccountKey.json` and `simulator/serviceAccountKey.json`.
4. **Never commit this JSON file to version control.**
