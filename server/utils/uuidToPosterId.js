const crypto = require('crypto');
const {validate, version} = require('uuid');

const uuidToPosterId = async (req) => {
  return new Promise((resolve) => {

    const uuid = req.headers['uuid'];
    if (!validate(uuid) || version(uuid) != 4) {
      return resolve('000000');
    }

    setImmediate(() => {
      try {
        const hash = crypto.createHash('sha1')
          .update(uuid)
          .digest('hex');

        resolve(hash.slice(0, 6));
      } catch (error) {
        console.error('Error generating ID:', error);
        resolve('000000');
      }
    });
  });
};

module.exports = uuidToPosterId;
