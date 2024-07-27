import { create } from 'ipfs-http-client';
  export function createIPFSclient() {
    const client = create({
        host: '127.0.0.1',
        port: 5001,
        protocol: 'http',
      });
  
    return client;
  }