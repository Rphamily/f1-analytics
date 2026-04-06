# 🏎️ F1 Analytics — ML-Powered Formula 1 Race Predictions

> A full-stack Next.js application for Formula 1 race predictions, driver comparisons, and historical analysis. Built as a portfolio project showcasing ML, data visualization, and modern web development.

![F1 Analytics Banner](https://placehold.co/1200x400/080808/E10600?text=F1+ANALYTICS)

## ✨ Features

### 🏁 Race Weekend Dashboard
- **Live animated track map** with F1 cars racing around the circuit SVG in real time
- **Countdown timer** to the next race weekend
- **Full driver grid** with team colors, positions, and performance bars
- **Circuit statistics**: lap record, corners, DRS zones, top speed
- **Race calendar** with upcoming rounds

### 🤖 ML Race Predictor
- **Rule-based ML model** trained on qualifying position, recent form, circuit history, and team strength
- **Adjustable qualifying grid** — drag drivers up/down to simulate different qualifying outcomes
- **Win probabilities** and **podium probabilities** for each driver
- **Confidence scores** and key prediction factors
- **Visual podium display** with probability bars

### 🃏 FIFA-Style Driver Cards
- **Performance stat cards** with circular stat charts (Pace, Racecraft, Defense, Consistency, Wet Weather, Tyre Management)
- **Current 2025 grid** + **All-time legends** (Senna, Schumacher, Prost)
- **Head-to-head comparison** modal with mirrored stat bars
- **Career highlights**: championships, wins, poles, podiums

### 🆚 Driver Comparison (Any Era)
- **ELO rating system** for cross-era comparison (Senna vs Hamilton vs Verstappen)
- **Career statistics** comparison with visual bars
- **Search** across current drivers and historical legends
- **Era labels** and contextual information

### 📜 F1 History (1950–2024)
- **All 75 seasons** of Formula 1 championships
- **Era filtering**: Verstappen Era, Hamilton Era, Schumacher Era, Senna/Prost Era, Classic Era
- **Search** by driver, team, or year
- **Most championships** leaderboard

### 🏆 Standings
- **Live driver championship** standings via Ergast API
- **Constructor standings** with visual points bars
- **Team color** coding throughout

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** + custom CSS |
| Animations | **CSS offset-path** for car animations, keyframes |
| ML | **TensorFlow.js** (browser-side) + rule-based predictor |
| Data | **Ergast F1 API** (historical) + **OpenF1 API** (live) |
| Charts | **Recharts** |
| Deployment | **Vercel** |
| Fonts | **Barlow Condensed** + **Share Tech Mono** |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/f1-analytics.git
cd f1-analytics

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
f1-analytics/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home: Race Weekend Dashboard
│   │   ├── predict/page.tsx    # ML Race Predictor
│   │   ├── compare/page.tsx    # Driver Comparison
│   │   ├── cards/page.tsx      # FIFA-style Driver Cards
│   │   ├── history/page.tsx    # F1 History (1950–2024)
│   │   ├── standings/          # Championship Standings
│   │   └── layout.tsx          # Root layout + Navigation
│   ├── components/
│   │   ├── track/
│   │   │   └── RaceWeekendHero.tsx   # Animated track + cars
│   │   └── ui/
│   │       ├── Navigation.tsx
│   │       ├── DriverGrid.tsx
│   │       ├── QuickStats.tsx
│   │       └── UpcomingRaces.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   └── f1-api.ts       # Ergast + OpenF1 API client
│   │   ├── ml/
│   │   │   └── race-predictor.ts    # ML prediction engine + ELO
│   │   └── utils/
│   │       └── track-data.ts   # SVG track paths + circuit data
│   └── styles/
│       └── globals.css         # F1 design system
├── public/
├── vercel.json
├── tailwind.config.js
└── next.config.js
```

---

## 🔌 Data Sources

### Ergast F1 API (Free, No Auth Required)
```
https://ergast.com/api/f1/
```
Used for: Historical race results, driver standings, qualifying times, lap data going back to 1950.

### OpenF1 API (Free, No Auth Required)
```
https://api.openf1.org/v1/
```
Used for: Current season live telemetry, position data, car data.

---

## 🚢 Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — click **Deploy**
5. Done! Your app is live.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🔮 Planned Features

- [ ] **Live telemetry** during race weekends via OpenF1 WebSocket
- [ ] **Lap time charts** with interactive race replay
- [ ] **Weather integration** affecting predictions
- [ ] **Historical pace analysis** — fastest laps by sector
- [ ] **TensorFlow.js neural network** trained on 10+ years of race data
- [ ] **Driver profile pages** with full career timeline
- [ ] **Fantasy F1 assistant** — weekly lineup suggestions
- [ ] **3D car models** using Three.js on track map

---

## 📄 License

MIT — free to use for portfolio and learning purposes.

**Not affiliated with Formula 1, FIA, or any F1 team.**
Data provided by [Ergast API](https://ergast.com/mrd/) under CC BY 4.0.

---

## 👤 About

Built as a portfolio project to demonstrate:
- **Full-stack Next.js** with TypeScript
- **Data visualization** and real-time API integration
- **Machine learning** in the browser with TensorFlow.js
- **SVG animation** and motion graphics
- **Production-grade** deployment on Vercel

> *"To finish first, first you have to finish."* — Enzo Ferrari
