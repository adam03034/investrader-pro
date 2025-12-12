import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

// -----------------------------
// Konfigurácia API URL
// -----------------------------
function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

const ENV_API_URL = import.meta.env.VITE_PYTHON_API_URL as string | undefined;

const PYTHON_API_URL =
  ENV_API_URL && ENV_API_URL.trim().length > 0
    ? normalizeBaseUrl(ENV_API_URL.trim())
    : import.meta.env.DEV
      ? "http://localhost:5000"
      : "";

// Debug (môžeš neskôr zmazať)
console.log("PYTHON_API_URL =", PYTHON_API_URL);

// -----------------------------
// Fetch helper s timeoutom
// -----------------------------
async function fetchJson<T>(url: string, options: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  if (!PYTHON_API_URL) {
    throw new Error("Missing VITE_PYTHON_API_URL. Nastav env premennú a sprav redeploy/rebuild frontendu.");
  }

  const { timeoutMs = 15000, ...rest } = options;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      cache: "no-store",
    });

    // ak server vráti html (napr. 502), toto to zvládne
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { error: text || "Invalid JSON response" };
    }

    if (!res.ok) {
      const msg = json?.error || json?.message || `HTTP ${res.status} (${res.statusText || "error"})`;
      throw new Error(msg);
    }

    return json as T;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error("Request timeout (API môže byť práve cold-start na Renderi)");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

// -----------------------------
// Typy
// -----------------------------
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

// -----------------------------
// Hooks
// -----------------------------

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
      return fetchJson<PythonAnalysisResult>(`${PYTHON_API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices, indicators, settings }),
        timeoutMs: 20000,
      });
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
    mutationFn: async ({ prices, period = 14 }: { prices: number[]; period?: number }): Promise<RSIResult> => {
      return fetchJson<RSIResult>(`${PYTHON_API_URL}/api/rsi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices, period }),
        timeoutMs: 20000,
      });
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
      return fetchJson<MACDResult>(`${PYTHON_API_URL}/api/macd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices, fast_period, slow_period, signal_period }),
        timeoutMs: 20000,
      });
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
      return fetchJson<BollingerResult>(`${PYTHON_API_URL}/api/bollinger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices, period, std_dev }),
        timeoutMs: 20000,
      });
    },
  });
}

// Hook pre kontrolu stavu Python API
export function usePythonAPIHealth() {
  return useQuery({
    queryKey: ["python-api-health"],
    queryFn: async () => {
      return fetchJson(`${PYTHON_API_URL}/api/health`, { timeoutMs: 15000 });
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    refetchInterval: 30000,
  });
}
