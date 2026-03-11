# ⚡ BitcoinDeFi — Build on Bitcoin with OP_NET

> A professional DeFi platform on Bitcoin Layer 1, powered by [OP_NET](https://opnet.org) smart contracts.

## 🚀 Live Demo

> Deploy to Vercel: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/opnet-defi-dapp)

-----

## 📸 Features

|Module                |Description                                 |
|----------------------|--------------------------------------------|
|🔄 **Token Swap**      |Swap OP-20 tokens on Bitcoin L1 via Motoswap|
|💰 **Lending Protocol**|Supply/borrow with real yield on Bitcoin    |
|🖼 **NFT Marketplace** |Mint & trade OP-721 NFTs                    |
|🗳 **DAO Governance**  |On-chain proposals & voting                 |
|🎟 **Raffle/Lottery**  |Provably fair Bitcoin-native lottery        |

-----

## 🔑 OP_WALLET Integration

This dApp uses **real OP_WALLET** integration:

- Detects `window.opnet` provider injected by [OP_WALLET Chrome Extension](https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb)
- Every write action (swap, lend, mint, vote, buy ticket) triggers a **real OP_WALLET popup** for user signing
- Reads wallet address, public key, and BTC balance
- Listens for account/network change events
- Calls OP_NET RPC for on-chain data

-----

## 🛠 Tech Stack

- **React 18 + Vite** — Fast development and build
- **OP_NET** — Bitcoin L1 smart contract platform
- **OP_WALLET** — `window.opnet` provider for signing
- **Tailwind CSS** — Utility-first styling
- **React Router v6** — Client-side routing

-----

## 📦 Setup & Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/opnet-defi-dapp.git
cd opnet-defi-dapp

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

-----

## 🔧 Contract Addresses

Add your deployed OP_NET contract addresses in the respective page files:

|File                          |Contract Variable |Description              |
|------------------------------|------------------|-------------------------|
|`src/pages/Swap.jsx`          |`MOTOSWAP_ROUTER` |Motoswap router contract |
|`src/pages/Lending.jsx`       |`LENDING_CONTRACT`|Lending protocol contract|
|`src/pages/NFTMarketplace.jsx`|`NFT_CONTRACT`    |OP-721 NFT contract      |
|`src/pages/DAO.jsx`           |`DAO_CONTRACT`    |DAO governance contract  |
|`src/pages/Raffle.jsx`        |`RAFFLE_CONTRACT` |Raffle/lottery contract  |

-----

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deployments.

-----

## 📖 Resources

- [OP_NET Documentation](https://docs.opnet.org)
- [OP_NET GitHub](https://github.com/btc-vision)
- [OPScan Explorer](https://opscan.org)
- [Motoswap](https://motoswap.org)
- [vibecode.finance Challenge](https://vibecode.finance)

-----

## 📜 License

MIT License — built for the OP_NET Vibecoding Challenge, Week 3: The Breakthrough.

-----

*Built on Bitcoin Layer 1. Secured by proof-of-work. Powered by OP_NET.*
