import { Module } from '@nestjs/common';
import { EdtController } from './edt.controller.js';
import { EdtService } from './edt.service.js';

@Module({
  controllers: [EdtController],
  providers: [EdtService],
})
export class EdtModule {}
