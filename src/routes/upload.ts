import {FastifyPluginAsync} from 'fastify';
import {s3Client, generateObjectCommand, getObjectUrl} from '../utils/s3Client';

const generateUniqFilename = (filename: string): string => {
  const ext = filename.split('.').pop();
  return `${new Date().getTime()}-${Math.floor(Math.random() * 1000)}.${ext}`;
};

const uploadRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post('/upload/single', {onRequest: [fastify.authenticate]}, async (request, reply) => {
    const file = await request.file();
    const buffer = await file.toBuffer();
    const key = generateUniqFilename(file.filename);
    const {ETag} = await s3Client.send(generateObjectCommand(buffer, key));
    const url = getObjectUrl(key);
    return {success: true, data: {ETag, url}};
  });
};

export default uploadRoute;
