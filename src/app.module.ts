import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EdtModule } from './edt/edt.module.js';
import { PdfDownloaderModule } from './pdf-downloader/pdf-downloader.module.js';
import { PdfWatcherModule } from './pdf-watcher/pdf-watcher.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EdtModule,
    PdfDownloaderModule,
    PdfWatcherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
