import { Controller, Get, Param } from '@nestjs/common';
import { PdfDownloaderService } from './pdf-downloader.service.js';
import fs from 'fs';

@Controller('pdf-downloader')
export class PdfDownloaderController {
  constructor(private readonly pdfDownloaderService: PdfDownloaderService) {}

  @Get(':annee')
  async DownloadPdf(@Param('annee') annee: string) {
    const years = annee.replace('.pdf', ' ').split('_')[0];
    const pdfUrl = `https://edt-iut-info.unilim.fr/edt/${years}/${annee}`;
    const dest = `./pdf/${years}/${annee}`;
    if (!fs.existsSync(dest)) {
      await this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
    }
  }
}
