# 🚀 How to Start Your Backend Server

Follow these steps exactly to get your website's backend running.

### Step 1: Restart VS Code
**This is critical.** After installing Node.js, VS Code doesn't know about it until you restart.
1.  Close this VS Code window completely.
2.  Open VS Code again.
3.  Open your project folder (`Antigravity`).

### Step 2: Open the Terminal
1.  In the top menu, click **Terminal** > **New Terminal**.
2.  (Or press `Ctrl` + `~` key).

### Step 3: Verify Installation
Type the following command in the terminal and press Enter:
```powershell
node -v
```
*   ✅ **Success**: You see a version number (like `v20.11.0`).
*   ❌ **Failure**: You see "term is not recognized". **Re-install Node.js** and make sure to check "Add to PATH" during installation.

### Step 4: Install Dependencies (First Time Only)
Copy and paste this command to install the required libraries:
```powershell
npm install express cors body-parser
```

### Step 5: Start the Server
Run this command to start your backend:
```powershell
node server.js
```

### 🎉 You are done!
You should see:
> `Server running on http://localhost:3000`
> `Database file: ...\database.json`

**keep this terminal open** while you test your website. If you close it, the backend turns off.
