export interface MarketItem {
  pair: string;
  base: string;
  quote: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  decimals: number;
  tickSize: number;
}

export const MARKETS_DATA: MarketItem[] = [
  {
    pair: "BTC/USDT",
    base: "BTC",
    quote: "USDT",
    price: 68412.2,
    change24h: 3.42,
    high24h: 69250.0,
    low24h: 66180.5,
    volume24h: "$1.84B",
    decimals: 2,
    tickSize: 0.1,
  },
  {
    pair: "ETH/USDT",
    base: "ETH",
    quote: "USDT",
    price: 3584.9,
    change24h: 1.86,
    high24h: 3640.0,
    low24h: 3490.0,
    volume24h: "$892M",
    decimals: 2,
    tickSize: 0.05,
  },
  {
    pair: "SOL/USDT",
    base: "SOL",
    quote: "USDT",
    price: 182.44,
    change24h: -0.94,
    high24h: 189.5,
    low24h: 178.2,
    volume24h: "$420M",
    decimals: 2,
    tickSize: 0.01,
  },
  {
    pair: "TON/USDT",
    base: "TON",
    quote: "USDT",
    price: 7.28,
    change24h: 5.11,
    high24h: 7.45,
    low24h: 6.82,
    volume24h: "$138M",
    decimals: 3,
    tickSize: 0.001,
  },
  {
    pair: "XRP/USDT",
    base: "XRP",
    quote: "USDT",
    price: 0.6142,
    change24h: 0.72,
    high24h: 0.632,
    low24h: 0.598,
    volume24h: "$310M",
    decimals: 4,
    tickSize: 0.0001,
  },
  {
    pair: "BNB/USDT",
    base: "BNB",
    quote: "USDT",
    price: 604.1,
    change24h: 0.38,
    high24h: 612.0,
    low24h: 598.5,
    volume24h: "$240M",
    decimals: 2,
    tickSize: 0.1,
  },
];
