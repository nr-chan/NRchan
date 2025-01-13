const { createClient } = require("redis");
const hash = require("object-hash");

let redisClient;

const initializeRedisClient = () => {
  const redisURL = process.env.REDIS_URI;
  if (!redisURL) throw new Error("REDIS_URI is not defined in the environment variables.");

  redisClient = createClient({ url: redisURL });
  redisClient.on("error", (e) => {
    console.error("Failed to create the Redis client with error:", e);
  });

  redisClient.connect()
    .then(() => console.log("Connected to Redis successfully!"))
    .catch((e) => {
      console.error("Connection to Redis failed with error:", e);
      throw e;
    });

  return redisClient;
};

function isRedisWorking() {
  return redisClient?.isOpen;
}

function requestToKey(req) {
  return `${req.baseUrl}${req.path}`;
}

async function writeData(key, data, options) {
  if (!isRedisWorking()) return;

  try {
    const serializedData = JSON.stringify(data);
    await redisClient.set(key, serializedData, options);
  } catch (e) {
    console.error(`Failed to cache data for key=${key}`, e);
  }
}

async function readData(key) {
  if (!isRedisWorking()) return undefined;

  try {
    const cachedValue = await redisClient.get(key);
    return cachedValue ? JSON.parse(cachedValue) : undefined;
  } catch (e) {
    console.error(`Failed to retrieve cached data for key=${key}`, e);
    return undefined;
  }
}

const redisCacheMiddleware = (
  options = {
    EX: 21600, // 6 hours expiry
  }
) => {
  return async (req, res, next) => {
    if (!isRedisWorking()) return next();

    const key = requestToKey(req);

    try {
      const cachedValue = await readData(key);
      if (cachedValue) {
        // Send cached response
        return res.status(200).json(cachedValue);
      }

      // Hook res.json to cache the response
      const originalJson = res.json.bind(res);

      res.json = async (data) => {
        try {
          if (res.statusCode.toString().startsWith("2")) {
            await writeData(key, data, options);
          }
        } catch (e) {
          console.error("Failed to cache response data:", e);
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Error in Redis middleware:", error);
      next();
    }
  };
};


const invalidateCache = async (key) => {
  if (!isRedisWorking()) return;
  try {
    await redisClient.del(key);
  } catch (e) {
    console.error(`Failed to invalidate cache for key=${key}`, e);
  }
};

module.exports = { initializeRedisClient, invalidateCache, redisCacheMiddleware };
