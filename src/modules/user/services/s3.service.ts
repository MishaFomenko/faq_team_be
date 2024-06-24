import { PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EAwsBucketPath } from 'src/common/enums/aws-bucket-path.enum';

@Injectable()
export class S3Service {
  private client: S3Client;
  private awsConfig: {
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
  };

  constructor(private readonly configService: ConfigService) {
    this.awsConfig = {
      accessKey: this.configService.get<string>('AWS_ACCESS_KEY'),
      secretKey: this.configService.get<string>('AWS_SECRET_KEY'),
      bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      region: this.configService.get<string>('AWS_S3_REGION'),
    };

    const params: S3ClientConfig = {
      region: this.awsConfig.region,
      credentials: {
        accessKeyId: this.awsConfig.accessKey,
        secretAccessKey: this.awsConfig.secretKey,
      },
    };

    this.client = new S3Client(params);
  }

  public async uploadFile(
    file: Express.Multer.File,
    itemType: EAwsBucketPath,
    name: string,
  ): Promise<string> {
    const filePath = this.buildPath(itemType, name, file.originalname);

    await this.client.send(
      new PutObjectCommand({
        Key: filePath,
        ACL: 'public-read',
        Bucket: this.awsConfig.bucket,
        Body: file.buffer,
      }),
    );

    return `https://${this.awsConfig.bucket}.s3.${this.awsConfig.region}.amazonaws.com/${filePath}`;
  }

  private buildPath(itemType: string, name: string, fileName: string): string {
    return `${itemType}/${name}/${crypto.randomUUID()}${fileName}`;
  }
}
