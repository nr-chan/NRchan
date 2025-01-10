const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require('sharp');
const path = require('path');

require('dotenv').config();

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLAREACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

const getRandomSize = () => {
  // Generate a random size between 80-140px for width of the image
  return Math.floor(Math.random() * (150 - 120 + 1)) + 120;
};

const uploadToR2 = async (file, key) => {
  const isImage = file.mimetype.startsWith('image/');

  if (isImage) {
    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      const thumbnailSize = getRandomSize();
      const aspectRatio = metadata.width / metadata.height;

      let resizeOptions;
      if (aspectRatio >= 1) {
        resizeOptions = {
          width: thumbnailSize,
          height: Math.round(thumbnailSize / aspectRatio)
        };
      } else {
        resizeOptions = {
          width: Math.round(thumbnailSize * aspectRatio),
          height: thumbnailSize
        };
      }

      const smallBuffer = await image
        .resize(resizeOptions.width, resizeOptions.height, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .toBuffer();

      const extension = path.extname(key);
      const baseKey = key.slice(0, -extension.length);
      const smallKey = `${baseKey}s${extension}`;

      const originalParams = {
        Bucket: process.env.BUCKETNAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const smallParams = {
        Bucket: process.env.BUCKETNAME,
        Key: smallKey,
        Body: smallBuffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      await Promise.all([
        r2Client.send(new PutObjectCommand(originalParams)),
        r2Client.send(new PutObjectCommand(smallParams))
      ]);
      console.log()
      return {
        url: `https://pub-6b96f417093a486da53cc210ae449e47.r2.dev/${key}`,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        thumbnailWidth: resizeOptions.width,
        thumbnailHeight: resizeOptions.height
      };

    } catch (error) {
      console.error('Image Processing/Upload Error:', error);
      throw new Error('Failed to process or upload image');
    }
  } else {
    const params = {
      Bucket: process.env.BUCKETNAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      await r2Client.send(new PutObjectCommand(params));
      return {
        url: `https://pub-6b96f417093a486da53cc210ae449e47.r2.dev/${key}`,
        size: file.size
      };
    } catch (error) {
      console.error('R2 Upload Error:', error);
      throw new Error('Failed to upload file to R2');
    }
  }
};

const deleteImage = async (url) => {
  if (!url) {
    console.log('URL not found');
    return;
  }
  if (typeof url !== 'string') {
    console.log('Invalid URL type: ', typeof url);
    return;
  }


  const key = 'uploads/' + url.split('/').pop();
  if (!key || key === 'uploads/') {
    console.log('Invalid key generated from url: ', url);
    return;
  }
  console.log('key: ', key)
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.BUCKETNAME,
      Key: key
    });

    await r2Client.send(deleteCommand);
    console.log(`Image ${key} deleted successfully.`);
  } catch (err) {
    console.error("Error deleting image:", err);
  }
};
module.exports = uploadToR2, deleteImage;
