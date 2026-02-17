# 🎯 VISUAL DIAGRAM - Exactly Where to Paste

## THE EXACT MOMENT YOU PASTE YOUR KEY

```
╔════════════════════════════════════════════════════════════════╗
║                    PowerShell Window                          ║
║════════════════════════════════════════════════════════════════║
║                                                                ║
║  PS C:\voice over system>                                    ║
║                                                                ║
║  ✅ Setup script started...                                   ║
║                                                                ║
║  ============================================                 ║
║    Voice Over System - API Key Setup                         ║
║  ============================================                 ║
║                                                                ║
║  This will securely add your ElevenLabs API key              ║
║  Your key will NOT be displayed on screen                    ║
║                                                                ║
║  Get your API key from:                                      ║
║  https://elevenlabs.io/account/api-keys                      ║
║                                                                ║
║  🔑 Enter your ElevenLabs API key (hidden):                  ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ← PASTE YOUR KEY HERE!   ║
║     ^                                                          ║
║     |                                                          ║
║     This is where you right-click and paste                  ║
║     your API key. It will show as dots (•••)                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## YOUR ACTUAL API KEY

**Location:** https://elevenlabs.io/account/api-keys

**Looks like:**
```
┌─────────────────────────────────────────────┐
│  Your API Key:                              │
│  sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p       │
│  [Copy] [Hide] [Delete]                     │
└─────────────────────────────────────────────┘
```

**Steps:**
1. Click the **[Copy]** button
2. Your key is now in your clipboard
3. Go back to PowerShell
4. Right-click in the input field
5. Select Paste (or Ctrl+V)

---

## WHAT YOU'LL SEE

### Before Pasting:
```
🔑 Enter your ElevenLabs API key (hidden): _
                                            ↑ Cursor waiting
```

### While Pasting:
```
🔑 Enter your ElevenLabs API key (hidden): ••••••••••••••••••••••••••••••••••
```

### After Pressing Enter:
```
🔑 Enter your ElevenLabs API key (hidden): ••••••••••••••••••••••••••••••••••
✓ API key received (length: 42 chars)

Confirm you want to save this API key? (yes/no): _
```

---

## COMPLETE VISUAL WALKTHROUGH

### Step 1️⃣ - Open PowerShell
```
Windows Start Menu
    ↓
Type: PowerShell
    ↓
Click: Windows PowerShell
```

### Step 2️⃣ - Paste This Command
```
cd "C:\voice over system"; powershell -ExecutionPolicy Bypass -File setup-api-key.ps1
```

Right-click → Paste (or Ctrl+V)

Press: **Enter** ⏎

### Step 3️⃣ - See The Prompt
```
╔════════════════════════════════════════════╗
║ 🔑 Enter your ElevenLabs API key (hidden): ║
║                                     ______  ║
║                                     cursor  ║
╚════════════════════════════════════════════╝
```

### Step 4️⃣ - Get Your Key Ready
Go to: https://elevenlabs.io/account/api-keys

Find and **Copy** your key:
```
sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
     ↓ (copied to clipboard)
```

### Step 5️⃣ - Paste Into PowerShell
Right-click in PowerShell window
Select: **Paste** (or Ctrl+V)

```
╔════════════════════════════════════════════════════╗
║ 🔑 Enter your ElevenLabs API key (hidden):       ║
║ ••••••••••••••••••••••••••••••••••••              ║
║ ↑ Your key now showing as dots (private!)        ║
╚════════════════════════════════════════════════════╝
```

### Step 6️⃣ - Confirm
Press: **Enter** ⏎

```
✓ API key received (length: 42 chars)

Confirm you want to save this API key? (yes/no): _
                                                  ↑ cursor here
```

Type: `yes` + **Enter** ⏎

### Step 7️⃣ - Success!
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

## THE EXACT MOMENT (DETAILED)

### ❌ WRONG - Don't Type Your Key
```
🔑 Enter your ElevenLabs API key (hidden): sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
❌ This is visible - NOT SAFE!
```

### ✅ RIGHT - Paste Your Key (Shows as Dots)
```
🔑 Enter your ElevenLabs API key (hidden): ••••••••••••••••••••••••••••••••••
✅ Dots hide your key - SAFE!
```

---

## QUICK REFERENCE BOX

```
╔═══════════════════════════════════════════════════════════╗
║              WHERE TO PASTE YOUR API KEY                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  When you see this prompt:                              ║
║  ───────────────────────────────────────────────────── ║
║  🔑 Enter your ElevenLabs API key (hidden):             ║
║                                                           ║
║  👉 RIGHT-CLICK and PASTE your key HERE 👈             ║
║                                                           ║
║  The key will show as dots: ••••••••••                  ║
║                                                           ║
║  Then press: ENTER                                       ║
║  Then type: yes                                          ║
║  Then press: ENTER                                       ║
║                                                           ║
║  Done! ✅                                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 YOUR API KEY CHECKLIST

Before you start:

- [ ] Go to https://elevenlabs.io/account/api-keys
- [ ] Login to your account
- [ ] Find your API key (starts with `sk_`)
- [ ] Click the **[Copy]** button
- [ ] Open PowerShell
- [ ] Paste the setup command
- [ ] Press Enter
- [ ] Right-click and paste your API key
- [ ] Press Enter
- [ ] Type "yes"
- [ ] Press Enter
- [ ] See success message ✅

---

## 🎯 FINAL ANSWER TO "WHERE DO I PUT MY KEY?"

**Answer:** At this exact line when the script asks:

```
🔑 Enter your ElevenLabs API key (hidden): █
                                            ↑
                                  PASTE YOUR KEY HERE
                                  Right-click to paste
                                  Will show as dots
                                  Press Enter when done
```

---

**That's it! You've got this!** 🚀
