# OFolio - DeFi Portfolio Dashboard

Track tokens, transactions, NFTs, liquidity positions, and staking across **Ethereum, Polygon, BSC, Arbitrum, and Base**.

## Architecture

- **Backend**: FastAPI (async Python) with Alchemy, CoinGecko, The Graph, and Dune Analytics
- **Frontend**: Next.js 14 (App Router) with RainbowKit, wagmi, Tailwind CSS, Framer Motion, and TanStack Query

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your ALCHEMY_API_KEY (required) and optional keys
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your WalletConnect project ID
npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `ALCHEMY_API_KEY` | Yes | Alchemy API key |
| `COINGECKO_API_KEY` | No | CoinGecko Pro key |
| `THE_GRAPH_API_KEY` | No | The Graph Studio key |
| `DUNE_API_KEY` | No | Dune Analytics key |
| `CORS_ORIGINS` | No | Allowed origins (default: http://localhost:3000) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | Backend URL (default: http://localhost:8000/api) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | WalletConnect Cloud project ID |

## Features

- **Multi-chain dashboard**: View portfolio across 5 chains
- **Wallet connection**: RainbowKit supports MetaMask, WalletConnect, Coinbase Wallet, and more
- **Manual address mode**: Paste any address to view its portfolio without connecting a wallet
- **Token balances**: ERC-20 tokens with live USD prices from CoinGecko
- **Transaction history**: Paginated incoming/outgoing transfers
- **NFT gallery**: Grid view with metadata and images
- **DeFi positions**: Uniswap V3 liquidity pools from The Graph
- **Staking**: Lido staking data with APR from Dune Analytics
- **Dark/light theme**: Toggle in navbar, persisted across sessions
- **Animated UI**: Framer Motion page transitions and staggered content loading

## API documentation

See [`docs/API.md`](docs/API.md) for the full backend API contract.

## Legacy code

The old Flask backend (`pyapis/`) and React frontend (`defi-app/`) are archived in the repository for reference.
