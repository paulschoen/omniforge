import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GridFSBucket, MongoClient } from 'mongodb';
import { Types } from 'mongoose';

@Injectable()
export class GridFSService {
  private readonly logger = new Logger(GridFSService.name);
  private bucket!: GridFSBucket;

  constructor() {
    this.initializeGridFS().catch((error: unknown) => {
      this.logger.error('Error initializing GridFS:', error);
      throw new InternalServerErrorException('Failed to initialize GridFS');
    });
  }

  private async initializeGridFS(): Promise<void> {
    const connectionString = process.env.MONGODB_CONNECTION_STRING;
    if (!connectionString) {
      this.logger.error('MONGODB_CONNECTION_STRING is not defined');
      throw new InternalServerErrorException(
        'Database connection string not set',
      );
    }

    try {
      const client = new MongoClient(connectionString);
      await client.connect();
      const db = client.db('codex-engine');
      this.bucket = new GridFSBucket(db);
      this.logger.log('GridFS initialized successfully');
    } catch (error: unknown) {
      this.logger.error('Error connecting to MongoDB:', error);
      throw new InternalServerErrorException('Failed to connect to MongoDB');
    }
  }

  async uploadFile(
    createReadStream: () => NodeJS.ReadableStream,
    filename: string,
  ): Promise<string> {
    const uploadStream = this.bucket.openUploadStream(filename);
    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(uploadStream)
        .on('finish', () => {
          resolve(uploadStream.id.toString());
        })
        .on('error', (error) => {
          this.logger.error('Error during image upload:', error);
          reject(new InternalServerErrorException('Image upload failed'));
        });
    });
  }

  async downloadImageAsBase64(imageId: string): Promise<string> {
    this.logger.log(`Fetching image as Base64 for image ID: ${imageId}`);
    const stream = this.bucket.openDownloadStream(new Types.ObjectId(imageId));
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('base64'));
      });
      stream.on('error', (err) => {
        this.logger.error(`Error fetching image with ID: ${imageId}`, err);
        reject(new InternalServerErrorException('Failed to fetch image'));
      });
    });
  }
}
