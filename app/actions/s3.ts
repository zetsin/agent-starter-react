import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // needed with minio?
});

export const listContents = async (prefix: string = '') => {
  const files: string[] = [];
  const folders: string[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/',
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    response.Contents?.forEach((item) => {
      if (item.Key) {
        files.push(item.Key);
      }
    });

    response.CommonPrefixes?.forEach((item) => {
      if (item.Prefix) {
        folders.push(item.Prefix);
      }
    });

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return { files, folders };
};

export const getPresignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
  return url;
};
