import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import { createPrivateKey } from 'crypto';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

export interface CertificateRecord {
  recipient: string;
  encryptedData: string;
  dataHash: string;
  isIssued: boolean;
  isRevoked: boolean;
}

// Talks to the on-prem Hyperledger Fabric network (infra/fabric) via the
// Fabric Gateway gRPC API, replacing node-app/app.js's ethers.js Contract
// client. Connects once as the University org's enrolled identity and reuses
// the connection for the lifetime of the process.
@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private grpcClient: grpc.Client | undefined;
  private gateway: Gateway | undefined;
  private contract: Contract | undefined;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const client = await this.newGrpcConnection();
    const identity = await this.newIdentity();
    const signer = await this.newSigner();

    this.grpcClient = client;
    this.gateway = connect({ client, identity, signer });

    const channelName = this.configService.getOrThrow<string>('FABRIC_CHANNEL_NAME');
    const chaincodeName = this.configService.getOrThrow<string>('FABRIC_CHAINCODE_NAME');
    const network = this.gateway.getNetwork(channelName);
    this.contract = network.getContract(chaincodeName);

    this.logger.log(`Connected to Fabric channel '${channelName}', chaincode '${chaincodeName}'`);
  }

  onModuleDestroy(): void {
    this.gateway?.close();
    this.grpcClient?.close();
  }

  async issueCertificate(recipient: string, encryptedData: string, dataHash: string): Promise<void> {
    await this.getContract().submitTransaction('IssueCertificate', recipient, encryptedData, dataHash);
  }

  async updateCertificate(recipient: string, encryptedData: string, dataHash: string): Promise<void> {
    await this.getContract().submitTransaction('UpdateCertificate', recipient, encryptedData, dataHash);
  }

  async revokeCertificate(recipient: string): Promise<void> {
    await this.getContract().submitTransaction('RevokeCertificate', recipient);
  }

  async viewCertificate(recipient: string): Promise<CertificateRecord> {
    const result = await this.getContract().evaluateTransaction('ViewCertificate', recipient);
    return JSON.parse(Buffer.from(result).toString('utf8')) as CertificateRecord;
  }

  async verifyCertificate(recipient: string): Promise<boolean> {
    const result = await this.getContract().evaluateTransaction('VerifyCertificate', recipient);
    return Buffer.from(result).toString('utf8') === 'true';
  }

  private getContract(): Contract {
    if (!this.contract) {
      throw new Error('Fabric contract is not initialized yet');
    }
    return this.contract;
  }

  private async newGrpcConnection(): Promise<grpc.Client> {
    const peerEndpoint = this.configService.getOrThrow<string>('FABRIC_PEER_ENDPOINT');
    const peerHostAlias = this.configService.getOrThrow<string>('FABRIC_PEER_HOST_ALIAS');
    const tlsCertPath = this.configService.getOrThrow<string>('FABRIC_TLS_CERT_PATH');

    const tlsRootCert = await readFile(tlsCertPath);
    const credentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, credentials, {
      'grpc.ssl_target_name_override': peerHostAlias,
    });
  }

  private async newIdentity(): Promise<Identity> {
    const mspId = this.configService.getOrThrow<string>('FABRIC_MSP_ID');
    const certPath = this.configService.getOrThrow<string>('FABRIC_CERT_PATH');
    const credentials = await readFile(certPath);
    return { mspId, credentials };
  }

  private async newSigner(): Promise<Signer> {
    const keyDirectoryPath = this.configService.getOrThrow<string>('FABRIC_KEY_DIRECTORY_PATH');
    const files = await readdir(keyDirectoryPath);
    if (files.length === 0) {
      throw new Error(`No private key found in ${keyDirectoryPath}`);
    }
    const keyPath = join(keyDirectoryPath, files[0]);
    const privateKeyPem = await readFile(keyPath);
    const privateKey = createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
  }
}
