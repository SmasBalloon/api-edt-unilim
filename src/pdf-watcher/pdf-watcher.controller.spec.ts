import { Test, TestingModule } from '@nestjs/testing';
import { PdfWatcherController } from './pdf-watcher.controller';

describe('PdfWatcherController', () => {
  let controller: PdfWatcherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfWatcherController],
    }).compile();

    controller = module.get<PdfWatcherController>(PdfWatcherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
