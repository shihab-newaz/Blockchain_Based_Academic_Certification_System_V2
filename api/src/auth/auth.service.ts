import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Single-issuer credential store for v1 (see plan Phase 4a): the University
// has exactly one issuer account, seeded via env vars rather than a full
// user table. The resulting JWT is what authorizes issue/update/revoke
// requests — the system has zero authentication before this rewrite.
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<{ accessToken: string }> {
    const expectedUsername = this.configService.getOrThrow<string>('ISSUER_USERNAME');
    const passwordHash = this.configService.getOrThrow<string>('ISSUER_PASSWORD_HASH');

    const usernameMatches = username === expectedUsername;
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!usernameMatches || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({ sub: username, role: 'issuer' });
    return { accessToken };
  }
}
