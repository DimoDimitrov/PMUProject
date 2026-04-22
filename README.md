## What is CryptoPaper?

CryptoPaper is a React Native mobile application that lets users practice cryptocurrency trading with virtual money. It's basically a simulator where you can learn how crypto markets work without actually risking real money. I built this as my bachelor's project to combine mobile development with something I find interesting - cryptocurrency trading.

---

## Features

### For Regular Users (Customers)
- **Dashboard** - View all purchased crypto assets across users
- **Cryptocurrency Listing** - Browse top 100 cryptocurrencies with live prices from CoinPaprika API
- **Asset Details** - See price charts (30-day history) and market data for each coin
- **Paper Trading** - Buy and sell crypto with virtual USD balance
- **User Profile** - Update username, change password, upload profile photo
- **News Feed** - Latest crypto news from NewsData.io API

### For Admins
- **User Management** - View all registered users, reset passwords, delete accounts
- **System Overview** - Monitor user activity and portfolios

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript / JavaScript (JSX) |
| Database | SQLite (expo-sqlite) |
| Navigation | Expo Router (file-based routing) |
| State Management | React Context + useSyncExternalStore |
| Charts | react-native-gifted-charts |
| Authentication | Custom session management with bcryptjs |
| APIs | CoinPaprika (prices), NewsData.io (news) |

---

## Project Structure

```
cryptopaper/
├── app/                      # Expo Router pages
│   ├── _layout.jsx           # Root layout with database init
│   ├── index.jsx             # Home screen with main menu
│   ├── +not-found.jsx        # 404 screen
│   └── pages/
│       └── [page].jsx        # Dynamic page router
├── components/               # UI components
│   ├── auth/                 # Login, Register, Logout
│   ├── DashboardSection.jsx
│   ├── CryptoListSection.jsx
│   ├── PaperTradingSection.jsx
│   ├── ProfileSection.jsx
│   ├── UserManagementSection.jsx
│   ├── NewsFeedSection.jsx
│   └── ...
├── database/
│   ├── sqlite.js             # Database initialization
│   ├── bootstrap.js          # Auto-seed admin account
│   └── repositories.js       # CRUD operations
├── constants/
│   ├── theme.js              # Light/dark mode colors
│   └── session.js            # Session state management
└── assets/                   # Images, logos
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL DEFAULT 'customer',
  funds_usd REAL NOT NULL DEFAULT 0,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  profile_picture TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### Portfolios Table
```sql
CREATE TABLE portfolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  crypto_title TEXT NOT NULL,
  price REAL NOT NULL,
  quantity REAL NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for emulators)

### Installation

1. Clone the repo:
```bash
git clone <repository-url>
cd cryptopaper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (already configured in `.env`):
```
EXPO_PUBLIC_NEWS_API_KEY=your_newsdata_api_key
```

4. Start the development server:
```bash
npm start
```

5. Run on Android or iOS:
```bash
npm run android
# or
npm run ios
```

---

## Default Admin Account

When the app starts for the first time, it automatically creates an admin account:

- **Email:** dimo.admin@cryptopaper.local
- **Username:** DimoAdmin
- **Password:** Admin12345!

You can use this to access the User Management section and test admin features.

---

## API Endpoints Used

### CoinPaprika (Crypto Prices)
- `GET /v1/tickers` - Top 100 coins with market data
- `GET /v1/tickers/{id}` - Single coin details
- `GET /v1/coins/{id}/market_chart` - Historical price data

### NewsData.io (Crypto News)
- `GET /1/latest?q=Crypto` - Latest crypto news articles

---

## What I Learned

Building this project taught me a lot about:
- React Native development with Expo
- Local database management with SQLite
- REST API integration and error handling
- State management without Redux (using Context)
- Building responsive UIs that work on different screen sizes
- Security basics (password hashing, session management)

---

## Known Limitations

- No real-time price updates (uses polling)
- No cloud sync - all data is stored locally
- News API requires a valid API key (free tier has limits)
- No biometric authentication (planned but not implemented)
- Web version has separate implementations for some features

---

## License

This is a university project. Feel free to use the code for learning purposes.

---

*Built with React Native, Expo, and a lot of coffee.*
