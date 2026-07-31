# Blockchain-Based Academic Certification System

A permissioned, on-premises blockchain system for issuing, viewing, verifying, updating, and revoking academic certificates. Originally built on a cloud-hosted Polygon testnet with a Laravel + Node/Express + React stack; this version replaces the chain layer with a self-hosted **Hyperledger Fabric** network and consolidates the backend into a single **NestJS** service alongside a **Next.js (App Router)** frontend.

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Known Limitations](#known-limitations)

## Overview

Educational institutions issue digital certificates whose provenance is recorded on a permissioned ledger. Certificate JSON payloads live in IPFS; only an AES-encrypted CID, a hash, and issued/revoked flags are written on-chain. Two Fabric orgs model the two real-world roles: **UniversityOrg** issues/updates/revokes, **VerifierOrg** can only read. A single seeded issuer credential gates the mutating API endpoints (the original system had no authentication at all).

## System Architecture

```
web/   — Next.js (App Router, TypeScript) frontend
api/   — NestJS (TypeScript) backend: certificate, blockchain (Fabric Gateway),
         ipfs, crypto, and auth modules
infra/ — Hyperledger Fabric network (infra/fabric/test-network) + chaincode
         (infra/fabric/chaincode/certcc, written in Go)
```

`api/` is the single backend service — it absorbed both the old Laravel proxy's role and the old Express `node-app`'s blockchain/IPFS/crypto logic. There is no PHP and no second Node service.

Data flow for `issue`/`update`: `web/` (client component) → `web/app/api/certificate/*` route handler (attaches the issuer's JWT from an httpOnly cookie) → `api/` NestJS controller → Fabric Gateway (`api/src/blockchain`) + IPFS (`api/src/ipfs`) + AES/hash (`api/src/crypto`). `view`/`verify` are public reads and go straight from the browser to `api/`.

## Repository Layout

- `web/app/` — routes: `/` (issue, protected), `/login`, `/view-certificate` + `/view-certificate/[studentAddress]` (public), `/certificates/[studentAddress]/update` + `/revoke` (protected)
- `web/proxy.ts` — Next.js 16's renamed `middleware.ts`; redirects unauthenticated visits to protected pages
- `api/src/certificate/` — controller + service, the Laravel+node-app merge point
- `api/src/blockchain/` — Fabric Gateway client
- `api/src/ipfs/`, `api/src/crypto/`, `api/src/auth/`
- `infra/fabric/test-network/` — a 2-org (+ 1 orderer) Fabric network adapted from `hyperledger/fabric-samples`, CA-based crypto, LevelDB state DB, channel `certchannel`
- `infra/fabric/chaincode/certcc/` — Go chaincode implementing `IssueCertificate`, `ViewCertificate`, `VerifyCertificate`, `UpdateCertificate`, `RevokeCertificate`, with an explicit `Org1MSP`-only check on every mutating function (the direct fix for the old Solidity contract's missing `onlyOwner` on `updateCertificate`)

## Prerequisites

- Node.js ≥ 20 (`.nvmrc` pins `20`)
- Go ≥ 1.21 (only needed to rebuild/modify the chaincode)
- Docker Desktop (with Docker Compose v2)
- [jq](https://jqlang.org/) — required by the Fabric network scripts
- A local IPFS daemon ([Kubo](https://github.com/ipfs/kubo)) — `ipfs init && ipfs daemon`, listening on `127.0.0.1:5001`

**Windows/Git Bash users**: see the note under [Known Limitations](#known-limitations) — bringing the Fabric network up from Git Bash needs `MSYS_NO_PATHCONV=1` for the Docker step and a correctly-scoped `FABRIC_CFG_PATH` for the native Fabric CLI steps.

## Setup and Installation

### 1. Install workspace dependencies

```
npm install
```

This installs both `api/` and `web/` via npm workspaces (`package.json`'s `"workspaces": ["api", "web"]`).

### 2. Stand up the Fabric network

```
cd infra/fabric/test-network
export MSYS_NO_PATHCONV=1        # Windows/Git Bash only
./network.sh up -ca
unset MSYS_NO_PATHCONV           # Windows/Git Bash only
./network.sh createChannel -c certchannel
```

On Linux/macOS the `MSYS_NO_PATHCONV` lines are unnecessary. Verify with:

```
export FABRIC_CFG_PATH=$PWD/../config
. scripts/envVar.sh && setGlobals 1
peer channel getinfo -c certchannel
```

### 3. Deploy the chaincode

```
./network.sh deployCC -ccn certcc -ccp ../chaincode/certcc -ccl go -c certchannel
```

### 4. Configure and start the API

```
cp api/.env.example api/.env
# edit api/.env: set AES_SECRET_KEY, JWT_SECRET, and ISSUER_PASSWORD_HASH
# (generate a hash: node -e "require('bcrypt').hash('<password>',10).then(console.log)")
npm run dev:api
```

The Fabric paths in `api/.env.example` assume `api/` and `infra/` are sibling directories, which is the default layout.

### 5. Start IPFS and the frontend

```
ipfs daemon &
cp web/.env.example web/.env.local
npm run dev:web
```

Visit `http://localhost:3000`. Log in at `/login` with the credential you seeded in step 4 to issue/update/revoke certificates; `/view-certificate` works without logging in.

## Usage

1. `web/` runs on `http://localhost:3000`, `api/` on `http://localhost:3001`.
2. Log in as the issuer, then issue a certificate from `/`.
3. Anyone can look up a certificate at `/view-certificate` without logging in.
4. Update/revoke require being logged in and are linked from a certificate's view page.

## API Endpoints

All routes are served by `api/` (`http://localhost:3001`). `issue`/`update`/`revoke` require `Authorization: Bearer <jwt>` from `POST /auth/login`.

- `POST /auth/login` — `{ username, password }` → `{ accessToken }`
- `POST /certificate/issue` — protected
- `GET /certificate/view/:studentAddress` — public
- `GET /certificate/verify/:studentAddress` — public, returns `{ isValid }`
- `PATCH /certificate/update/:studentAddress` — protected
- `DELETE /certificate/revoke/:studentAddress` — protected

## Known Limitations

- **Single issuer identity**: the API signs every University-org transaction as the network's `Admin@org1.example.com` identity, and there is exactly one seeded issuer login (`ISSUER_USERNAME`/`ISSUER_PASSWORD_HASH`). Fine for a thesis demo; a real deployment would enroll a dedicated per-user Fabric identity and back auth with more than one credential.
- **Anchor peers / cross-org discovery**: set up manually via `scripts/setAnchorPeer.sh` rather than through `network.sh createChannel`'s own call to that script, which currently fails on Windows due to a `FABRIC_CFG_PATH` propagation quirk in that particular code path (documented for maintainers, not required for normal operation — the network functions correctly either way since `api/` connects to a specific known peer rather than relying on gossip-based discovery).
- **Docker Desktop stability (Windows)**: under sustained load, Docker Desktop's backend has been observed to die silently while its GUI process keeps running (`docker info` hangs, `wsl -d docker-desktop -- ps aux` shows no `dockerd`). If Fabric/IPFS calls start failing with `ECONNREFUSED`, check `docker ps`; if it errors, fully quit Docker Desktop, run `wsl --shutdown`, relaunch, then `docker start orderer.example.com peer0.org1.example.com peer0.org2.example.com` — ledger state (LevelDB, named volumes) survives this.
- **No production containerization yet**: `api/` and `web/` run directly via `npm run dev:*` in this setup; only the Fabric network itself is containerized.
