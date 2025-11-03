import { Module } from '@nestjs/common';
import { PdfDownloaderController } from './pdf-downloader.controller.js';
import { PdfDownloaderService } from './pdf-downloader.service.js';

@Module({
  controllers: [PdfDownloaderController],
  providers: [PdfDownloaderService],
})
export class PdfDownloaderModule {}
