import Queue from 'bull';
import Redis from 'redis';

// Redis connection
const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
});

export const fileProcessingQueue = new Queue('file processing', {
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

// Job types
export const JOB_TYPES = {
  PROCESS_IMAGE: 'process_image',
  PROCESS_VIDEO: 'process_video',
  CLEANUP_TEMP: 'cleanup_temp'
};

// Add job to queue
export const addFileProcessingJob = async (jobType, data, options = {}) => {
  try {
    const job = await fileProcessingQueue.add(jobType, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 10,
      removeOnFail: 5,
      ...options
    });
    
    console.log(`Job ${jobType} added to queue:`, job.id);
    return job;
  } catch (error) {
    console.error('Error adding job to queue:', error);
    throw error;
  }
};