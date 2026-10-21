# EVA — Teacher Evaluation System (Mobile & Web App)

Cross-platform mobile and web application for the **EVA Teacher Evaluation System** at Wachemo University (WCU), built using **React Native**, **Expo (SDK 54)**, **Expo Router**, and **TypeScript**.

---

## Features

- **University Architecture**: Structured around Wachemo University's 7 colleges, departmental programs, academic years (1–5), and semesters (1–2).
- **Student Portal**:
  - Academic Profile selection and semester switcher.
  - Interactive Teacher Directory with real-time search.
  - Active Courses screen with instant evaluation indicators.
  - Evaluation Wizard assessing 6 core teaching criteria with 1–5 star ratings and written feedback.
  - Offline evaluation queue with automatic background sync when internet connection returns.
  - Personal evaluation history with update/delete capabilities.
- **Admin Portal**:
  - Live analytics dashboard (total teachers, students, reviews, average rating, top & lowest performers).
  - Hierarchical filtering (College → Program → Year → Semester).
  - Teacher creation, editing, and deletion.
  - Student role toggle (`student` / `admin`) and account management.
  - Evaluation moderation and CSV export.
  - System toggles (evaluation period open/closed, anonymous mode).
- **Design & UX**:
  - Dark Mode and Light Mode support with smooth theme toggle.
  - Fluid animations via React Native Reanimated.
  - In-app notification banners and offline alerts.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- Expo Go app on your physical iOS or Android phone (or Android Studio emulator / iOS Simulator)

### 2. Installation
```bash
npm install
```

### 3. API Configuration
The API endpoint is centrally managed in `config/api.ts`:
- **Development**: Automatically detects your LAN IP address when running via Expo Go, or connects to `localhost:5000` on Web / `10.0.2.2:5000` on Android emulator.
- **Production**: Points to your deployed cloud backend URL:
  ```ts
  export const PROD_API_URL = "https://eva-backend-d1nu.onrender.com/api";
  ```

### 4. Running Locally

- **Start Metro Bundler**:
  ```bash
  npx expo start
  ```
- **Run on Android device/emulator**: Press `a` or run:
  ```bash
  npm run android
  ```
- **Run on iOS simulator**: Press `i` or run:
  ```bash
  npm run ios
  ```
- **Run on Web browser**: Press `w` or run:
  ```bash
  npm run web
  ```

---

## Building the APK (Android)

Build standalone APKs for distribution using Expo Application Services (EAS):

1. **Install EAS CLI** (if not installed):
   ```bash
   npm install -g eas-cli
   ```
2. **Login to Expo**:
   ```bash
   eas login
   ```
3. **Build direct-downloadable APK**:
   ```bash
   eas build -p android --profile preview
   ```
   *EAS will generate a cloud build and provide a direct download link / QR code to install the `.apk` on any Android device.*

---

## Web Deployment (Vercel / Netlify)

1. **Export Web Bundle**:
   ```bash
   npx expo export -p web
   ```
2. The static web build is output to `dist/`.
3. In **Vercel** or **Netlify**:
   - **Framework Preset**: Other / None
   - **Build Command**: `npx expo export -p web`
   - **Output Directory**: `dist`
