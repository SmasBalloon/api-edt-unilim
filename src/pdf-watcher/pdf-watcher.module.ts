import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PdfWatcherController } from './pdf-watcher.controller.js';
import { PdfWatcherService } from './pdf-watcher.service.js';
import { PdfDownloaderModule } from '../pdf-downloader/pdf-downloader.module.js';

@Module({
  controllers: [PdfWatcherController],
  providers: [PdfWatcherService],
  imports: [ScheduleModule.forRoot(), PdfDownloaderModule],
})
export class PdfWatcherModule {}
