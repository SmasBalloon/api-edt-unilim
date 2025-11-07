import { Controller, OnModuleInit } from '@nestjs/common';
import { PdfWatcherService } from './pdf-watcher.service.js';
import { PdfDownloaderService } from '../pdf-downloader/pdf-downloader.service.js';
import fs from 'fs';

@Controller('pdf-watcher')
export class PdfWatcherController implements OnModuleInit {
  constructor(
    private readonly pdfWatcherService: PdfWatcherService,
    private readonly pdfDownloaderService: PdfDownloaderService,
  ) {}
  async onModuleInit(): Promise<void> {
    const dataA1 = await this.pdfWatcherService.getPagesA1();
    const dataA2 = await this.pdfWatcherService.getPagesA2();
    const dataA3 = await this.pdfWatcherService.getPagesA3();

    for (const href of dataA1) {
      const dest = `./pdf/A1/${href}`;
      if (fs.existsSync(dest)) {
        console.log('pdf already downloaded:', href);
      } else {
        const pdfUrl = `https://edt-iut-info.unilim.fr/edt/A1/${href}`;
        await this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
      }
    }

    for (const href of dataA2) {
      const dest = `./pdf/A2/${href}`;
      if (fs.existsSync(dest)) {
        console.log('pdf already downloaded:', href);
      } else {
        const pdfUrl = `https://edt-iut-info.unilim.fr/edt/A2/${href}`;
        await this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
      }
    }

    for (const href of dataA3) {
      const dest = `./pdf/A3/${href}`;
      if (fs.existsSync(dest)) {
        console.log('pdf already downloaded:', href);
      } else {
        const pdfUrl = `https://edt-iut-info.unilim.fr/edt/A3/${href}`;
        await this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
      }
    }
  }
}
