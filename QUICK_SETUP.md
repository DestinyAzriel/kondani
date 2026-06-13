# 🚀 QUICK SETUP GUIDE
## Get Kondani Running in 5 Minutes

---

## 📋 PREREQUISITES

1. **Cloudinary Account** (Free tier)
   - Sign up: https://cloudinary.com/users/register/free
   - Get your: Cloud Name, Upload Preset

2. **MongoDB Atlas** (Already setup ✅)

---

## ⚡ SETUP STEPS

### **1. Frontend Environment** (`vue-project/.env`)

Create `d:\kondani\vue-project\.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=kondani_photos
```

### **2. Backend Environment** (`backend/.env`)

Already exists, verify it has:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
TERMII_API_KEY=your_termii_key
```

### **3. Cloudinary Setup**

1. Login to Cloudinary
2. Go to Settings → Upload
3. Create Upload Preset:
   - Name: `kondani_photos`
   - Signing Mode: **Unsigned**
   - Folder: `kondani/profiles`
   - Save

### **4. Install Missing Dependencies**

```bash
cd d:\kondani\backend
npm install multer

cd d:\kondani\vue-project
npm install axios
```

### **5. Start Servers**

**Terminal 1 - Backend**:
```bash
cd d:\kondani\backend
npm start
```

**Terminal 2 - Frontend**:
```bash
cd d:\kondani\vue-project
npm run dev
```

---

## ✅ VERIFICATION

1. Open http://localhost:5173
2. Login/Register
3. Go to Profile → Edit
4. Try uploading a photo
5. Check Daily Picks page: http://localhost:5173/daily-picks

---

## 🎯 WHAT'S WORKING NOW

✅ Photo Upload (with Cloudinary)
✅ Activity Status (real-time)
✅ Daily Picks (AI-powered)
✅ Profile Prompts (backend ready)
✅ Voice Recording (frontend ready)

---

## 📝 NEXT STEPS

1. Test photo upload
2. Test Daily Picks
3. Add profile prompts UI
4. Add voice recorder UI
5. Beta test with real users

---

**Estimated Setup Time**: 5-10 minutes
**Ready to Launch**: 2-3 weeks
