import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegStatic);

export class MediaService {
  static async processImage(filePath, filename) {
    try {
      const processedFilename = `processed_${filename}`;
      const outputPath = path.join('uploads/images', processedFilename);
      
      await sharp(filePath)
        .resize(1200, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join('uploads/thumbnails', thumbnailFilename);
      await sharp(filePath)
        .resize(300, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return {
        processedPath: outputPath,
        processedFilename, // Trả về filename để lưu vào DB
        thumbnailPath,
        thumbnailFilename
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  static async processVideo(filePath, filename) {
    return new Promise((resolve, reject) => {
      const processedFilename = `processed_${filename}`;
      const outputPath = path.join('uploads/videos', processedFilename);
      const thumbnailFilename = `thumb_${filename.replace(path.extname(filename), '.jpg')}`;
      const thumbnailPath = path.join('uploads/thumbnails', thumbnailFilename);

      ffmpeg(filePath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size('1280x720')
        .videoBitrate('1000k')
        .audioBitrate('128k')
        .output(outputPath)
        .on('end', () => {
          ffmpeg(filePath)
            .screenshots({
              timestamps: ['10%'],
              filename: thumbnailFilename,
              folder: 'uploads/thumbnails',
              size: '300x200'
            })
            .on('end', () => {
              ffmpeg.ffprobe(filePath, (err, metadata) => {
                const duration = metadata?.format?.duration || 0;
                resolve({
                  processedPath: outputPath,
                  processedFilename,
                  thumbnailPath,
                  thumbnailFilename,
                  duration
                });
              });
            })
            .on('error', reject);
        })
        .on('error', reject)
        .run();
    });
  }

  static async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Delete file error:', error);
    }
  }
}