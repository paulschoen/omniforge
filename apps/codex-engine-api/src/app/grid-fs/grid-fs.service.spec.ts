import { Test, type TestingModule } from '@nestjs/testing';
import { GridFSService } from './grid-fs.service';

describe('GridFsService', () => {
  let service: GridFSService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GridFSService],
    }).compile();

    service = module.get<GridFSService>(GridFSService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
