"""
TradePro - Python Flask API pre technickú analýzu akcií
Bakalárska práca - EUBA

Tento modul poskytuje REST API pre výpočet technických indikátorov:
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands (Bollingerove pásma)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

# Konfigurácia logovania
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Povolenie CORS pre všetky domény


@dataclass
class TechnicalIndicators:
    """Trieda pre výpočet technických indikátorov"""
    
    @staticmethod
    def calculate_sma(prices: List[float], period: int) -> List[Optional[float]]:
        """
        Výpočet Simple Moving Average (SMA)
        
        Args:
            prices: Zoznam cien
            period: Perióda pre výpočet priemeru
            
        Returns:
            Zoznam hodnôt SMA
        """
        result = []
        for i in range(len(prices)):
            if i < period - 1:
                result.append(None)
            else:
                window = prices[i - period + 1:i + 1]
                result.append(sum(window) / period)
        return result
    
    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> List[Optional[float]]:
        """
        Výpočet Exponential Moving Average (EMA)
        
        Args:
            prices: Zoznam cien
            period: Perióda pre výpočet
            
        Returns:
            Zoznam hodnôt EMA
        """
        result = []
        multiplier = 2 / (period + 1)
        ema = None
        
        for i in range(len(prices)):
            if i < period - 1:
                result.append(None)
            elif i == period - 1:
                # Prvá EMA je SMA
                ema = sum(prices[:period]) / period
                result.append(ema)
            else:
                ema = (prices[i] - ema) * multiplier + ema
                result.append(ema)
        
        return result
    
    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> List[Optional[float]]:
        """
        Výpočet Relative Strength Index (RSI)
        
        RSI meria rýchlosť a zmenu cenových pohybov.
        Hodnoty nad 70 indikujú prekúpený stav.
        Hodnoty pod 30 indikujú prepredaný stav.
        
        Args:
            prices: Zoznam uzatváracích cien
            period: Perióda pre výpočet (štandardne 14)
            
        Returns:
            Zoznam hodnôt RSI (0-100)
        """
        if len(prices) < period + 1:
            return [None] * len(prices)
        
        # Výpočet cenových zmien
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        result = [None]  # Prvá hodnota je None
        
        # Inicializácia priemerného zisku a straty
        avg_gain = np.mean(gains[:period])
        avg_loss = np.mean(losses[:period])
        
        for i in range(len(deltas)):
            if i < period - 1:
                result.append(None)
            elif i == period - 1:
                if avg_loss == 0:
                    result.append(100.0)
                else:
                    rs = avg_gain / avg_loss
                    result.append(100 - (100 / (1 + rs)))
            else:
                # Smoothed averages (Wilderov priemer)
                avg_gain = (avg_gain * (period - 1) + gains[i]) / period
                avg_loss = (avg_loss * (period - 1) + losses[i]) / period
                
                if avg_loss == 0:
                    result.append(100.0)
                else:
                    rs = avg_gain / avg_loss
                    result.append(100 - (100 / (1 + rs)))
        
        return result
    
    @staticmethod
    def calculate_macd(
        prices: List[float],
        fast_period: int = 12,
        slow_period: int = 26,
        signal_period: int = 9
    ) -> Dict[str, List[Optional[float]]]:
        """
        Výpočet Moving Average Convergence Divergence (MACD)
        
        MACD je trendový indikátor, ktorý ukazuje vzťah medzi dvoma EMA.
        
        Args:
            prices: Zoznam uzatváracích cien
            fast_period: Rýchla perióda EMA (štandardne 12)
            slow_period: Pomalá perióda EMA (štandardne 26)
            signal_period: Perióda signálovej línie (štandardne 9)
            
        Returns:
            Slovník s MACD líniou, signálovou líniou a histogramom
        """
        # Výpočet EMA
        ema_fast = TechnicalIndicators.calculate_ema(prices, fast_period)
        ema_slow = TechnicalIndicators.calculate_ema(prices, slow_period)
        
        # MACD línia = EMA(fast) - EMA(slow)
        macd_line = []
        for i in range(len(prices)):
            if ema_fast[i] is None or ema_slow[i] is None:
                macd_line.append(None)
            else:
                macd_line.append(ema_fast[i] - ema_slow[i])
        
        # Signálová línia = EMA(MACD, signal_period)
        # Filtrovanie None hodnôt pre výpočet EMA
        valid_macd = [x for x in macd_line if x is not None]
        signal_values = TechnicalIndicators.calculate_ema(valid_macd, signal_period)
        
        # Zarovnanie signálovej línie
        signal_line = [None] * (len(macd_line) - len(signal_values)) + signal_values
        
        # Histogram = MACD - Signal
        histogram = []
        for i in range(len(macd_line)):
            if macd_line[i] is None or signal_line[i] is None:
                histogram.append(None)
            else:
                histogram.append(macd_line[i] - signal_line[i])
        
        return {
            "macd_line": macd_line,
            "signal_line": signal_line,
            "histogram": histogram
        }
    
    @staticmethod
    def calculate_bollinger_bands(
        prices: List[float],
        period: int = 20,
        std_dev: float = 2.0
    ) -> Dict[str, List[Optional[float]]]:
        """
        Výpočet Bollingerových pásiem
        
        Bollingerove pásma merajú volatilitu trhu.
        - Horné pásmo: SMA + (štandardná odchýlka * multiplikátor)
        - Dolné pásmo: SMA - (štandardná odchýlka * multiplikátor)
        
        Args:
            prices: Zoznam uzatváracích cien
            period: Perióda pre SMA (štandardne 20)
            std_dev: Multiplikátor štandardnej odchýlky (štandardne 2)
            
        Returns:
            Slovník s hornými, strednými a dolnými pásmami
        """
        sma = TechnicalIndicators.calculate_sma(prices, period)
        
        upper_band = []
        lower_band = []
        
        for i in range(len(prices)):
            if i < period - 1:
                upper_band.append(None)
                lower_band.append(None)
            else:
                window = prices[i - period + 1:i + 1]
                std = np.std(window, ddof=1)  # Výberová štandardná odchýlka
                
                upper_band.append(sma[i] + (std * std_dev))
                lower_band.append(sma[i] - (std * std_dev))
        
        return {
            "upper_band": upper_band,
            "middle_band": sma,
            "lower_band": lower_band
        }


# API Endpointy

@app.route('/api/health', methods=['GET'])
def health_check():
    """Kontrola stavu API"""
    return jsonify({
        "status": "healthy",
        "service": "TradePro Technical Analysis API",
        "version": "1.0.0"
    })


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Hlavný endpoint pre technickú analýzu
    
    Očakávaný JSON:
    {
        "prices": [100.5, 101.2, ...],  // Uzatváracie ceny
        "indicators": {
            "rsi": true,
            "macd": true,
            "bollinger": true
        },
        "settings": {  // Voliteľné
            "rsi_period": 14,
            "macd_fast": 12,
            "macd_slow": 26,
            "macd_signal": 9,
            "bb_period": 20,
            "bb_std_dev": 2.0
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'prices' not in data:
            return jsonify({"error": "Chýbajú cenové dáta"}), 400
        
        prices = data['prices']
        indicators = data.get('indicators', {})
        settings = data.get('settings', {})
        
        if not isinstance(prices, list) or len(prices) < 2:
            return jsonify({"error": "Neplatné cenové dáta"}), 400
        
        # Konverzia na float
        prices = [float(p) for p in prices]
        
        result = {
            "input_length": len(prices),
            "indicators": {}
        }
        
        # RSI
        if indicators.get('rsi', False):
            rsi_period = settings.get('rsi_period', 14)
            result["indicators"]["rsi"] = {
                "values": TechnicalIndicators.calculate_rsi(prices, rsi_period),
                "period": rsi_period,
                "description": "Relative Strength Index - hodnoty nad 70 = prekúpené, pod 30 = prepredané"
            }
        
        # MACD
        if indicators.get('macd', False):
            macd_fast = settings.get('macd_fast', 12)
            macd_slow = settings.get('macd_slow', 26)
            macd_signal = settings.get('macd_signal', 9)
            
            macd_data = TechnicalIndicators.calculate_macd(
                prices, macd_fast, macd_slow, macd_signal
            )
            result["indicators"]["macd"] = {
                **macd_data,
                "settings": {
                    "fast_period": macd_fast,
                    "slow_period": macd_slow,
                    "signal_period": macd_signal
                },
                "description": "Moving Average Convergence Divergence - signály nákupu/predaja pri prekrížení línií"
            }
        
        # Bollinger Bands
        if indicators.get('bollinger', False):
            bb_period = settings.get('bb_period', 20)
            bb_std_dev = settings.get('bb_std_dev', 2.0)
            
            bb_data = TechnicalIndicators.calculate_bollinger_bands(
                prices, bb_period, bb_std_dev
            )
            result["indicators"]["bollinger"] = {
                **bb_data,
                "settings": {
                    "period": bb_period,
                    "std_dev": bb_std_dev
                },
                "description": "Bollingerove pásma - meria volatilitu, ceny mimo pásiem signalizujú potenciálny obrat"
            }
        
        logger.info(f"Úspešná analýza {len(prices)} cenových bodov")
        return jsonify(result)
    
    except ValueError as e:
        logger.error(f"Chyba pri spracovaní dát: {e}")
        return jsonify({"error": f"Neplatné dáta: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Neočakávaná chyba: {e}")
        return jsonify({"error": "Interná chyba servera"}), 500


@app.route('/api/rsi', methods=['POST'])
def calculate_rsi_endpoint():
    """Endpoint pre samostatný výpočet RSI"""
    try:
        data = request.get_json()
        prices = data.get('prices', [])
        period = data.get('period', 14)
        
        if not prices:
            return jsonify({"error": "Chýbajú cenové dáta"}), 400
        
        prices = [float(p) for p in prices]
        rsi_values = TechnicalIndicators.calculate_rsi(prices, period)
        
        # Získanie poslednej platnej hodnoty
        current_rsi = None
        for v in reversed(rsi_values):
            if v is not None:
                current_rsi = round(v, 2)
                break
        
        # Interpretácia RSI
        signal = "neutrálne"
        if current_rsi:
            if current_rsi > 70:
                signal = "prekúpené"
            elif current_rsi < 30:
                signal = "prepredané"
        
        return jsonify({
            "rsi": rsi_values,
            "current_value": current_rsi,
            "signal": signal,
            "period": period
        })
    
    except Exception as e:
        logger.error(f"Chyba pri výpočte RSI: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/macd', methods=['POST'])
def calculate_macd_endpoint():
    """Endpoint pre samostatný výpočet MACD"""
    try:
        data = request.get_json()
        prices = data.get('prices', [])
        fast = data.get('fast_period', 12)
        slow = data.get('slow_period', 26)
        signal = data.get('signal_period', 9)
        
        if not prices:
            return jsonify({"error": "Chýbajú cenové dáta"}), 400
        
        prices = [float(p) for p in prices]
        macd_data = TechnicalIndicators.calculate_macd(prices, fast, slow, signal)
        
        # Získanie aktuálnych hodnôt
        current_macd = None
        current_signal = None
        current_histogram = None
        
        for i in range(len(macd_data['macd_line']) - 1, -1, -1):
            if macd_data['macd_line'][i] is not None:
                current_macd = round(macd_data['macd_line'][i], 4)
                break
        
        for i in range(len(macd_data['signal_line']) - 1, -1, -1):
            if macd_data['signal_line'][i] is not None:
                current_signal = round(macd_data['signal_line'][i], 4)
                break
        
        for i in range(len(macd_data['histogram']) - 1, -1, -1):
            if macd_data['histogram'][i] is not None:
                current_histogram = round(macd_data['histogram'][i], 4)
                break
        
        # Interpretácia MACD
        trend = "neutrálny"
        if current_macd and current_signal:
            if current_macd > current_signal:
                trend = "býčí (bullish)"
            else:
                trend = "medvedí (bearish)"
        
        return jsonify({
            **macd_data,
            "current": {
                "macd": current_macd,
                "signal": current_signal,
                "histogram": current_histogram
            },
            "trend": trend,
            "settings": {
                "fast_period": fast,
                "slow_period": slow,
                "signal_period": signal
            }
        })
    
    except Exception as e:
        logger.error(f"Chyba pri výpočte MACD: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/bollinger', methods=['POST'])
def calculate_bollinger_endpoint():
    """Endpoint pre samostatný výpočet Bollingerových pásiem"""
    try:
        data = request.get_json()
        prices = data.get('prices', [])
        period = data.get('period', 20)
        std_dev = data.get('std_dev', 2.0)
        
        if not prices:
            return jsonify({"error": "Chýbajú cenové dáta"}), 400
        
        prices = [float(p) for p in prices]
        bb_data = TechnicalIndicators.calculate_bollinger_bands(prices, period, std_dev)
        
        # Získanie aktuálnych hodnôt
        current_price = prices[-1]
        current_upper = None
        current_middle = None
        current_lower = None
        
        for i in range(len(bb_data['upper_band']) - 1, -1, -1):
            if bb_data['upper_band'][i] is not None:
                current_upper = round(bb_data['upper_band'][i], 2)
                current_middle = round(bb_data['middle_band'][i], 2)
                current_lower = round(bb_data['lower_band'][i], 2)
                break
        
        # Interpretácia pozície ceny
        position = "v pásme"
        if current_upper and current_lower:
            if current_price > current_upper:
                position = "nad horným pásmom (potenciálne prekúpené)"
            elif current_price < current_lower:
                position = "pod dolným pásmom (potenciálne prepredané)"
        
        # Výpočet šírky pásma (volatilita)
        bandwidth = None
        if current_upper and current_lower and current_middle:
            bandwidth = round((current_upper - current_lower) / current_middle * 100, 2)
        
        return jsonify({
            **bb_data,
            "current": {
                "price": current_price,
                "upper": current_upper,
                "middle": current_middle,
                "lower": current_lower
            },
            "position": position,
            "bandwidth_percent": bandwidth,
            "settings": {
                "period": period,
                "std_dev": std_dev
            }
        })
    
    except Exception as e:
        logger.error(f"Chyba pri výpočte Bollinger Bands: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
