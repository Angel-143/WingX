# 🚀 WingX Food Delivery App - Deployment Guide

## URL Configuration for Production

Your new Render deployment URLs:
- **Backend:** https://wingx-backend.onrender.com
- **Frontend:** https://wingx-ufzv.onrender.com

## ✅ What's Been Updated

### 1. **Backend Configuration** (`backend/index.js`)
- ✅ CORS now accepts multiple origins (localhost + production)
- ✅ Uses `FRONTEND_URL` environment variable
- ✅ Supports both development and production environments

### 2. **Frontend Configuration** (`frontend/src/config/apiConfig.js`)
- ✅ Centralized API base URL configuration
- ✅ Automatically switches between dev and production URLs
- ✅ Used by all 24+ components and hooks

### 3. **Vite Config** (`frontend/vite.config.js`)
- ✅ Proxy uses environment variables
- ✅ Supports both dev and production builds

### 4. **Firebase Configuration** (`frontend/firebase.js`)
- ✅ All Firebase settings now use environment variables
- ✅ Fallbacks to default values if not specified

### 5. **Updated Files** (24 frontend files)
All now use `API_BASE_URL` from `config/apiConfig.js`:

**Dashboards (5):**
- ✅ deliveryboy_dashboard.jsx
- ✅ user_dashboard.jsx
- ✅ owner_dashboard.jsx
- ✅ navbar.jsx
- ✅ Food_Cart.jsx

**Hooks (6):**
- ✅ useUpdateDeliveryLocation.js
- ✅ useGetShopByCity.jsx
- ✅ useGetShop.jsx
- ✅ useGetItemByCity.jsx
- ✅ useGetmyShop.jsx
- ✅ getCurrentUser.jsx

**Pages (13):**
- ✅ add_Item.jsx, edit_item.jsx, delete_item.jsx
- ✅ createEditShop.jsx
- ✅ CheckOutPage.jsx
- ✅ DietSetupModal.jsx
- ✅ MealSuggestions.jsx
- ✅ myOrder.jsx
- ✅ MySubscriptions.jsx
- ✅ Nutritionscanner.jsx
- ✅ Scannercard.jsx
- ✅ Searchdrawer.jsx
- ✅ ShopDetailPage.jsx

---

## 📋 Setup Instructions

### For Local Development

#### 1. Backend Setup
```bash
cd backend
cp .env.development .env
```

Edit `.env` and fill in your development values:
```env
MONGODB_URL=mongodb://localhost:27017/wingx_food_delivery
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
# ... other credentials
```

#### 2. Frontend Setup
```bash
cd frontend
cp .env.development .env
```

Edit `.env` with your development values:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
VITE_FIREBASE_API_KEY=your_api_key
# ... other values
```

#### 3. Run Development Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

The frontend will automatically proxy API calls to `http://localhost:5000`

---

### For Production (Render Deployment)

#### 1. Backend on Render

Add these environment variables in Render Dashboard:
```
MONGODB_URL=your_mongodb_atlas_uri
PORT=5000
NODE_ENV=production
BACKEND_URL=https://wingx-backend.onrender.com
FRONTEND_URL=https://wingx-ufzv.onrender.com
JWT_SECRET=your_secure_secret_key
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
# ... other production credentials
```

#### 2. Frontend on Render

Create a `render.yaml` or add build environment variables:
```
VITE_BACKEND_URL=https://wingx-backend.onrender.com
VITE_FRONTEND_URL=https://wingx-ufzv.onrender.com
VITE_FIREBASE_API_KEY=your_api_key
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
# ... other production credentials
```

Build command:
```bash
npm install && npm run build
```

Start command: (if needed)
```bash
npm run preview
```

---

## 🔄 How It Works

### URL Resolution Priority

**Backend:**
1. Checks if running in production (`NODE_ENV=production`)
2. Uses `FRONTEND_URL` environment variable for CORS
3. Falls back to hardcoded production URLs if env vars not set

**Frontend:**
1. Detects if in development mode (`import.meta.env.MODE === 'development'`)
2. Uses `http://localhost:5000` for dev (via proxy)
3. Uses `VITE_BACKEND_URL` environment variable for production
4. Falls back to `https://wingx-backend.onrender.com` if env var not set

### Example Flow (Development)
```
User Action
  ↓
Frontend Component (e.g., ShopDetailPage.jsx)
  ↓
Uses: import { API_BASE_URL } from '../config/apiConfig.js'
  ↓
apiConfig.js detects: isDevelopment = true
  ↓
Returns: 'http://localhost:5000'
  ↓
Axios request sent to backend via proxy
  ↓
Response returned
```

### Example Flow (Production)
```
User Action
  ↓
Frontend Component
  ↓
Uses: import { API_BASE_URL } from '../config/apiConfig.js'
  ↓
apiConfig.js detects: isDevelopment = false
  ↓
Reads: import.meta.env.VITE_BACKEND_URL
  ↓
Returns: 'https://wingx-backend.onrender.com'
  ↓
Axios request sent directly to backend
  ↓
Response returned
```

---

## ✨ Key Features

1. **No More Hardcoded URLs** - Everything uses environment variables
2. **Auto-switching** - Automatically uses correct URLs based on environment
3. **CORS Configured** - Backend accepts requests from both dev and production URLs
4. **Fallback Values** - Works even if some env vars are missing
5. **Centralized Config** - Single source of truth: `frontend/src/config/apiConfig.js`

---

## 🛠️ Troubleshooting

### Issue: "Backend not found" or CORS error

**Solution:**
1. Check `.env` file has correct `BACKEND_URL`
2. Verify backend is running and accessible
3. Check backend CORS configuration in `backend/index.js`
4. For production, ensure Render URLs are correct and accessible

### Issue: Frontend returns 404 or "Cannot find module"

**Solution:**
1. Ensure `config/apiConfig.js` exists in `frontend/src/`
2. Check all imports use correct path: `import { API_BASE_URL } from '../config/apiConfig.js'`
3. Rebuild the frontend: `npm run build`

### Issue: Firebase not working

**Solution:**
1. Verify `VITE_FIREBASE_API_KEY` is set in `.env`
2. Check other Firebase config in `frontend/firebase.js`
3. Test Firebase config values are correct

---

## 📌 Important Notes

- ✅ **Always use `.env` file** - Don't commit it to git
- ✅ **Set production keys** - Use Razorpay live keys, not test keys, in production
- ✅ **Update MongoDB URI** - Use MongoDB Atlas for production
- ✅ **Strong JWT Secret** - Generate a secure random string for production
- ✅ **HTTPS only** - In production, always use HTTPS URLs
- ✅ **Environment-specific values** - Keep dev and prod values separate

---

## 🚀 Deployment Checklist

- [ ] Update `.env.production` with all production values
- [ ] Set environment variables in Render dashboard
- [ ] Test backend health check: curl `https://wingx-backend.onrender.com/`
- [ ] Verify CORS by testing API from frontend
- [ ] Test authentication flow (login, signup)
- [ ] Verify payment integration works
- [ ] Check all API endpoints respond correctly
- [ ] Monitor logs for any errors

---

## 📞 Quick Reference

**Development URLs:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

**Production URLs:**
- Backend: https://wingx-backend.onrender.com
- Frontend: https://wingx-ufzv.onrender.com

**Config Files:**
- Frontend: `frontend/src/config/apiConfig.js`
- Env files: `.env`, `.env.development`, `.env.production`
