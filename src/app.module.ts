import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EdtModule } from './edt/edt.module.js';
import { PdfDownloaderModule } from './pdf-downloader/pdf-downloader.module.js';
import { PdfDownloaderController } from './pdf-downloader/pdf-downloader.controller.js';
import { PdfDownloaderService } from './pdf-downloader/pdf-downloader.service.js';
import { PdfWatcherService } from './pdf-watcher/pdf-watcher.service';
import { PdfWatcherModule } from './pdf-watcher/pdf-watcher.module';

@Module({
  imports: [EdtModule, PdfDownloaderModule, PdfWatcherModule],
  controllers: [AppController, PdfDownloaderController],
  providers: [AppService, PdfDownloaderService, PdfWatcherService],
})
export class AppModule {}
