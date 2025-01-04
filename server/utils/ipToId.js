const crypto = require('crypto');

const ipToID = async (req) => {
  return new Promise((resolve) => {
    const ip = req.headers['ip'];

    if (!ip) {
      return resolve('000000'); //default value
    }

    const ipv4 = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;

    setImmediate(() => {
      try {
        const hash = crypto.createHash('sha1')
          .update(ipv4)
          .digest('hex');

        resolve(hash.slice(0, 6));
      } catch (error) {
        console.error('Error generating ID:', error);
        resolve('000000');
      }
    });
  });
};

module.exports = ipToID;
