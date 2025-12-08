// Technical indicators calculation utilities

export interface HistoricalDataPoint {
  date: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export interface IndicatorData extends HistoricalDataPoint {
  sma20?: number;
  sma50?: number;
  ema12?: number;
  ema26?: number;
  rsi?: number;
}

// Simple Moving Average (SMA)
export function calculateSMA(data: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  
  return result;
}

// Exponential Moving Average (EMA)
export function calculateEMA(data: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first EMA value
  let ema: number | undefined = undefined;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else if (i === period - 1) {
      // First EMA is SMA
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      ema = sum / period;
      result.push(ema);
    } else {
      // EMA = (Close - EMA(prev)) * multiplier + EMA(prev)
      ema = (data[i] - ema!) * multiplier + ema!;
      result.push(ema);
    }
  }
  
  return result;
}

// Relative Strength Index (RSI)
export function calculateRSI(data: number[], period: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // First value is undefined
  result.push(undefined);
  
  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else if (i === period - 1) {
      // First RSI
      const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    } else {
      // Subsequent RSI using smoothed averages
      const prevRSI = result[result.length - 1];
      if (prevRSI === undefined) {
        result.push(undefined);
        continue;
      }
      
      // Calculate smoothed averages
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return result;
}

// Add indicators to historical data
export function addIndicatorsToData(
  data: HistoricalDataPoint[],
  indicators: { sma20?: boolean; sma50?: boolean; ema12?: boolean; ema26?: boolean; rsi?: boolean }
): IndicatorData[] {
  const closes = data.map(d => d.close);
  
  const sma20Values = indicators.sma20 ? calculateSMA(closes, 20) : [];
  const sma50Values = indicators.sma50 ? calculateSMA(closes, 50) : [];
  const ema12Values = indicators.ema12 ? calculateEMA(closes, 12) : [];
  const ema26Values = indicators.ema26 ? calculateEMA(closes, 26) : [];
  const rsiValues = indicators.rsi ? calculateRSI(closes, 14) : [];
  
  return data.map((point, i) => ({
    ...point,
    sma20: sma20Values[i],
    sma50: sma50Values[i],
    ema12: ema12Values[i],
    ema26: ema26Values[i],
    rsi: rsiValues[i],
  }));
}
