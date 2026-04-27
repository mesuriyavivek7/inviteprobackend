import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient?.isReady) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
  }

  redisClient = createClient({ url: redisUrl });
  redisClient.on("error", (error) => {
    console.error("Redis connection error", error);
  });

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
};
