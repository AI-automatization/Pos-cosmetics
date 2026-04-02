/**
 * T-129: MinIO / S3-compatible file upload service
 * Endpoints: POST /upload, POST /upload/bulk, GET /upload/presign
 */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'text/csv': '.csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-excel': '.xls',
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicEndpoint: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT', 'http://localhost:9000');
    const accessKey = config.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = config.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    this.bucket = config.get<string>('MINIO_BUCKET', 'raos');
    this.publicEndpoint = config.get<string>('MINIO_PUBLIC_URL', endpoint);

    this.s3 = new S3Client({
      endpoint,
      region: 'us-east-1', // MinIO ignores region but SDK requires it
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true, // MinIO requires path-style
    });
  }

  /**
   * Upload a single file buffer to MinIO
   */
  async uploadOne(
    tenantId: string,
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<{ url: string; key: string; size: number; mimeType: string }> {
    this.validateFile(file);

    const ext = ALLOWED_MIME[file.mimetype] ?? path.extname(file.originalname);
    const key = `${tenantId}/${folder}/${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    this.logger.log(`Uploaded ${key} (${file.size} bytes)`);
    return {
      url: `${this.publicEndpoint}/${this.bucket}/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Upload multiple files (bulk)
   */
  async uploadMany(tenantId: string, files: Express.Multer.File[], folder = 'uploads') {
    return Promise.all(files.map((f) => this.uploadOne(tenantId, f, folder)));
  }

  /**
   * Generate a presigned GET URL (default 1 hour)
   */
  async presignGet(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }

  /**
   * Delete an object by key
   */
  async deleteOne(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    this.logger.log(`Deleted ${key}`);
  }

  private validateFile(file: Express.Multer.File) {
    if (!ALLOWED_MIME[file.mimetype]) {
      throw new BadRequestException(`Fayl turi ruxsat etilmagan: ${file.mimetype}`);
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(`Fayl hajmi 10 MB dan oshmasligi kerak`);
    }
  }
}
