import { Controller, Get } from '@nestjs/common';
import { PdfWatcherService } from './pdf-watcher.service.js';

@Controller('pdf-watcher')
export class PdfWatcherController {
  constructor(private readonly pdfWatcherService: PdfWatcherService) {}

  @Get('A1')
  async getPagesA1(): Promise<string[]> {
    return await this.pdfWatcherService.getPagesA1();
  }

  @Get('A2')
  async getPagesA2(): Promise<string[]> {
    return await this.pdfWatcherService.getPagesA2();
  }

  @Get('A3')
  async getPagesA3(): Promise<string[]> {
    return await this.pdfWatcherService.getPagesA3();
  }
}
