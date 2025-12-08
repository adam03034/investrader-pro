import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

// URL Python API - nastav po deployi
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:5000";

export interface PythonAnalysisResult {
  input_length: number;
  indicators: {
    rsi?: {
      values: (number | null)[];
      period: number;
      description: string;
    };
    macd?: {
      macd_line: (number | null)[];
      signal_line: (number | null)[];
      histogram: (number | null)[];
      settings: {
        fast_period: number;
        slow_period: number;
        signal_period: number;
      };
      description: string;
    };
    bollinger?: {
      upper_band: (number | null)[];
      middle_band: (number | null)[];
      lower_band: (number | null)[];
      settings: {
        period: number;
        std_dev: number;
      };
      description: string;
    };
  };
}

export interface RSIResult {
  rsi: (number | null)[];
  current_value: number | null;
  signal: "neutrálne" | "prekúpené" | "prepredané";
  period: number;
}

export interface MACDResult {
  macd_line: (number | null)[];
  signal_line: (number | null)[];
  histogram: (number | null)[];
  current: {
    macd: number | null;
    signal: number | null;
    histogram: number | null;
  };
  trend: string;
  settings: {
    fast_period: number;
    slow_period: number;
    signal_period: number;
  };
}

export interface BollingerResult {
  upper_band: (number | null)[];
  middle_band: (number | null)[];
  lower_band: (number | null)[];
  current: {
    price: number;
    upper: number | null;
    middle: number | null;
    lower: number | null;
  };
  position: string;
  bandwidth_percent: number | null;
  settings: {
    period: number;
    std_dev: number;
  };
}

// Hook pre komplexnú analýzu
export function usePythonAnalysis() {
  const [error, setError] = useState<string | null>(null);

  const analysisMutation = useMutation({
    mutationFn: async ({
      prices,
      indicators,
      settings,
    }: {
      prices: number[];
      indicators: { rsi?: boolean; macd?: boolean; bollinger?: boolean };
      settings?: {
        rsi_period?: number;
        macd_fast?: number;
        macd_slow?: number;
        macd_signal?: number;
        bb_period?: number;
        bb_std_dev?: number;
      };
    }): Promise<PythonAnalysisResult> => {
      const response = await fetch(`${PYTHON_API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prices, indicators, settings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Chyba pri analýze");
      }

      return response.json();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return {
    analyze: analysisMutation.mutate,
    analyzeAsync: analysisMutation.mutateAsync,
    data: analysisMutation.data,
    isLoading: analysisMutation.isPending,
    error,
    reset: () => {
      analysisMutation.reset();
      setError(null);
    },
  };
}

// Hook pre RSI
export function usePythonRSI() {
  return useMutation({
    mutationFn: async ({
      prices,
      period = 14,
    }: {
      prices: number[];
      period?: number;
    }): Promise<RSIResult> => {
      const response = await fetch(`${PYTHON_API_URL}/api/rsi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prices, period }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Chyba pri výpočte RSI");
      }

      return response.json();
    },
  });
}

// Hook pre MACD
export function usePythonMACD() {
  return useMutation({
    mutationFn: async ({
      prices,
      fast_period = 12,
      slow_period = 26,
      signal_period = 9,
    }: {
      prices: number[];
      fast_period?: number;
      slow_period?: number;
      signal_period?: number;
    }): Promise<MACDResult> => {
      const response = await fetch(`${PYTHON_API_URL}/api/macd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prices, fast_period, slow_period, signal_period }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Chyba pri výpočte MACD");
      }

      return response.json();
    },
  });
}

// Hook pre Bollinger Bands
export function usePythonBollinger() {
  return useMutation({
    mutationFn: async ({
      prices,
      period = 20,
      std_dev = 2.0,
    }: {
      prices: number[];
      period?: number;
      std_dev?: number;
    }): Promise<BollingerResult> => {
      const response = await fetch(`${PYTHON_API_URL}/api/bollinger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prices, period, std_dev }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Chyba pri výpočte Bollinger Bands");
      }

      return response.json();
    },
  });
}

// Hook pre kontrolu stavu Python API
export function usePythonAPIHealth() {
  return useQuery({
    queryKey: ["python-api-health"],
    queryFn: async () => {
      const response = await fetch(`${PYTHON_API_URL}/api/health`);
      if (!response.ok) {
        throw new Error("Python API nedostupné");
      }
      return response.json();
    },
    retry: 1,
    refetchInterval: 30000, // Kontrola každých 30 sekúnd
  });
}
