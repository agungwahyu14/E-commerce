# 🛒 Ecommerce App — Full Stack Mobile & Admin Panel

A full-stack e-commerce solution built with React Native (Expo) for mobile, Node.js + Express for the backend API, and a built-in HTML/CSS/JS admin panel — all in one monorepo.

---

## 📱 Screenshots

<img width="329" height="673" alt="image" src="https://github.com/user-attachments/assets/4592e217-f69a-4ada-be35-f23c39e8da62" />


---

## ✨ Features

### 🛍️ Mobile App (React Native)
- 🔐 JWT Authentication (Register, Login, Logout)
- 🏠 Home Screen with product categories, featured products, and search
- 🔍 Advanced search with filters (category, price range, sort)
- 📦 Product detail with wishlist and add to cart
- 🛒 Cart management with quantity control
- 💳 Checkout with Midtrans Snap payment gateway
- 📋 Order management with real-time status tracking
- ❤️ Wishlist management
- 👤 Profile with edit profile and avatar upload
- 🔒 Change password
- 🤖 Rules-based chatbot assistant
- 🔔 Session expired handling with custom modal
- 📄 Privacy Policy & Terms and Conditions
- 🌙 Custom modal system (no native Alert)

### ⚙️ Backend API (Node.js + Express)
- 🔑 JWT Authentication with bcrypt password hashing
- 🗄️ MySQL database with Sequelize ORM
- 📦 Product management with categories and stock control
- 🛍️ Order management with status transitions
- 💳 Midtrans Snap payment integration with webhook
- 🔄 Automatic order status sync with Midtrans
- 📁 File upload with Multer + Sharp image processing
- 🤖 Dynamic chatbot rules engine (database-driven)
- 📊 Admin dashboard statistics
- 🔒 Role-based access control (customer/admin)
- 📝 Structured API logging

### 🖥️ Admin Panel (HTML + Vanilla JS)
- 📊 Dashboard with revenue chart and statistics
- 📦 Product management (CRUD)
- 🛍️ Order management with status update
- 👥 User management with role control
- 💳 Transaction monitoring with Midtrans sync
- 🤖 Chatbot rules management with live testing
- 🔐 Admin authentication with session management

---

## 🏗️ Project Structure

```
ecommerce-project/
├── ecommerce-api/                 ← Backend API + Admin Panel
│   ├── public/
│   │   ├── admin/                 ← Admin Panel UI
│   │   │   ├── index.html
│   │   │   ├── css/style.css
│   │   │   └── js/
│   │   │       ├── app.js
│   │   │       ├── auth.js
│   │   │       └── pages/
│   │   └── uploads/avatars/       ← User avatar storage
│   └── src/
│       ├── config/
│       │   ├── database.js
│       │   ├── midtrans.js
│       │   ├── multer.js
│       │   └── seed.js
│       ├── controllers/
│       │   ├── admin/
│       │   │   ├── dashboardController.js
│       │   │   ├── productAdminController.js
│       │   │   ├── orderAdminController.js
│       │   │   ├── userAdminController.js
│       │   │   ├── transactionAdminController.js
│       │   │   └── chatbotAdminController.js
│       │   ├── authController.js
│       │   ├── productController.js
│       │   ├── orderController.js
│       │   ├── checkoutController.js
│       │   ├── profileController.js
│       │   ├── chatbotController.js
│       │   └── helpController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── adminMiddleware.js
│       │   ├── errorMiddleware.js
│       │   └── validateMiddleware.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Product.js
│       │   ├── Order.js
│       │   ├── OrderItem.js
│       │   ├── PaymentMethod.js
│       │   └── ChatbotRule.js
│       ├── routes/
│       │   ├── admin/
│       │   ├── authRoutes.js
│       │   ├── productRoutes.js
│       │   ├── orderRoutes.js
│       │   ├── checkoutRoutes.js
│       │   ├── profileRoutes.js
│       │   └── chatbotRoutes.js
│       └── utils/
│           ├── response.js
│           └── jwt.js
│
└── EcommerceApp/                  ← React Native Mobile App
    └── src/
        ├── components/
        │   ├── common/
        │   │   └── AppModal.jsx
        │   ├── ProductCard.jsx
        │   ├── OrderCard.jsx
        │   ├── SkeletonLoader.jsx
        │   └── EmptyState.jsx
        ├── constants/
        │   ├── colors.js
        │   └── config.js
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── CartContext.jsx
        │   ├── WishlistContext.jsx
        │   └── ModalContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useAppModal.js
        ├── navigation/
        │   ├── RootNavigator.jsx
        │   ├── AuthNavigator.jsx
        │   └── MainNavigator.jsx
        ├── screens/
        │   ├── auth/
        │   │   ├── LoginScreen.jsx
        │   │   └── RegisterScreen.jsx
        │   ├── main/
        │   │   ├── HomeScreen.jsx
        │   │   ├── SearchScreen.jsx
        │   │   ├── ProductDetailScreen.jsx
        │   │   ├── ProductListScreen.jsx
        │   │   ├── CartScreen.jsx
        │   │   ├── CheckoutScreen.jsx
        │   │   ├── MyOrdersScreen.jsx
        │   │   ├── OrderDetailScreen.jsx
        │   │   ├── ProfileScreen.jsx
        │   │   ├── EditProfileScreen.jsx
        │   │   ├── WishlistScreen.jsx
        │   │   ├── PaymentMethodScreen.jsx
        │   │   ├── HelpCenterScreen.jsx
        │   │   └── ChatbotScreen.jsx
        │   ├── payment/
        │   │   ├── MidtransPaymentScreen.jsx
        │   │   ├── PaymentSuccessScreen.jsx
        │   │   ├── PaymentPendingScreen.jsx
        │   │   └── PaymentFailedScreen.jsx
        │   └── settings/
        │       ├── SettingsScreen.jsx
        │       ├── ChangePasswordScreen.jsx
        │       ├── PrivacyPolicyScreen.jsx
        │       └── TermsScreen.jsx
        ├── services/
        │   ├── authService.js
        │   ├── productService.js
        │   ├── orderService.js
        │   ├── checkoutService.js
        │   ├── profileService.js
        │   ├── searchService.js
        │   ├── chatbotService.js
        │   └── helpService.js
        └── utils/
            ├── api.js
            └── logger.js
```

---

## 🛠️ Tech Stack

### Mobile App
| Category | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |
| State Management | React Context API |
| Data Fetching | Axios + TanStack React Query |
| Local Storage | AsyncStorage |
| Payment | Midtrans Snap (WebView) |
| UI Components | Custom components + Ionicons |

### Backend API
| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL + Sequelize ORM |
| Authentication | JWT + bcryptjs |
| Payment | Midtrans Node Client |
| File Upload | Multer + Sharp |
| Logging | Morgan + Custom Logger |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Expo CLI
- Expo Go app or Development Build
- Midtrans Sandbox account — [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com)
- ngrok (for Midtrans webhook testing) — [ngrok.com](https://ngrok.com)

---

## ⚙️ Backend Setup

### 1 — Clone & Install
```bash
cd ecommerce-api
npm install
```

### 2 — Create MySQL Database
```bash
mysql -u root -p
CREATE DATABASE ecommerce_db;
EXIT;
```

### 3 — Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# Midtrans Sandbox
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
```

### 4 — Seed Database
```bash
npm run seed
```

### 5 — Run Development Server
```bash
npm run dev
```

Server running at `http://localhost:3000`

### 6 — Access Admin Panel
```
http://localhost:3000/admin

Default admin credentials:
Email    : admin@ecommerce.com
Password : Admin123!
```

---

## 📱 Mobile App Setup

### 1 — Install Dependencies
```bash
cd EcommerceApp
npm install
```

### 2 — Configure API URL

Edit `src/constants/config.js`:
```js
export const CONFIG = {
  // Android Emulator
  BASE_URL: 'http://10.0.2.2:3000/api',

  // iOS Simulator / Physical Device (use your machine IP)
  // BASE_URL: 'http://192.168.x.x:3000/api',

  // Using ngrok (for Midtrans webhook)
  // BASE_URL: 'https://your-ngrok-url.ngrok-free.app/api',
};
```

### 3 — Run App
```bash
npx expo start
```

Scan QR code with Expo Go app on your device.

---

## 💳 Midtrans Webhook Setup (for local testing)

### 1 — Install & Run ngrok
```bash
ngrok http 3000
```

### 2 — Copy ngrok URL
```
https://xxxx-xxxx.ngrok-free.app
```

### 3 — Update Midtrans Dashboard
```
Settings → Configuration → Payment Notification URL:
https://xxxx-xxxx.ngrok-free.app/api/checkout/webhook
```

### 4 — Update Mobile App Config
```js
BASE_URL: 'https://xxxx-xxxx.ngrok-free.app/api'
```

> ⚠️ ngrok URL changes every restart — update both places when restarting ngrok.

---

## 🧪 Test Cards (Midtrans Sandbox)

| Card | Number | CVV | Expiry |
|---|---|---|---|
| Success | 4811 1111 1111 1114 | 123 | 01/25 |
| Failed | 4911 1111 1111 1113 | 123 | 01/25 |
| Challenge | 4511 1111 1111 1117 | 123 | 01/25 |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Products
```
GET    /api/products
GET    /api/products/featured
GET    /api/products/search
GET    /api/products/:id
```

### Orders
```
GET    /api/orders
GET    /api/orders/:id
```

### Checkout
```
POST   /api/checkout
POST   /api/checkout/webhook
GET    /api/checkout/order/:orderId
POST   /api/checkout/sync/:orderId
```

### Profile
```
GET    /api/profile
PUT    /api/profile
POST   /api/profile/avatar
PUT    /api/profile/change-password
```

### Chatbot
```
POST   /api/chatbot/message
```

### Admin
```
GET    /api/admin/dashboard/stats
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status
GET    /api/admin/users
PATCH  /api/admin/users/:id/role
PATCH  /api/admin/users/:id/toggle-active
GET    /api/admin/transactions
POST   /api/admin/transactions/sync-all
GET    /api/admin/chatbot/rules
POST   /api/admin/chatbot/rules
PUT    /api/admin/chatbot/rules/:id
DELETE /api/admin/chatbot/rules/:id
POST   /api/admin/chatbot/test
```

---

## 🔐 Security

- JWT tokens stored in AsyncStorage with automatic expiry handling
- Passwords hashed with bcryptjs (salt rounds: 10)
- Midtrans webhook signature verification using SHA-512
- Role-based access control (customer / admin)
- Price verification from database on every checkout (prevents price manipulation)
- Stock validation before order creation
- Database transactions for atomic order operations

---

## 🗺️ Roadmap

- [ ] Midtrans Production mode
- [ ] Push notifications for order status updates
- [ ] Product reviews and ratings
- [ ] Shipping address management
- [ ] Promo codes and discounts
- [ ] Dark mode support
- [ ] Multi-language support

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- [Expo](https://expo.dev) — React Native development platform
- [Midtrans](https://midtrans.com) — Payment gateway
- [Sequelize](https://sequelize.org) — Node.js ORM
- [TanStack Query](https://tanstack.com/query) — Data fetching
- [React Navigation](https://reactnavigation.org) — Mobile navigation
- [ngrok](https://ngrok.com) — Local tunnel for webhook testing
