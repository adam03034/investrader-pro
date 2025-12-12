# TradePro - Python API pre Technickú Analýzu

**Bakalárska práca - Ekonomická univerzita v Bratislave**

## 📋 Popis

Flask REST API pre výpočet technických indikátorov používaných pri analýze akcií:

| Indikátor | Popis |
|-----------|-------|
| **RSI** | Relative Strength Index - meria rýchlosť a zmenu cenových pohybov |
| **MACD** | Moving Average Convergence Divergence - trendový indikátor |
| **Bollinger Bands** | Meria volatilitu trhu pomocou štandardnej odchýlky |

---

## 🚀 Rýchly štart

### Lokálne spustenie

```bash
# 1. Klonovanie repozitára
git clone https://github.com/YOUR_USERNAME/tradepro-python-api.git
cd tradepro-python-api

# 2. Vytvorenie virtuálneho prostredia
python -m venv venv

# 3. Aktivácia (Windows)
venv\Scripts\activate

# 3. Aktivácia (Linux/Mac)
source venv/bin/activate

# 4. Inštalácia závislostí
pip install -r requirements.txt

# 5. Spustenie servera
python app.py
```

Server bude dostupný na `http://localhost:5000`

---

## ☁️ Deployment na Render.com

### Krok 1: Príprava GitHub repozitára

1. Vytvorte nový GitHub repozitár (napr. `tradepro-python-api`)
2. Nahrajte obsah tohto priečinka do repozitára:

```bash
git init
git add .
git commit -m "Initial commit - TradePro Python API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tradepro-python-api.git
git push -u origin main
```

### Krok 2: Deployment na Render

1. Vytvorte účet na [render.com](https://render.com)
2. Kliknite na **"New +"** → **"Web Service"**
3. Prepojte svoj GitHub účet a vyberte repozitár
4. Nastavte konfiguráciu:

| Nastavenie | Hodnota |
|------------|---------|
| **Name** | `tradepro-api` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |
| **Instance Type** | Free |

5. Kliknite **"Create Web Service"**

### Krok 3: Získanie URL

Po úspešnom deploymente získate URL v tvare:
```
https://tradepro-api.onrender.com
```

---

## ☁️ Alternatíva: Deployment na Railway.app

1. Vytvorte účet na [railway.app](https://railway.app)
2. Kliknite **"New Project"** → **"Deploy from GitHub repo"**
3. Vyberte repozitár
4. Railway automaticky detekuje Python projekt
5. Po deploymente získate URL v **Settings** → **Domains**

---

## 🔗 Pripojenie k React aplikácii

Po úspešnom deploymente pridajte URL do React aplikácie:

### V Lovable projekte:

1. Vytvorte/upravte súbor `.env` v root priečinku:

```env
VITE_PYTHON_API_URL=https://your-api-url.onrender.com
```

2. API sa automaticky pripojí cez hook `usePythonAnalysis.ts`

---

## 📚 API Dokumentácia

### Health Check

```http
GET /api/health
```

**Odpoveď:**
```json
{
  "status": "healthy",
  "service": "TradePro Technical Analysis API",
  "version": "1.0.0"
}
```

### Komplexná Analýza

```http
POST /api/analyze
Content-Type: application/json
```

**Request:**
```json
{
  "prices": [100.5, 101.2, 99.8, 102.1, ...],
  "indicators": {
    "rsi": true,
    "macd": true,
    "bollinger": true
  },
  "settings": {
    "rsi_period": 14,
    "macd_fast": 12,
    "macd_slow": 26,
    "macd_signal": 9,
    "bb_period": 20,
    "bb_std_dev": 2.0
  }
}
```

### RSI (Relative Strength Index)

```http
POST /api/rsi
Content-Type: application/json
```

**Request:**
```json
{
  "prices": [100.5, 101.2, 99.8, ...],
  "period": 14
}
```

**Odpoveď:**
```json
{
  "rsi": [null, null, ..., 65.32],
  "current_value": 65.32,
  "signal": "neutrálne",
  "period": 14
}
```

### MACD

```http
POST /api/macd
Content-Type: application/json
```

**Request:**
```json
{
  "prices": [100.5, 101.2, 99.8, ...],
  "fast_period": 12,
  "slow_period": 26,
  "signal_period": 9
}
```

### Bollinger Bands

```http
POST /api/bollinger
Content-Type: application/json
```

**Request:**
```json
{
  "prices": [100.5, 101.2, 99.8, ...],
  "period": 20,
  "std_dev": 2.0
}
```

---

## 🛠️ Technológie

- **Flask 3.0** - Webový framework
- **NumPy** - Numerické výpočty
- **Flask-CORS** - Cross-Origin Resource Sharing
- **Gunicorn** - WSGI HTTP Server (produkcia)

---

## 📁 Štruktúra projektu

```
python-api/
├── app.py              # Hlavná aplikácia s API endpoints
├── requirements.txt    # Python závislosti
├── Procfile           # Konfigurácia pre deployment
├── .gitignore         # Git ignore pravidlá
└── README.md          # Táto dokumentácia
```

---

## 👨‍🎓 Autor

**Bakalárska práca - EUBA 2024/2025**

Ekonomická univerzita v Bratislave
