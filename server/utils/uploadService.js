const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

require('dotenv').config();

const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLAREACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
    },
});

const uploadToR2 = async (file, key) => {
  const params = {
    Bucket: process.env.BUCKETNAME, 
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    await r2Client.send(new PutObjectCommand(params));
    return `https://pub-6b96f417093a486da53cc210ae449e47.r2.dev/${key}`;
  } catch (error) {
    console.error('R2 Upload Error:', error);
    throw new Error('Failed to upload file to R2');
  }
};

module.exports = uploadToR2;
