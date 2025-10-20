# Personal Data Vault with Zama FHE

This repository hosts a full-stack decentralized application that lets users encrypt and store their private banking information directly on-chain using Zama's Fully Homomorphic Encryption (FHE) virtual machine. Card names remain visible to the owner, while card numbers and passwords stay encrypted end-to-end. The front end surfaces the encrypted payloads, and users can decrypt data on demand without ever exposing secrets to the network.

## Introduction

Traditional blockchain applications struggle with privacy when handling sensitive personal data. This project demonstrates how to protect banking credentials on a public network by combining Solidity smart contracts, Zama FHE primitives, and a React-based interface. Users can register multiple bank cards, preserve confidentiality through homomorphic encryption, and still retrieve plaintext values securely when required.

## Advantages

- **Confidential Storage**: Card numbers and passwords never exist on-chain in plaintext; they are encrypted with Zama FHE before submission.
- **User-Controlled Decryption**: Decryption requests are initiated from the front end, giving owners granular control over when data becomes readable.
- **Composable Contracts**: Built with Hardhat and the FHEVM toolchain, enabling rapid extension with new encrypted data types or access rules.
- **Seamless Wallet Experience**: RainbowKit-powered onboarding ensures quick wallet connections without compromising the security model.
- **Auditable and Transparent**: All encryption operations and contract interactions are verifiable on-chain while keeping secrets private.

## Technology Stack

- **Smart Contracts**: Solidity on Hardhat with Zama's FHEVM libraries.
- **Encryption**: Zama SDK for homomorphic encryption of numeric fields (card numbers and passwords).
- **Deployment**: Hardhat Deploy scripts for local nodes and Sepolia, leveraging `process.env.INFURA_API_KEY` and `dotenv.config()`.
- **Frontend**: React + Vite application using viem for reads and ethers for writes, integrated with RainbowKit for wallet connectivity.
- **Tooling**: TypeScript configuration, npm package management, and comprehensive Hardhat tasks/tests for automation.

## Problem Statement & Solution

- **The Challenge**: Traditional dApps expose every stored value to the public ledger, making it unsafe to record private credentials.
- **Our Approach**: Encrypt all sensitive fields with Zama FHE before they hit the blockchain and store only ciphertext. The contract enforces structured storage, while the front end fetches ABI definitions from `deployments/sepolia` to ensure consistency. Controlled decryption flows allow authorized users to recover plaintext locally.
- **Outcome**: A reusable template for privacy-preserving financial data management that can be adapted to additional personal records, KYC-free compliance, or organizational credential vaults.

## Solution Overview

- **Data Model**: Each user record stores a visible card name (`string`) and encrypted numeric fields for card number and password.
- **Smart Contract Flow**: Contracts provide functions to create, list, and decrypt card information without relying on `msg.sender` inside view methods, respecting best practices for FHEVM development.
- **Frontend Experience**: Users see a dashboard of card names with encrypted payloads. A decrypt button triggers the reveal workflow, leveraging Zama relayer patterns described in `docs/zama_doc_relayer.md`.
- **Security Controls**: Enforcement of private key deployments (no mnemonic usage) and prohibition of local storage or mock data keeps the application aligned with project policies.

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Environment Configuration**
   - Create a `.env` file or Hardhat vars containing `INFURA_API_KEY` and the deployment private key as required by `hardhat.config.ts`.
   - Ensure `import * as dotenv from "dotenv"; dotenv.config();` is active so the deploy scripts pick up configuration values.
3. **Compile Contracts**
   ```bash
   npm run compile
   ```
4. **Run Tests and Tasks**
   ```bash
   npm run test
   npx hardhat run tasks/<task-name>.ts --network localhost
   ```
5. **Local Deployment**
   ```bash
   npx hardhat node
   npx hardhat deploy --network localhost
   ```
6. **Sepolia Deployment**
   ```bash
   npx hardhat deploy --network sepolia
   ```
7. **Frontend Development**
   ```bash
   npm run dev
   ```
   The UI connects to the deployed contract, reads with viem, writes with ethers, and consumes ABI artifacts copied from `deployments/sepolia`.

## Directory Guide

- `contracts/`: Zama FHE-enabled Solidity contracts that define encrypted card storage logic.
- `deploy/`: Deployment scripts targeting local nodes and Sepolia with private key authentication.
- `tasks/`: Hardhat task definitions for automation, maintenance, and encryption workflows.
- `test/`: Hardhat tests verifying encrypted data handling and contract invariants.
- `src/`: React + Vite front end rendering card lists, decrypt actions, and wallet flows without Tailwind or local storage.
- `docs/`: Additional guidance on Zama FHE usage (`@docs/zama_llm.md`, `@docs/zama_doc_relayer.md`).

## Use Cases

- **Personal Banking Vault**: Securely track multiple bank cards with zero plaintext exposure.
- **Enterprise Credential Custody**: Extend the model to store encrypted account credentials for teams.
- **Compliance-Safe Record Keeping**: Maintain auditable yet private data for financial reporting or proof of possession.

## Future Roadmap

- **Granular Access Policies**: Introduce role-based permissions or delegable decryption rights for trusted contacts.
- **Enhanced Analytics**: Build privacy-preserving statistics, such as card usage counts, using homomorphic operations.
- **Mobile Interface**: Deliver a mobile-first UI that maintains the same encryption guarantees.
- **Expanded Data Types**: Support additional encrypted attributes like billing addresses or security questions.
- **Automated Auditing**: Integrate verifiable logs and alerting for unusual decrypt requests.

## Contributing & Support

- **Testing**: Please run `npm run test` after making contract changes and ensure deployment scripts remain compatible with both local nodes and Sepolia.
- **Issues**: Use the repository's issue tracker to report bugs or propose enhancements.
- **Resources**: Refer to Zama's official documentation for deeper insights into FHEVM patterns and relayer architecture.

---

This project showcases how FHE can unlock privacy-first decentralized applications without sacrificing transparency or control.
