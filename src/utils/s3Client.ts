import {PutObjectCommand, PutObjectCommandInput, S3Client} from '@aws-sdk/client-s3';
import {AWS_BUCKET, AWS_REGION} from './config';
const s3Client = new S3Client({region: AWS_REGION});

const generateObjectCommand = (buffer: Buffer, key: string): PutObjectCommand => {
  const params: PutObjectCommandInput = {
    Bucket: AWS_BUCKET,
    Key: key,
    Body: buffer,
  };
  const command = new PutObjectCommand(params);
  return command;
};

const getObjectUrl = (key: string): string => {
  return `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
};

export {s3Client, generateObjectCommand, getObjectUrl};
