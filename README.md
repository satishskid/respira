# Prana Flow - AI Breathing Coach

A medical-grade, privacy-first breathing and walking coach powered by Google Gemini Live API and Firebase.

## 🚀 Quick Start (IDE)

If you are using **Cursor**, **Windsurf**, or **VS Code** with Copilot:

1.  **Install Dependencies**:
    Open the terminal in your IDE and run:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    *   **Firebase**: Open `constants.ts` and ensure your `FIREBASE_CONFIG` is pasted there.
    *   **Gemini API**: Create a file named `.env` in the root directory (optional for local dev, but mandatory for the live connection):
        ```env
        API_KEY=your_gemini_api_key_here
        ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Click the `localhost` link provided in the terminal.

---

## 🌍 How to Deploy to Netlify (No Fuss)

This project is configured for a 1-click deployment using **Netlify**.

### Step 1: Push to GitHub
1.  Initialize a git repo: `git init`
2.  Add files: `git add .`
3.  Commit: `git commit -m "Initial commit"`
4.  Push to a new repository on your GitHub account.

### Step 2: Import to Netlify
1.  Log in to [Netlify](https://app.netlify.com/).
2.  Click **"Add new site"** -> **"Import from an existing project"**.
3.  Select **GitHub** and choose your `prana-flow` repository.

### Step 3: Configure Build (Should be Auto-detected)
Netlify reads the `netlify.toml` file included in this project, so it should automatically set:
*   **Build Command**: `npm run build`
*   **Publish directory**: `dist`

### Step 4: Add Environment Variables (CRITICAL)
Before clicking "Deploy", or immediately after:
1.  Go to **Site Settings** > **Configuration** > **Environment variables**.
2.  Click **Add variable**.
3.  Key: `API_KEY`
4.  Value: `your_google_gemini_api_key`
5.  Save.

*Note: Without this key, the AI connection will fail in production.*

### Step 5: Firebase Domain Whitelist
Once your site is live (e.g., `https://prana-flow-app.netlify.app`):
1.  Go to your **Firebase Console**.
2.  Navigate to **Authentication** > **Settings** > **Authorized Domains**.
3.  Add your new Netlify domain (e.g., `prana-flow-app.netlify.app`).
4.  **Wait 1-2 minutes** for propagation.
5.  Sign in!

---

## 📱 PWA (Progressive Web App)

This app is installable.
1.  **HTTPS Required**: Netlify provides this automatically.
2.  **Install**: On Android/Chrome, click the "Install App" button in the header. On iOS, tap "Share" -> "Add to Home Screen".

## 🛠 Tech Stack

*   **Framework**: React 18 + TypeScript + Vite
*   **AI**: Google GenAI SDK (`native-audio-preview`)
*   **Auth**: Firebase Auth (Google Sign-In)
*   **Storage**: IndexedDB (Client-side privacy)
*   **Styling**: Tailwind CSS