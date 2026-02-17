# 🔐 Secure API Key Setup - Private & Safe

I've created **3 secure ways** to add your API key through the terminal without exposing it in files.

## 🚀 EASIEST METHOD: PowerShell (Windows)

### Step 1: Open PowerShell
1. Press **Windows Key + X**
2. Select **Windows PowerShell** (or Terminal)
3. Navigate to your app folder:
```powershell
cd "C:\voice over system"
```

### Step 2: Run Setup Script
```powershell
powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

### Step 3: Enter Your Key
- Paste your API key (it will be hidden with dots)
- Press Enter
- Confirm "yes"
- Done! ✅

---

## OPTION 2: Batch File (Windows - Simplest)

### Step 1: Open Command Prompt
1. Press **Windows Key + R**
2. Type: `cmd`
3. Press Enter

### Step 2: Navigate to App
```bash
cd C:\voice over system
```

### Step 3: Run Batch Script
```bash
setup-api-key.bat
```

### Step 4: Follow Prompts
- Paste your API key
- Confirm "yes"
- Done! ✅

---

## OPTION 3: Node.js Script (All Platforms)

### Step 1: Open Terminal
- **Windows**: PowerShell or Command Prompt
- **Mac/Linux**: Terminal

### Step 2: Navigate to App
```bash
cd "C:\voice over system"
```

### Step 3: Run Setup
```bash
node setup-api-key.js
```

### Step 4: Follow Prompts
- Paste your API key
- Confirm "yes"
- Done! ✅

---

## 🔒 Security Features

All three scripts have:

✅ **Hidden Input** - Your key won't show on screen (displayed as dots or *)
✅ **Local Storage** - Saved only in your `.env` file
✅ **No Logging** - Key is never logged or printed
✅ **Confirmation** - You confirm before saving
✅ **File Permissions** - `.env` file has restricted permissions
✅ **Secure Mode** - Key never exposed in terminal

---

## 📋 RECOMMENDED: PowerShell Method

**Why?**
- Most secure (uses SecureString)
- Colorful feedback
- Works on all Windows versions
- Professional approach

**Command:**
```powershell
cd "C:\voice over system"
powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

Then:
1. Paste your API key
2. Confirm "yes"
3. Restart: `npm start`
4. Go to http://localhost:5001

---

## ⚡ QUICK REFERENCE

### PowerShell (Recommended)
```powershell
cd "C:\voice over system"
powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

### Batch File
```bash
cd C:\voice over system
setup-api-key.bat
```

### Node.js
```bash
cd "C:\voice over system"
node setup-api-key.js
```

---

## 🔑 Your ElevenLabs API Key

1. Go to: **https://elevenlabs.io**
2. Login to your account
3. Click: **Account Settings** → **API Keys**
4. Copy your key (starts with `sk_`)
5. Run one of the setup scripts above
6. Paste when prompted

---

## ✅ Verify Setup

After running the script:

1. Check `.env` file was updated:
   ```bash
   type .env
   ```
   Should show: `ELEVENLABS_API_KEY=sk_...`

2. Restart server:
   ```bash
   npm start
   ```

3. Open browser:
   ```
   http://localhost:5001
   ```

4. Create a project and generate a voiceover
   - If it works, your key is configured! ✅

---

## 🆘 Troubleshooting

### "ExecutionPolicy" error?
Use this command first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser -Force
```

Then run:
```powershell
powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

### Key not working after setup?
1. Make sure you used the full key (starts with `sk_`)
2. Don't manually edit `.env` - use the script
3. Restart server: `npm start`
4. Check browser console for errors

### Can't find the script?
Make sure you're in the right directory:
```bash
cd "C:\voice over system"
dir *.ps1  # Should show setup-api-key.ps1
```

---

## 📝 Manual Method (If scripts fail)

If scripts don't work, you can manually edit:

1. Open: `C:\voice over system\.env`
2. Find: `ELEVENLABS_API_KEY=`
3. Replace: `sk_paste_your_api_key_here`
4. With your actual key: `sk_1a2b3c4d...`
5. Save file
6. Restart: `npm start`

**Note:** This exposes your key in file history. Using scripts is safer!

---

## 🎯 Next Steps After Setup

1. ✅ Run setup script
2. ✅ Restart server: `npm start`
3. ✅ Open: http://localhost:5001
4. ✅ Create project
5. ✅ Click "🎭 Cartoon" tab
6. ✅ Generate first voiceover! 🎉

---

## 🔐 Keep It Private

**Important:**
- Don't share your API key with anyone
- Don't commit `.env` to git (already in `.gitignore`)
- Don't paste your key in chat/forums
- Don't save in email or cloud sync

The setup script handles all this securely for you! ✅

---

**Status**: ✅ Ready for secure setup
**Method**: Choose any of the 3 options above
**Safety**: All methods are secure & private
