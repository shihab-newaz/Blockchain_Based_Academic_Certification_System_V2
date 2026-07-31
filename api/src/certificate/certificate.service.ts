import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { CryptoService } from '../crypto/crypto.service';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { mapFabricError } from './fabric-error.util';

export interface CertificatePayload {
  studentName: string;
  roll: string;
  degreeName: string;
  subject: string;
  studentAddress: string;
  issueTimestamp: number;
  expiration: number;
}

// The merge point for what Laravel's CertificateController and node-app's
// Express routes used to do separately: upload to IPFS, AES-encrypt the CID,
// hash it, then read/write the Fabric ledger. Unlike the old stack, revoke
// and update are implemented end-to-end here for the first time.
@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly ipfsService: IpfsService,
    private readonly cryptoService: CryptoService,
  ) {}

  async issue(dto: IssueCertificateDto): Promise<{ cid: string }> {
    const payload: CertificatePayload = {
      studentName: dto.studentName,
      roll: dto.roll,
      degreeName: dto.degreeName,
      subject: dto.subject,
      studentAddress: dto.studentAddress,
      issueTimestamp: Math.floor(Date.now() / 1000),
      expiration: dto.expiry,
    };

    const cid = await this.ipfsService.upload(payload);
    const encryptedData = this.cryptoService.encrypt(cid);
    const dataHash = this.cryptoService.sha256Hex(encryptedData);

    try {
      await this.blockchainService.issueCertificate(dto.studentAddress, encryptedData, dataHash);
    } catch (error) {
      this.logger.error(`issueCertificate failed for ${dto.studentAddress}`, error as Error);
      throw mapFabricError(error);
    }

    return { cid };
  }

  async view(studentAddress: string): Promise<CertificatePayload> {
    try {
      const record = await this.blockchainService.viewCertificate(studentAddress);
      const cid = this.cryptoService.decrypt(record.encryptedData);
      return await this.ipfsService.fetch<CertificatePayload>(cid);
    } catch (error) {
      this.logger.error(`viewCertificate failed for ${studentAddress}`, error as Error);
      throw mapFabricError(error);
    }
  }

  async verify(studentAddress: string): Promise<boolean> {
    try {
      return await this.blockchainService.verifyCertificate(studentAddress);
    } catch (error) {
      this.logger.error(`verifyCertificate failed for ${studentAddress}`, error as Error);
      throw mapFabricError(error);
    }
  }

  async update(studentAddress: string, dto: UpdateCertificateDto): Promise<{ cid: string }> {
    const payload: CertificatePayload = {
      studentName: dto.studentName,
      roll: dto.roll,
      degreeName: dto.degreeName,
      subject: dto.subject,
      studentAddress,
      issueTimestamp: Math.floor(Date.now() / 1000),
      expiration: dto.expiry,
    };

    const cid = await this.ipfsService.upload(payload);
    const encryptedData = this.cryptoService.encrypt(cid);
    const dataHash = this.cryptoService.sha256Hex(encryptedData);

    try {
      await this.blockchainService.updateCertificate(studentAddress, encryptedData, dataHash);
    } catch (error) {
      this.logger.error(`updateCertificate failed for ${studentAddress}`, error as Error);
      throw mapFabricError(error);
    }

    return { cid };
  }

  async revoke(studentAddress: string): Promise<void> {
    try {
      await this.blockchainService.revokeCertificate(studentAddress);
    } catch (error) {
      this.logger.error(`revokeCertificate failed for ${studentAddress}`, error as Error);
      throw mapFabricError(error);
    }
  }
}
