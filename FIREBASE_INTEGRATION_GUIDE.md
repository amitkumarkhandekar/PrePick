# PrePick Firebase Integration - Setup Instructions

## ✅ COMPLETED:

1. **Firebase Configuration** 
   - Updated `firebase.js` to use Realtime Database
   - Created `authService.js` with signup/login functions
   - Created `databaseService.js` with all CRUD operations

2. **Authentication**
   - Created `Signup.jsx` component with email/password and Google signup
   - Updated `Login.jsx` to use real Firebase authentication
   - Renamed and updated `Auth.css` for both login and signup

## 🔧 NEXT STEPS TO COMPLETE:

### 1. Update Firebase Configuration
**File:** `src/config/firebase.js`
- Replace the dummy Firebase config with your actual project credentials
- Get credentials from: Firebase Console > Project Settings > General
- Make sure to enable Realtime Database in Firebase Console

### 2. Update App.jsx Routes
**File:** `src/App.jsx`
- Add route for `/signup`
- Import Signup component
- Update AppContext to use Firebase services instead of dummy data

### 3. Create CSV Upload Component
Create `src/components/CSVUpload.jsx`:
- File input for CSV
- CSV parser (use `papaparse` library: `npm install papaparse`)
- Validation and bulk upload to Firebase

### 4. Create Manual Product Entry Component  
Create `src/components/AddProductForm.jsx`:
- Form with fields: name, price, category, stock status
- Submit to Firebase using `addProduct` from databaseService

### 5. Update AppContext
**File:** `src/context/AppContext.jsx`
- Replace dummy data with Firebase real-time listeners
- Use `onAuthStateChanged` to track user login status
- Fetch user profile from database on login
- Use database service functions for all operations

### 6. Update Components to Use Firebase
Update these components:
- `CustomerShops.jsx` - Fetch shops from Firebase
- `ShopCatalog.jsx` - Fetch products from Firebase
- `Cart.jsx` - Save orders to Firebase
- `CustomerOrders.jsx` - Fetch user orders from Firebase
- `ShopDashboard.jsx` - Fetch shop orders, add catalog management

### 7. Add Shop Registration Flow
Create `src/pages/ShopRegistration.jsx`:
- Form to collect shop details
- Upload shop info to Firebase
- Set verified: false (admin approval needed)

## 📦 Required NPM Packages:

```bash
npm install papaparse
```

## 🔥 Firebase Setup Checklist:

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google
3. Enable Realtime Database:
   - Go to Realtime Database
   - Create database
   - Start in test mode (update rules later)
4. Get config:
   - Project Settings > General > Your apps
   - Copy config object
   - Update `src/config/firebase.js`

## 📝 Database Structure:

```
prepick-app/
├── users/
│   └── {userId}/
│       ├── uid
│       ├── email
│       ├── name
│       ├── role
│       ├── favorites[]
│       └── shopId (if shop owner)
├── shops/
│   └── {shopId}/
│       ├── id
│       ├── name
│       ├── category
│       ├── ownerId
│       ├── verified
│       ├── phone
│       ├── gpayNumber
│       ├── address
│       ├── location {lat, lng}
│       └── openingHours
├── products/
│   └── {shopId}/
│       └── {productId}/
│           ├── id
│           ├── shopId
│           ├── name
│           ├── price
│           ├── category
│           └── inStock
└── orders/
    └── {orderId}/
        ├── id
        ├── customerId
        ├── shopId
        ├── items[]
        ├── totalAmount
        ├── partialPayment
        ├── paymentStatus
        ├── orderStatus
        ├── readyBy
        ├── createdAt
        └── updatedAt
```

## 🔒 Firebase Security Rules (Basic):

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "shops": {
      ".read": true,
      "$shopId": {
        ".write": "auth != null && (data.child('ownerId').val() === auth.uid || !data.exists())"
      }
    },
    "products": {
      ".read": true,
      "$shopId": {
        ".write": "auth != null && root.child('shops').child($shopId).child('ownerId').val() === auth.uid"
      }
    },
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

Would you like me to continue with the remaining implementation?
