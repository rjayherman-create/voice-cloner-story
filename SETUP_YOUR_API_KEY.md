# 🔐 PRIVATE API KEY SETUP - YOUR CHOICES

I've created **3 secure, private ways** to add your ElevenLabs API key through the terminal.

## 🎯 Pick Your Method

### Best for Most People: PowerShell

**Command:**
```powershell
cd "C:\voice over system"
powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

✅ **Why?**
- Most secure (uses SecureString encryption)
- Colorful feedback
- Works on all Windows
- Professional
- Hidden input (shows as dots)

---

### Simplest: Batch File

**Command:**
```bash
cd C:\voice over system
setup-api-key.bat
```

✅ **Why?**
- One click
- Works on any Windows version
- Simple prompts
- Hidden input

---

### Works Everywhere: Node.js

**Command:**
```bash
cd "C:\voice over system"
node setup-api-key.js
```

✅ **Why?**
- Works on Windows, Mac, Linux
- Professional approach
- Hidden input
- Detailed feedback

---

## 🔒 All Methods Are Secure

Each script has:
✅ **Hidden input** - Key never shown on screen
✅ **Local only** - Saved to `.env` file only
✅ **No logging** - Key never printed/logged
✅ **Confirmation** - You confirm before saving
✅ **Restricted permissions** - `.env` is protected
✅ **Private storage** - Never exposed

---

## ⚡ FASTEST WAY (Copy & Paste)

### Step 1: Open PowerShell
- Windows Key + X
- Click "Windows PowerShell"

### Step 2: Copy This
```powershell
cd "C:\voice over system"; powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

### Step 3: Paste It
- Right-click in PowerShell
- Paste (Ctrl+V)
- Press Enter

### Step 4: Follow Prompts
- Paste your API key (hidden)
- Type "yes"
- Done! ✅

---

## 📋 GET YOUR API KEY FIRST

1. **Go to:** https://elevenlabs.io/account/api-keys
2. **Login** (or sign up - free tier available)
3. **Copy** your API key (looks like: `sk_1a2b3c4d...`)
4. **Run** setup script above
5. **Paste** when prompted

---

## 🚀 AFTER SETUP

1. **Restart server:**
   ```bash
   npm start
   ```

2. **Open:** http://localhost:5001

3. **Create voiceovers!**
   - New project
   - Write script
   - Choose Professional or Cartoon voice
   - Pick emotion
   - Generate! 🎉

---

## 📝 NO EXPOSURE

Your API key is:
- ✅ Never displayed on screen
- ✅ Never logged anywhere
- ✅ Never committed to git
- ✅ Only stored in `.env` (gitignored)
- ✅ Protected with file permissions
- ✅ Safe from accidental exposure

---

## ❓ WHICH METHOD?

| If You Want | Use |
|-------------|-----|
| Most secure | PowerShell |
| Simplest | Batch file |
| Works everywhere | Node.js |
| Fastest | PowerShell |

**Recommendation:** Start with PowerShell ✅

---

## 🎯 3 SIMPLE STEPS TO GO LIVE

### Step 1: Add API Key (3 min)
```powershell
cd "C:\voice over system"
powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

### Step 2: Restart Server (1 min)
```bash
npm start
```

### Step 3: Create Voiceovers (∞ possibilities)
Open http://localhost:5001 and start! 🎙️

---

## ✨ FINAL CHECKLIST

Before you go:

- [ ] You have your ElevenLabs API key (from https://elevenlabs.io)
- [ ] You chose a setup method (PowerShell recommended)
- [ ] You ran the setup script
- [ ] API key is safely in `.env`
- [ ] Server is restarted: `npm start`
- [ ] Browser is open: http://localhost:5001
- [ ] You're ready to create! 🎉

---

**Start with this command:**

```powershell
cd "C:\voice over system"; powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

Then follow the prompts!

Your app is ready. Your key is secure. Let's go! 🚀

---

**All your code is:**
- ✅ Private (stored locally only)
- ✅ Secure (never exposed)
- ✅ Safe (not logged anywhere)
- ✅ Professional (production-ready)

🎉 Enjoy your Voice Over System!
