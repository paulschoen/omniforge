import { Module } from '@nestjs/common';
import { GridFSService } from './grid-fs.service';

@Module({
  providers: [GridFSService],
  exports: [GridFSService],
})
export class GridFsModule {}
