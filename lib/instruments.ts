import { generateCandles, ema, rsi, type Candle } from './market-data'

// ---------------------------------------------------------------------------
// Preserved trading/risk rules (source of truth — values unchanged).
// ---------------------------------------------------------------------------
export const RISK = {
  takeProfitPct: 3.68,
  stopLossPct: 3.62,
  riskReward: '1 : 2.3',
  exposure: 'Moderate',
} as const

export const ACCOUNT = {
  name: 'M. Rabbi Rezwan',
  number: '4433378372',
  balance: 623098.17,
  currency: 'USD',
} as const

export const ORDER_TYPES = ['Market', 'Limit', 'Stop-Limit'] as const
export type OrderType = (typeof ORDER_TYPES)[number]

// ---------------------------------------------------------------------------
// Instrument universe — derived entirely from the preserved market engine.
// Each symbol reuses generateCandles() with a distinct seed, then the
// deterministic series is scaled to the instrument's price level.
// ---------------------------------------------------------------------------
export type Signal = 'Momentum Up' | 'Momentum Down' | 'Overbought' | 'Oversold' | 'Neutral'

export type Instrument = {
  symbol: string
  name: string
  klass: string
  decimals: number
  unit: string
  candles: Candle[]
  price: number
  change: number
  changePct: number
  dayHigh: number
  dayLow: number
  rangeHigh: number
  rangeLow: number
  volume: number
  rsi: number
  ema12: number
  ema30: number
  trendUp: boolean
  signal: Signal
  spark: number[]
}

type UniverseConfig = {
  symbol: string
  name: string
  klass: string
  target: number
  seed: number
  decimals: number
  unit: string
}

const UNIVERSE: UniverseConfig[] = [
  { symbol: 'XAU/USD', name: 'Gold Spot', klass: 'Metals', target: 2054.32, seed: 42, decimals: 2, unit: 'oz' },
  { symbol: 'XAG/USD', name: 'Silver Spot', klass: 'Metals', target: 24.18, seed: 7, decimals: 2, unit: 'oz' },
  { symbol: 'BTC/USD', name: 'Bitcoin', klass: 'Crypto', target: 43120.5, seed: 101, decimals: 2, unit: 'BTC' },
  { symbol: 'ETH/USD', name: 'Ethereum', klass: 'Crypto', target: 2285.4, seed: 88, decimals: 2, unit: 'ETH' },
  { symbol: 'SPX', name: 'S&P 500 Index', klass: 'Index', target: 4783.45, seed: 23, decimals: 2, unit: 'pt' },
  { symbol: 'NDX', name: 'Nasdaq 100', klass: 'Index', target: 16920.8, seed: 57, decimals: 2, unit: 'pt' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', klass: 'FX', target: 1.0932, seed: 12, decimals: 4, unit: 'lot' },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar', klass: 'FX', target: 1.2714, seed: 19, decimals: 4, unit: 'lot' },
  { symbol: 'WTI', name: 'Crude Oil WTI', klass: 'Energy', target: 73.86, seed: 34, decimals: 2, unit: 'bbl' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', klass: 'Equity', target: 495.22, seed: 66, decimals: 2, unit: 'sh' },
  { symbol: 'TSLA', name: 'Tesla Inc', klass: 'Equity', target: 248.48, seed: 71, decimals: 2, unit: 'sh' },
  { symbol: 'AAPL', name: 'Apple Inc', klass: 'Equity', target: 193.58, seed: 5, decimals: 2, unit: 'sh' },
]

function deriveSignal(rsiVal: number, trendUp: boolean, changePct: number): Signal {
  if (rsiVal >= 70) return 'Overbought'
  if (rsiVal <= 30) return 'Oversold'
  if (trendUp && changePct > 0.05) return 'Momentum Up'
  if (!trendUp && changePct < -0.05) return 'Momentum Down'
  return 'Neutral'
}

function buildInstrument(cfg: UniverseConfig): Instrument {
  const raw = generateCandles(120, cfg.seed)
  const lastRaw = raw[raw.length - 1].c
  const scale = cfg.target / lastRaw
  const candles: Candle[] = raw.map((c) => ({
    o: c.o * scale,
    h: c.h * scale,
    l: c.l * scale,
    c: c.c * scale,
    v: c.v,
  }))

  const len = candles.length
  const price = candles[len - 1].c
  const prevClose = candles[Math.max(0, len - 9)].c
  const change = price - prevClose
  const changePct = (change / prevClose) * 100

  const recent = candles.slice(len - 8)
  const dayHigh = Math.max(...recent.map((c) => c.h))
  const dayLow = Math.min(...recent.map((c) => c.l))
  const rangeHigh = Math.max(...candles.map((c) => c.h))
  const rangeLow = Math.min(...candles.map((c) => c.l))

  const e12 = ema(candles, 12)
  const e30 = ema(candles, 30)
  const ema12 = e12[len - 1]
  const ema30 = e30[len - 1]
  const trendUp = ema12 >= ema30

  const rsiArr = rsi(candles)
  const rsiVal = rsiArr[len - 1]

  return {
    symbol: cfg.symbol,
    name: cfg.name,
    klass: cfg.klass,
    decimals: cfg.decimals,
    unit: cfg.unit,
    candles,
    price,
    change,
    changePct,
    dayHigh,
    dayLow,
    rangeHigh,
    rangeLow,
    volume: candles[len - 1].v,
    rsi: rsiVal,
    ema12,
    ema30,
    trendUp,
    signal: deriveSignal(rsiVal, trendUp, changePct),
    spark: candles.slice(len - 32).map((c) => c.c),
  }
}

let cachedUniverse: Instrument[] | null = null

export function getUniverse(): Instrument[] {
  if (!cachedUniverse) cachedUniverse = UNIVERSE.map(buildInstrument)
  return cachedUniverse
}

// ---------------------------------------------------------------------------
// Market breadth analytics — derived from the universe.
// ---------------------------------------------------------------------------
export type Breadth = {
  total: number
  advancers: number
  decliners: number
  avgRsi: number
  topGainer: Instrument
  topLoser: Instrument
  bullish: number
  bearish: number
}

export function getBreadth(universe = getUniverse()): Breadth {
  const advancers = universe.filter((i) => i.changePct >= 0).length
  const avgRsi = universe.reduce((s, i) => s + i.rsi, 0) / universe.length
  const sorted = [...universe].sort((a, b) => b.changePct - a.changePct)
  const bullish = universe.filter(
    (i) => i.signal === 'Momentum Up' || i.signal === 'Oversold',
  ).length
  const bearish = universe.filter(
    (i) => i.signal === 'Momentum Down' || i.signal === 'Overbought',
  ).length

  return {
    total: universe.length,
    advancers,
    decliners: universe.length - advancers,
    avgRsi,
    topGainer: sorted[0],
    topLoser: sorted[sorted.length - 1],
    bullish,
    bearish,
  }
}

// ---------------------------------------------------------------------------
// Positions blotter — deterministic open book derived from live marks.
// ---------------------------------------------------------------------------
export type Position = {
  symbol: string
  name: string
  side: 'Long' | 'Short'
  qty: number
  entry: number
  price: number
  decimals: number
  pnl: number
  pnlPct: number
}

const POSITION_SPEC: { symbol: string; side: 'Long' | 'Short'; qty: number; entryOff: number }[] = [
  { symbol: 'XAU/USD', side: 'Long', qty: 10, entryOff: -0.021 },
  { symbol: 'BTC/USD', side: 'Long', qty: 1.5, entryOff: -0.045 },
  { symbol: 'NVDA', side: 'Long', qty: 120, entryOff: -0.032 },
  { symbol: 'TSLA', side: 'Short', qty: 80, entryOff: 0.028 },
  { symbol: 'EUR/USD', side: 'Short', qty: 40000, entryOff: 0.006 },
  { symbol: 'WTI', side: 'Long', qty: 200, entryOff: -0.017 },
]

export function getPositions(universe = getUniverse()): Position[] {
  return POSITION_SPEC.map((spec) => {
    const inst = universe.find((i) => i.symbol === spec.symbol)!
    const entry = inst.price * (1 + spec.entryOff)
    const dir = spec.side === 'Long' ? 1 : -1
    const pnl = (inst.price - entry) * spec.qty * dir
    const pnlPct = ((inst.price - entry) / entry) * 100 * dir
    return {
      symbol: inst.symbol,
      name: inst.name,
      side: spec.side,
      qty: spec.qty,
      entry,
      price: inst.price,
      decimals: inst.decimals,
      pnl,
      pnlPct,
    }
  })
}

// ---------------------------------------------------------------------------
// Formatting helpers.
// ---------------------------------------------------------------------------
export function fmtPrice(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtSigned(n: number, decimals = 2): string {
  return `${n >= 0 ? '+' : ''}${n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function fmtUsd(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtVol(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(0)
}
