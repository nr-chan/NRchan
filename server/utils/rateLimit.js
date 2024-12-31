const MAX_UPLOADS = 3;

const uploadCounts = {};

const rateLimiter = (req, res, next) => {
  const userIp = req.headers['ip'];

  if (!userIp) {
    return res.status(400).send('IP address is required.');
  }

  const now = Date.now();

  if (!uploadCounts[userIp]) {
    uploadCounts[userIp] = { count: 0, resetTime: now + 86400000 }
  }

  const ipData = uploadCounts[userIp];

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