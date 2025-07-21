# Pixel Pandemonium 🎨💥

**A chaotic, collaborative, on-chain pixel art canvas built for the Monad Mission 6 Hackathon.**

---

### What is Pixel Pandemonium?

Pixel Pandemonium is a real-time, multiplayer dApp where users can collaboratively create pixel art. However, there's a chaotic twist: every time a user places a pixel, the canvas fights back by changing another random pixel to a random color. The goal isn't to create a masterpiece, but to embrace the chaos and have fun in a truly "left-curve" on-chain experience.

To participate in the pandemonium, each pixel placement requires a tiny "ticket" fee, paid via a transaction on the **Monad Testnet**.

### How It Works: The Tech Stack

This project is a modern dApp that combines a reactive frontend with a real-time collaborative backend and on-chain interactions.

* **Frontend:** Built with **React** and **Vite** for a fast, modern user experience.
* **Web3 Connectivity:** Uses **Wagmi** and **RainbowKit** to seamlessly connect to users' wallets (like MetaMask).
* **Real-Time Collaboration (The Multisynq Requirement):** Powered by the **Multisynq Client SDK** (`@multisynq/client`). We adopted the core Model-View architecture to create a stable, real-time, and synchronized experience for all users, loading the library directly as per the official "Hello World" examples.
* **Smart Contract:** A simple `PixelPayment.sol` contract, written in **Solidity** and deployed on the **Monad Testnet**, acts as a ticket machine.
* **Deployment:** The frontend is deployed on **Vercel** for public access.

### How It Meets the Hackathon Rules

We designed Pixel Pandemonium specifically to meet and exceed the requirements of Mission 6.

1.  **✅ Is it open source?**
    * Yes. The entire codebase is publicly available in this GitHub repository.

2.  **✅ Does it use Multisynq in some novel way?**
    * Yes. We use Multisynq's core SDK to manage the state of our collaborative canvas. The "novel" part is our **chaotic rule engine** built into the `CanvasModel`. Instead of just synchronizing user input, the model itself introduces chaos by changing a random pixel on every user action. This turns Multisynq from a simple state-sharing tool into the engine of our "pandemonium".

3.  **✅ Does it interact with Monad Testnet?**
    * Yes. Every single pixel placement is gated by an on-chain transaction. Users must call the `placePixel()` function on our deployed smart contract and pay a `0.00001 MON` fee, proving a direct and meaningful interaction with the Monad Testnet for the core functionality of the app.

4.  **✅ Bonus: Is it silly and/or left curve?**
    * Absolutely! The core concept of a canvas that actively sabotages the users' creations is inherently silly. It subverts the traditional goal of pixel art (creation) and replaces it with a fun, unpredictable, and chaotic experience (pandemonium).

### How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [URL_OF_YOUR_GITHUB_REPO]
    cd pixel-pandemonium
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    * Create a `.env` file in the root of the project.
    * Add your Multisynq credentials:
        ```env
        VITE_CROQUET_APP_ID="io.pixelpandemonium.hackathon"
        VITE_CROQUET_API_KEY="YOUR_API_KEY_HERE"
        ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Connect your wallet:**
    * Open the app in your browser.
    * Make sure your MetaMask (or other wallet) is connected to the Monad Testnet.
    * Get some testnet MON from a faucet if you don't have any.

## Environment Variables

Create a `.env` file with the following variables:

```env
# Multisynq Configuration
VITE_CROQUET_APP_ID="io.pixelpandemonium.hackathon"
VITE_CROQUET_API_KEY="YOUR_CROQUET_API_KEY"

# WalletConnect Configuration  
VITE_WALLETCONNECT_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"

# IPFS Configuration (for NFT minting)
VITE_PINATA_API_KEY="YOUR_PINATA_API_KEY"
VITE_PINATA_SECRET_KEY="YOUR_PINATA_SECRET_KEY"
```

## Smart Contracts

- **Pixel Payment Contract:** `0xD32537f579f105cF9C6C31AA9e6C1AAcb2B6A015`
- **Pixel NFT Contract:** `0x587E5258F5E9cda344490D59526D0A45D3d1AA53` ✅ **DEPLOYED**

## Real NFT Minting

The app now supports **real NFT minting** on Monad Testnet:

1. **Image Upload:** Canvas captures are uploaded to IPFS via Pinata
2. **Metadata Creation:** ERC-721 compatible metadata with attributes
3. **Blockchain Minting:** Real smart contract interaction with 0.001 MON fee
4. **Transaction Tracking:** Full transaction confirmation process

### Contract Details:
- **Network:** Monad Testnet
- **Contract:** `0x587E5258F5E9cda344490D59526D0A45D3d1AA53`
- **Explorer:** [View on Monad Explorer](https://testnet.monadexplorer.com/address/0x587E5258F5E9cda344490D59526D0A45D3d1AA53)

### Links

**Live Demo:** [https://pixel-pandemonium.vercel.app/](https://pixel-pandemonium-theta.vercel.app/)
**GitHub Repository:** [https://github.com/liugegen/pixel-pandemonium](https://github.com/liugegen/pixel-pandemonium)
**Smart Contract on Monad Explorer:** [0xD32537f579f105cF9C6C31AA9e6C1AAcb2B6A015](https://testnet.monadexplorer.com/address/0xD32537f579f105cF9C6C31AA9e6C1AAcb2B6A015)

### Submission Instructions

- Submit your project to the hackathon via Tally: [https://tally.so/r/mBoPxY](https://tally.so/r/mBoPxY)
- Make sure your Vercel link and GitHub repo are included in your submission.

### Resources

- [Multisynq Resources](https://monad-foundation.notion.site/multisynq-resources)
- [Smart Contract on Monad Explorer](https://testnet.monadexplorer.com/address/0xD32537f579f105cF9C6C31AA9e6C1AAcb2B6A015)
- [Live Demo](https://pixel-pandemonium.vercel.app/)
- [GitHub Repository](https://github.com/liugegen/pixel-pandemonium)
