import { fileProcessingQueue, JOB_TYPES } from '../services/queueService.js';
import { MediaService } from '../services/mediaService.js';
import Post from '../models/Post.js';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blogdb');

// Process image job
fileProcessingQueue.process(JOB_TYPES.PROCESS_IMAGE, async (job) => {
  const { filePath, filename, postId, mediaIndex } = job.data;
  
  try {
    console.log(`Processing image: ${filename}`);
    console.log(`File path: ${filePath}`);
    console.log(`Current working directory: ${process.cwd()}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at: ${filePath}`);
      
      const possiblePaths = [
        path.join(process.cwd(), filePath),
        path.join('/app', filePath),
        path.join('/app/uploads/temp', filename),
        path.join('uploads/temp', filename)
      ];
      
      for (const possiblePath of possiblePaths) {
        console.log(`Checking: ${possiblePath} - exists: ${fs.existsSync(possiblePath)}`);
      }
      
      // Update status to failed
      await Post.findByIdAndUpdate(postId, {
        $set: { [`media.${mediaIndex}.status`]: 'failed' }
      });
      
      throw new Error(`File not found: ${filePath}`);
    }
    
    const processedData = await MediaService.processImage(filePath, filename);
    
    await Post.findByIdAndUpdate(postId, {
      $set: {
        [`media.${mediaIndex}.filename`]: processedData.processedFilename,
        [`media.${mediaIndex}.path`]: processedData.processedPath,
        [`media.${mediaIndex}.thumbnail`]: processedData.thumbnailFilename,
        [`media.${mediaIndex}.status`]: 'processed'
      }
    });
    
    await MediaService.deleteFile(filePath);
    
    console.log(`Image processed successfully: ${filename}`);
    return { success: true, processedData };
    
  } catch (error) {
    console.error(`Error processing image ${filename}:`, error);
    
    // Update status to failed
    await Post.findByIdAndUpdate(postId, {
      $set: { [`media.${mediaIndex}.status`]: 'failed' }
    });
    
    throw error;
  }
});

// Process video job
fileProcessingQueue.process(JOB_TYPES.PROCESS_VIDEO, async (job) => {
  const { filePath, filename, postId, mediaIndex } = job.data;
  
  try {
    console.log(`Processing video: ${filename}`);
    
    const processedData = await MediaService.processVideo(filePath, filename);
    
    await Post.findByIdAndUpdate(postId, {
      $set: {
        [`media.${mediaIndex}.filename`]: processedData.processedFilename,
        [`media.${mediaIndex}.path`]: processedData.processedPath,
        [`media.${mediaIndex}.thumbnail`]: processedData.thumbnailFilename,
        [`media.${mediaIndex}.duration`]: processedData.duration,
        [`media.${mediaIndex}.status`]: 'processed'
      }
    });
    
    await MediaService.deleteFile(filePath);
    
    console.log(`Video processed successfully: ${filename}`);
    return { success: true, processedData };
    
  } catch (error) {
    console.error(`Error processing video ${filename}:`, error);
    throw error;
  }
});

// Cleanup temp files job
fileProcessingQueue.process(JOB_TYPES.CLEANUP_TEMP, async (job) => {
  const { filePaths } = job.data;
  
  for (const filePath of filePaths) {
    await MediaService.deleteFile(filePath);
  }
  
  return { cleaned: filePaths.length };
});

console.log('File processing worker started');