import { Test, TestingModule } from '@nestjs/testing';
import { PdfWatcherService } from './pdf-watcher.service';

describe('PdfWatcherService', () => {
  let service: PdfWatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfWatcherService],
    }).compile();

    service = module.get<PdfWatcherService>(PdfWatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
