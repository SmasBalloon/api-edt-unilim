import { Controller, Delete, Get, Param } from '@nestjs/common';
import { PdfDownloaderService } from './pdf-downloader.service.js';

@Controller('pdf-downloader')
export class PdfDownloaderController {
  constructor(private readonly pdfDownloaderService: PdfDownloaderService) {}

  @Get(':annee/:groupe')
  async DownloadPdf(
    @Param('annee') annee: number,
    @Param('groupe') groupe: number,
  ) {
    const pdfUrl = `https://edt-iut-info.unilim.fr/edt/A${annee}/A${annee}_S9.pdf`;
    const dest = `./pdf/A${annee}_S9.pdf`;
    this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
  }

  @Delete(':annee')
  async deletePdf(@Param('annee') annee: number) {
    const dest = `./pdf/A${annee}_S9.pdf`;
    await this.pdfDownloaderService.deletePdf(dest);
  }
}
