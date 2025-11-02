import { Test, TestingModule } from '@nestjs/testing';
import { PdfDownloaderController } from './pdf-downloader.controller.js';

describe('PdfDownloaderController', () => {
  let controller: PdfDownloaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfDownloaderController],
    }).compile();

    controller = module.get<PdfDownloaderController>(PdfDownloaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
