import { Controller, Get } from '@nestjs/common';
import { PdfWatcherService } from './pdf-watcher.service.js';

@Controller('pdf-watcher')
export class PdfWatcherController {
  constructor(private readonly pdfWatcherService: PdfWatcherService) {}

  @Get('A1')
  getPagesA1(): void {
    this.pdfWatcherService.getPagesA1();
  }

  @Get('A2')
  getPagesA2(): void {
    this.pdfWatcherService.getPagesA2();
  }

  @Get('A3')
  getPagesA3(): void {
    this.pdfWatcherService.getPagesA3();
  }
}
