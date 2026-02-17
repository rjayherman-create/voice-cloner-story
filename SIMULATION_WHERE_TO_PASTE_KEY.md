# 🎯 VISUAL SIMULATION - Where to Put Your API Key

## Here's What You'll See When You Run The Command

---

## STEP 1: Open PowerShell

```
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

PS C:\Users\YourName>
```

↓ Paste this command ↓
```
cd "C:\voice over system"; powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

Press Enter

---

## STEP 2: Setup Script Starts

You'll see this:

```
============================================
  Voice Over System - API Key Setup
============================================

This will securely add your ElevenLabs API key
Your key will NOT be displayed on screen

Get your API key from:
https://elevenlabs.io/account/api-keys

🔑 Enter your ElevenLabs API key (hidden): █████████████
                                            ↑ YOUR KEY HERE (shown as dots)
                                            ↑ Type or paste your key
```

---

## STEP 3: Where To Paste Your Key

**Your API key looks like this:**
```
sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

**When you paste it, you'll see dots:**
```
🔑 Enter your ElevenLabs API key (hidden): ••••••••••••••••••••••••••••••••••
```

**The dots represent your key** (so it stays private!)

---

## STEP 4: After Pasting Your Key

Press **Enter** (or **Return**)

```
🔑 Enter your ElevenLabs API key (hidden): ••••••••••••••••••••••••••••••••••
✓ API key received (length: 42 chars)

Confirm you want to save this API key? (yes/no): █
                                                  ↑ Type "yes" here
```

---

## STEP 5: Confirm Setup

Type: `yes` and press Enter

```
Confirm you want to save this API key? (yes/no): yes
```

---

## STEP 6: Success!

You'll see:

```
✅ API key saved successfully!

Next steps:

1. Restart the server:
   npm start

2. Open your browser:
   http://localhost:5001

3. Start creating voiceovers! 🎉
```

---

## 📋 COMPLETE VISUAL FLOW

```
PowerShell Window:
═════════════════════════════════════════════════════════════

PS C:\Users\YourName> cd "C:\voice over system"; powershell -ExecutionPolicy Bypass -File setup-api-key.ps1

[Script loads...]

============================================
  Voice Over System - API Key Setup
============================================

This will securely add your ElevenLabs API key
Your key will NOT be displayed on screen

Get your API key from:
https://elevenlabs.io/account/api-keys

🔑 Enter your ElevenLabs API key (hidden): ••••••••••••••••••••••••••••••••••
                                           ↑
                                    YOU PASTE HERE
                                    (shown as dots)

✓ API key received (length: 42 chars)

Confirm you want to save this API key? (yes/no): yes
                                                  ↑
                                        TYPE "yes" HERE

✅ API key saved successfully!

Next steps:

1. Restart the server:
   npm start

2. Open your browser:
   http://localhost:5001

3. Start creating voiceovers! 🎉

═════════════════════════════════════════════════════════════
```

---

## 🎯 WHAT YOUR KEY LOOKS LIKE

Your ElevenLabs API key will be something like:

```
sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

**Location to find it:**
1. Go to: https://elevenlabs.io/account/api-keys
2. Login to your account
3. Look for a box that says something like:
   ```
   ┌─────────────────────────────────────┐
   │ API Key                             │
   │ sk_1a2b3c4d5e6f7g8h...              │
   │ [Copy] [Hide]                       │
   └─────────────────────────────────────┘
   ```
4. Click **[Copy]** button
5. Go back to PowerShell
6. Right-click and paste (Ctrl+V)

---

## 🔐 YOUR KEY IS SAFE

When you paste it:
- ✅ Shows as dots on screen (••••••)
- ✅ Never printed to terminal
- ✅ Never logged anywhere
- ✅ Only saved to `.env` file (local)
- ✅ `.env` is gitignored (private)
- ✅ No exposure to anyone

---

## 📝 STEP-BY-STEP CHECKLIST

- [ ] Open PowerShell
- [ ] Get your API key from https://elevenlabs.io/account/api-keys
- [ ] Copy the key
- [ ] Paste this in PowerShell:
  ```
  cd "C:\voice over system"; powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
  ```
- [ ] Press Enter
- [ ] Right-click and paste your key (shows as dots)
- [ ] Press Enter
- [ ] Type "yes"
- [ ] Press Enter
- [ ] See "✅ API key saved successfully!"
- [ ] Done! ✅

---

## ❓ IF YOU GET STUCK

**Q: Where do I paste my key?**
A: At this prompt:
```
🔑 Enter your ElevenLabs API key (hidden): █
                                            ↑ Paste here
```

**Q: Why do I only see dots?**
A: Your key is hidden for privacy! The dots represent your full key.

**Q: How do I paste in PowerShell?**
A: Right-click and select "Paste" (or Ctrl+V)

**Q: What if I make a mistake?**
A: Press Ctrl+C to cancel and run the command again.

**Q: Where is my key stored?**
A: In `.env` file in `C:\voice over system\` folder

---

## 🚀 AFTER SETUP

Once you see the success message:

1. **Restart server:**
   ```bash
   npm start
   ```

2. **Open browser:**
   ```
   http://localhost:5001
   ```

3. **Start creating voiceovers!** 🎉

---

**You've got this!** Copy the command, paste your key, confirm with "yes", and you're done! ✅
