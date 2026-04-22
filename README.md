# 🚀 CryptoTrack — Real-Time Cryptocurrency Dashboard

A production-ready, high-performance React web application that tracks live cryptocurrency prices using the **CoinGecko Public API**. Features a beautiful dark/light UI, instant search, skeleton loaders, auto-polling, and deep-insight modals.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Live Market Data** | Top 50 coins by market cap via CoinGecko API |
| 🔍 **Instant Search** | Client-side filter by name or symbol using `useMemo` |
| 🌗 **Dark / Light Mode** | Theme persisted in `localStorage` |
| ⏱ **Auto-Polling** | Refreshes data every **60 seconds** with countdown timer |
| 💀 **Skeleton Loaders** | Table & card skeletons while data loads |
| ❌ **Error Handling** | Styled error state with retry button (handles rate limits) |
| 📱 **Responsive Design** | Table on desktop, card grid on mobile |
| 🔎 **Deep Insights Modal** | Click any coin → 24h High/Low, Market Cap, Volume, Circulating Supply |
| 🎨 **Animations** | Slide-up modal, fade transitions, pulsing live indicator |

---

## 🗂 Project Structure

```
crypto-dashboard/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Sticky header with theme toggle & refresh
│   │   ├── SearchBar.jsx       # Controlled search input with clear button
│   │   ├── CoinItem.jsx        # CoinRow (desktop) + CoinCard (mobile)
│   │   ├── CoinTable.jsx       # Desktop table wrapper
│   │   ├── CoinCardGrid.jsx    # Mobile card grid wrapper
│   │   ├── CoinModal.jsx       # Deep insights slide-up modal
│   │   ├── SkeletonLoader.jsx  # Skeleton loaders (table + cards)
│   │   └── ErrorMessage.jsx    # Error state component
│   ├── hooks/
│   │   ├── useCryptoData.js    # Data fetching, polling, countdown
│   │   └── useTheme.js         # Dark/light mode with localStorage
│   ├── services/
│   │   └── cryptoApi.js        # Axios API service (CoinGecko)
│   ├── utils/
│   │   └── formatters.js       # Currency, number, percent formatters
│   ├── App.jsx                 # Root component with all state
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind + custom animations
├── index.html                  # HTML template with SEO meta tags
├── tailwind.config.js          # Tailwind dark mode + content paths
├── vite.config.js              # Vite configuration
└── package.json
```

---

## 🛠 Tech Stack

- **React 19** — Functional components, Hooks
- **Vite** — Lightning-fast dev server & bundler
- **Tailwind CSS v3** — Utility-first responsive styling
- **Lucide React** — Modern icon library
- **Axios** — HTTP client for API calls
- **CoinGecko API** — Free public crypto market data

---

## ⚡ Setup & Run Instructions

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) **v18 or higher**
- npm (comes with Node.js)

---

### Step 1 — Clone or Download the Project

If you downloaded the project as a ZIP, extract it. If using Git:

```bash
git clone <your-repo-url>
cd crypto-dashboard
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`, including React, Tailwind CSS, Axios, and Lucide React.

---

### Step 3 — Start the Development Server

```bash
npm run dev
```

Vite will start a local development server. You should see output like:

```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Step 4 — Open in Browser

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

The app will:
1. Fetch the top 50 cryptocurrencies from CoinGecko
2. Display skeleton loaders while loading
3. Show live prices, market caps, and 24h changes
4. Auto-refresh every 60 seconds

---

## 🏗 Build for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` folder. To preview the production build locally:

```bash
npm run preview
```

---

## 🌐 API Information

This project uses the **CoinGecko Free Public API** (no API key required):

- **Endpoint**: `GET https://api.coingecko.com/api/v3/coins/markets`
- **Rate Limit**: ~10–30 requests/minute on the free tier
- The app handles rate limiting with a friendly error message and retry button

> **Note**: If you see a rate limit error, wait 60 seconds and click "Try Again" or the refresh button.

---

## 📱 Usage Guide

| Action | Result |
|---|---|
| Type in the search bar | Instantly filters coins by name or symbol |
| Click any coin row / card | Opens the Deep Insights modal |
| Click 🌙 / ☀️ button | Toggles dark / light mode (saved in browser) |
| Click ↻ button | Manually refreshes market data |
| Press `Escape` | Closes the modal |
| Click backdrop | Closes the modal |

---

## 🎨 Theme

- **Default**: Respects your OS dark/light preference
- **Toggle**: Click the moon/sun icon in the header
- **Persistence**: Your choice is saved in `localStorage` across sessions

---

## 📄 License

ISC
