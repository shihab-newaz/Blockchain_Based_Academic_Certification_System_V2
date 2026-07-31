import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface KuboAddResponse {
  Hash: string;
}

// Ported from node-app/app.js's IPFS upload/fetch. Talks directly to a Kubo
// (IPFS Desktop) daemon's HTTP RPC API for content-addressed storage of
// certificate JSON payloads — no client library, since ipfs-http-client is
// ESM-only and doesn't interop with Nest's CommonJS build.
@Injectable()
export class IpfsService {
  private readonly timeoutMs = 10_000;

  constructor(private readonly configService: ConfigService) {}

  async upload(data: unknown): Promise<string> {
    const ipfsUrl = this.configService.getOrThrow<string>('IPFS_URL');
    const buffer = Buffer.from(JSON.stringify(data));

    const form = new FormData();
    form.append('file', new Blob([buffer]));

    const response = await this.fetchWithTimeout(`${ipfsUrl}/api/v0/add`, { method: 'POST', body: form });
    if (!response.ok) {
      throw new Error(`IPFS add failed with status ${response.status}`);
    }

    const text = await response.text();
    const parsed = JSON.parse(text.trim().split('\n')[0]) as KuboAddResponse;
    return parsed.Hash;
  }

  async fetch<T = unknown>(cid: string): Promise<T> {
    const ipfsUrl = this.configService.getOrThrow<string>('IPFS_URL');
    const response = await this.fetchWithTimeout(`${ipfsUrl}/api/v0/cat?arg=${encodeURIComponent(cid)}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`IPFS cat failed with status ${response.status}`);
    }

    const text = await response.text();
    return JSON.parse(text) as T;
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }
}
