import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PdfWatcherController } from './pdf-watcher.controller.js';
import { PdfWatcherService } from './pdf-watcher.service.js';

@Module({
  controllers: [PdfWatcherController],
  providers: [PdfWatcherService],
  imports: [ScheduleModule.forRoot()],
})
export class PdfWatcherModule {}
