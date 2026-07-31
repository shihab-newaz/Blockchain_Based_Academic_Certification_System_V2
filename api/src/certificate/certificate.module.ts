import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { CryptoModule } from '../crypto/crypto.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BlockchainModule, IpfsModule, CryptoModule, AuthModule],
  providers: [CertificateService],
  controllers: [CertificateController],
})
export class CertificateModule {}
