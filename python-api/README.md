# TradePro - Python API pre Technickú Analýzu

Bakalárska práca - Ekonomická univerzita v Bratislave

## Popis

Tento Python Flask API modul poskytuje výpočet technických indikátorov pre analýzu akcií:

- **RSI (Relative Strength Index)** - Meria rýchlosť a zmenu cenových pohybov
- **MACD (Moving Average Convergence Divergence)** - Trendový indikátor
- **Bollinger Bands** - Meria volatilitu trhu

## Inštalácia

### Lokálne spustenie

```bash
# Vytvorenie virtuálneho prostredia
python -m venv venv

# Aktivácia (Windows)
venv\Scripts\activate

# Aktivácia (Linux/Mac)
source venv/bin/activate

# Inštalácia závislostí
pip install -r requirements.txt

# Spustenie
python app.py
```

Server bude dostupný na `http://localhost:5000`

### Deployment na Railway

1. Vytvorte účet na [Railway.app](https://railway.app)
2. Prepojte GitHub repozitár
3. Railway automaticky detekuje Python projekt
4. Nastavte port na 5000

### Deployment na Render

1. Vytvorte účet na [Render.com](https://render.com)
2. Vytvorte nový Web Service
3. Prepojte GitHub repozitár
4. Nastavte:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

## API Dokumentácia

### Health Check

```
GET /api/health
```

Odpoveď:
```json
{
  "status": "healthy",
  "service": "TradePro Technical Analysis API",
  "version": "1.0.0"
}
```

### Komplexná Analýza

```
POST /api/analyze
Content-Type: application/json

{
  "prices": [100.5, 101.2, 99.8, ...],
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

### RSI

```
POST /api/rsi
Content-Type: application/json

{
  "prices": [100.5, 101.2, 99.8, ...],
  "period": 14
}
```

Odpoveď:
```json
{
  "rsi": [null, null, ..., 65.32],
  "current_value": 65.32,
  "signal": "neutrálne",
  "period": 14
}
```

### MACD

```
POST /api/macd
Content-Type: application/json

{
  "prices": [100.5, 101.2, 99.8, ...],
  "fast_period": 12,
  "slow_period": 26,
  "signal_period": 9
}
```

### Bollinger Bands

```
POST /api/bollinger
Content-Type: application/json

{
  "prices": [100.5, 101.2, 99.8, ...],
  "period": 20,
  "std_dev": 2.0
}
```

## Technológie

- **Flask** - Webový framework
- **NumPy** - Numerické výpočty
- **Flask-CORS** - Cross-Origin Resource Sharing
- **Gunicorn** - WSGI HTTP Server (produkcia)

## Autor

Bakalárska práca - EUBA 2024/2025
