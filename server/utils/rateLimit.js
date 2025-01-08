const {validate, version} = require('uuid');
const MAX_UPLOADS = 200;

const uploadCounts = {};

const rateLimiter = (req, res, next) => {
  const uuid = req.headers['uuid'];

  if (!validate(uuid) || version(uuid) != 4) {
    return res.status(400).send('UUID is required.');
  }

  const now = Date.now();

  if (!uploadCounts[uuid]) {
    uploadCounts[uuid] = { count: 0, resetTime: now + 86400000 }
  }

  const ipData = uploadCounts[uuid];

  if (now > ipData.resetTime) {
    ipData.count = 0;
    ipData.resetTime = now + 86400000;
  }

  if (ipData.count >= MAX_UPLOADS) {
    return res.status(429).send('Rate limit exceeded. Try again tomorrow.');
  }

  ipData.count += 1;
  next();
};

module.exports = rateLimiter;
