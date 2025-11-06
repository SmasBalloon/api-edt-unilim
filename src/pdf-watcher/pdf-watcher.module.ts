import { Module } from '@nestjs/common';
import { PdfWatcherController } from './pdf-watcher.controller';

@Module({
  controllers: [PdfWatcherController]
})
export class PdfWatcherModule {}
