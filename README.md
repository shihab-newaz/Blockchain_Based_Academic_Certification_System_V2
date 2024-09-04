# Blockchain-Based Certificate Management System

This project implements a blockchain-based certificate management system with a React frontend, Laravel backend, and Node.js API for blockchain interactions.

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)


## Overview

This system allows educational institutions to issue, verify, and manage digital certificates on a blockchain. It provides a secure and transparent way to handle academic credentials, reducing fraud and simplifying the verification process.

## System Architecture
![Dapp-2024-07-12-063408](https://github.com/user-attachments/assets/1f9a7e45-d417-44a5-ac52-a8d082172e6a)


## Features

- Issue digital certificates on the blockchain
- View and verify certificates
- User-friendly interface for certificate management
- Secure storage of certificate data using IPFS
- Blockchain-based verification for tamper-proof certificates

## Technologies Used

- Frontend: React.js
- Backend: Laravel (PHP)
- Blockchain API: Node.js
- Smart Contract: Solidity
- Blockchain: Ethereum
- Storage: IPFS
- Additional: Ethers.js

## Setup and Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/blockchain-certificate-system.git
   ```

2. Setup Frontend (React)
   ```
   cd frontend
   npm install
   npm start
   ```

3. Setup Backend (Laravel)
   ```
   cd backend
   php artisan serve
   ```

4. Setup Blockchain API (Node.js)
   ```
   cd blockchain-api
   npm install
   node app.js
   ```

5. Configure environment variables for each component

## Usage

1. Access the frontend application at `http://localhost:3000`
2. Use the UI to issue new certificates or verify existing ones
3. Backend API is available at `http://localhost:8000/api`
4. Blockchain API runs on `http://localhost:3999`

## API Endpoints

### Laravel Backend

- `POST /api/issue-certificate`: Issue a new certificate
- `GET /api/view-certificate/{studentAddress}`: View a certificate
- `GET /api/verify-certificate/{studentAddress}`: Verify a certificate

### Node.js Blockchain API

- `POST /issue-certificate`: Issue a certificate on the blockchain
- `GET /view-certificate/:studentAddress`: Fetch certificate data from blockchain
- `GET /verify-certificate/:studentAddress`: Verify certificate on the blockchain


