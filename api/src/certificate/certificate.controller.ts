import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('issue')
  @UseGuards(JwtAuthGuard)
  issue(@Body() dto: IssueCertificateDto) {
    return this.certificateService.issue(dto);
  }

  @Get('view/:studentAddress')
  view(@Param('studentAddress') studentAddress: string) {
    return this.certificateService.view(studentAddress);
  }

  @Get('verify/:studentAddress')
  async verify(@Param('studentAddress') studentAddress: string) {
    const isValid = await this.certificateService.verify(studentAddress);
    return { isValid };
  }

  @Patch('update/:studentAddress')
  @UseGuards(JwtAuthGuard)
  update(@Param('studentAddress') studentAddress: string, @Body() dto: UpdateCertificateDto) {
    return this.certificateService.update(studentAddress, dto);
  }

  @Delete('revoke/:studentAddress')
  @UseGuards(JwtAuthGuard)
  async revoke(@Param('studentAddress') studentAddress: string) {
    await this.certificateService.revoke(studentAddress);
    return { success: true };
  }
}
