import { Module } from '@nestjs/common';
import { PdfWatcherController } from './pdf-watcher.controller.js';
import { PdfWatcherService } from './pdf-watcher.service.js';

@Module({
  controllers: [PdfWatcherController],
  providers: [PdfWatcherService],
})
export class PdfWatcherModule {}
