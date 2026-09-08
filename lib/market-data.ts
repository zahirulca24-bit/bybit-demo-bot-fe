export type Candle = {
  o: number
  h: number
  l: number
  c: number
  v: number
}

// Deterministic pseudo-random generator so the chart is stable between renders.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateCandles(count = 120, seed = 42): Candle[] {
  const rand = mulberry32(seed)
  const candles: Candle[] = []
  let price = 1780

  for (let i = 0; i < count; i++) {
    // Range-bound early, a dip mid-series, then a rally — echoing the reference chart.
    const phase = i / count
    const wave = Math.sin(phase * Math.PI * 3.2) * 1.1 + Math.sin(phase * Math.PI * 1.3) * 0.9
    const dipThenRally = phase < 0.5 ? -phase * 1.2 : (phase - 0.5) * 2.6
    const drift = wave + dipThenRally
    const noise = (rand() - 0.5) * 26
    const o = price
    const c = Math.max(1500, o + drift * 6 + noise)
    const wick = 6 + rand() * 20
    const h = Math.max(o, c) + rand() * wick
    const l = Math.min(o, c) - rand() * wick
    const v = 4000 + rand() * 9000 + (Math.abs(c - o) > 12 ? 4000 : 0)
    candles.push({ o, h, l, c, v })
    price = c
  }
  return candles
}

// Exponential moving average over the close prices.
export function ema(candles: Candle[], period: number): number[] {
  const k = 2 / (period + 1)
  const out: number[] = []
  let prev = candles[0]?.c ?? 0
  candles.forEach((candle, i) => {
    prev = i === 0 ? candle.c : candle.c * k + prev * (1 - k)
    out.push(prev)
  })
  return out
}

// Relative Strength Index across the close prices (Wilder smoothing).
export function rsi(candles: Candle[], period = 14): number[] {
  const out: number[] = []
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      out.push(50)
      continue
    }
    const change = candles[i].c - candles[i - 1].c
    const gain = Math.max(0, change)
    const loss = Math.max(0, -change)

    if (i <= period) {
      avgGain += gain / period
      avgLoss += loss / period
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    out.push(100 - 100 / (1 + rs))
  }
  return out
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
