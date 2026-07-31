import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { createHash } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly secretKey: string;

  constructor(configService: ConfigService) {
    this.secretKey = configService.getOrThrow<string>('AES_SECRET_KEY');
  }

  encrypt(plainText: string): string {
    return CryptoJS.AES.encrypt(plainText, this.secretKey).toString();
  }

  decrypt(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  sha256Hex(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}
