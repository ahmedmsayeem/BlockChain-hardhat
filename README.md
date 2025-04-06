# 🔐 Bun + Hardhat + React Blockchain Project

This project is a minimal full-stack blockchain app using **Bun**, **Hardhat**, and **React**. It includes a smart contract for logging database operations (Insert, Update, Delete) on-chain and a frontend to display them chronologically using styled cards via **Tailwind CSS**.

---

## 🚀 Getting Started

### 🛠️ Prerequisites

- [Bun](https://bun.sh)
- [Node.js](https://nodejs.org/)
- [MetaMask](https://metamask.io)
- [Git](https://git-scm.com) (optional)

---

## ⚙️ Setup & Run

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd <your-project>

# 2. Install dependencies
bun install

# 3. Compile the smart contract
bunx hardhat compile

# 4. Start a local Hardhat node
bunx hardhat node #needed for next step to work

# 5. Deploy the contract using Hardhat Ignition
bunx hardhat ignition deploy ignition/modules/logger.js --network localhost
```

# frontend
copy artifacts/contracts/DBLogger.json into SRC

edit private_key,ADDRESS and nide url in component and scripts under ./scripts

bun i , bun start

# Db manipulation - refer ./scripts 

1. initdb.ts - to init sqlitdb
2. interaction.ts - to manipulate db and record in blockchain
3. verifyBlockChain.ts - to see the changes over time, also visible in frontend
