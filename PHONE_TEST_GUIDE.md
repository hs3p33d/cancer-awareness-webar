# 🎗️ Cancer Awareness WebAR — Phone Quickstart Guide

This guide contains the direct QR code and step-by-step instructions for testing the live campaign on your physical phone (iOS Safari or Android Chrome).

---

## 📱 Scan to Open on Your Phone

Scan this QR code with your phone's default Camera app:

<div align="center">
  <img src="public/qr/qr-live-workers-dev.png" width="320" alt="Cancer Awareness WebAR QR Code" />
  <p><strong>Direct Link:</strong> <a href="https://cancer-awareness-webar.deepesh-gandhi28.workers.dev">https://cancer-awareness-webar.deepesh-gandhi28.workers.dev</a></p>
</div>

```text
 ▄▄▄▄▄▄▄       ▄ ▄ ▄▄▄ ▄▄  ▄▄▄▄▄▄▄ 
 █ ▄▄▄ █ ▄▄▀▄  ▄█▀  ▄▄█▄   █ ▄▄▄ █ 
 █ ███ █ █▄ ▄▄ ▄█▄▀ █▄▄▄▄▀ █ ███ █ 
 █▄▄▄▄▄█ █ ▄ █▀▄ ▄ ▄ █ ▄ █ █▄▄▄▄▄█ 
 ▄ ▄▄▄▄▄ ▀███ ▄  ▀▄ █ ▀ ▄█ ▄▄▄▄▄   
  █▀ ▀▄▄█▄▄▄█▀█▄▄▀▄▄▀█▀ ▀ ▄█▀▄▀█▄▀ 
  ▄▄█▀▄▄█ ▀▄▀▄▀▄▄ ▄▀ ▀▀ ▀██ ▄██▀█  
 ▄ ▀▀▄█▄ █   ▄  █ ▄▄▀▀▄█▀▄▄██ ███▀ 
 ██▀▄ █▄█▄ ▄ ▀▀█▄▀▄ ▀ ▀█ ▄█▀███▀ ▄ 
   ▄█▄▄▄█▄▀ ▄▀ ▄▄█▄▄▀▀▄ ▀▄▄▀█▄▀█▄▀ 
   ▀▄█▀▄▀█ ██ ▄▀██▄▄▀▄▀ █▄█▀███▀▄  
 █▀▀▀▄▄▄█ ▀▀▀██▀▄█▄█▀██ ▀▄ ▀ ▄ █▄▀ 
 █  ▀█▀▄███▄█▄ ▄█▀▄▄██▀██▄███▄▀▀▀█ 
 ▄▄▄▄▄▄▄ ▀ ▀███▄▄██▀▀█ █▄█ ▄ █ █▄▀ 
 █ ▄▄▄ █ █  █ ▀▄▄▀▄▀  ▀▄▀█▄▄▄██▀▄█ 
 █ ███ █ ██▀▀▀ █▄▀▀▀▀█▀█▀█▀▄▄▀██▀▀ 
 █▄▄▄▄▄█ ▄▄  █▄▀██▄ ▀▀▀█▄▄▄ ▄▀█▀▄  
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

---

## 📋 Step-by-Step Instructions

### Step 1: Scan & Open
1. Open your phone's default **Camera app** (iOS Safari or Android Chrome).
2. Point your camera at the QR code above.
3. Tap the yellow/blue banner that pops up to open the link in Safari or Chrome.

### Step 2: Grant Camera Permission
1. On the landing screen, tap the glowing button: **"Begin Awareness Experience"**.
2. When your mobile browser prompts you:
   - iOS: Tap **"Allow"**
   - Android: Tap **"While using the app"** or **"Allow"**
3. Your live camera reflection will immediately appear on screen with zero lag or black screens.

### Step 3: Align Your Face
1. Hold your phone at eye level so your face is centered inside the frame.
2. The HUD at the top will confirm: `Detected (1 face)`.
3. Tap **"Begin Awareness Experience"** at the bottom of the camera view.

### Step 4: The Awareness Transformation
1. You will see a brief empathetic message: *"See yourself through the eyes of someone fighting cancer."*
2. The hair-loss simulation will smoothly and respectfully fade onto your reflection, preserving your identity, eyebrows, and facial features.
3. A limitation disclaimer will appear below clarifying that hair loss is caused by treatments, not all cancers.

### Step 5: Explore Prevention & Commit
1. Tap **"Capture Photo"** to save your awareness portrait, or tap **"What You Can Do"**.
2. Explore the **Cancer Prevention & Early-Detection Guide**:
   - 10 Key Risk Factors
   - 6 Lifestyle Prevention Steps
   - 9 Early Warning Signs
   - Interactive Personal Health Commitment Tracker

---

## ❓ Frequently Asked Questions

### Do we need to push code every time we make a change?
- **For the Live URL (`workers.dev`):** **YES**. Cloudflare deploys automatically from GitHub. Whenever you want your changes to be live for anyone scanning the QR code, pushing to GitHub triggers an automatic 45-second build and release.
- **For Local Wi-Fi Testing:** **NO**. If you run `npm run dev:https`, you can edit code on your computer and your phone will update instantly without pushing!

### Where are the high-res QR files saved for printing?
- PNG (High Contrast, 1024x1024): `public/qr/qr-live-workers-dev.png`
- Vector SVG (Infinitely scalable for T-shirts & posters): `public/qr/qr-live-workers-dev.svg`
