import { Request, Response } from 'express';
import { processVideoForHLS } from '../services/video.service';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { getCompletedMovies } from '../repositories/movie.repository';

export const getAllCompletedVideos = async (_req: Request, res: Response) => {
  try {
    const videos = await getCompletedMovies();
    res.status(200).json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch videos." });
  }
};

export const uploadVideoController = async (req: Request, res: Response) => {
  const videoFile = req.files?.['video']?.[0];
  const thumbnailFile = req.files?.['thumbnail']?.[0];

  if (!videoFile) {
    return res.status(400).json({ success: false, message: 'No video uploaded' });
  }

  const videoPath = videoFile.path;
  const outputPath = `output/${Date.now()}`;

  fs.mkdirSync(outputPath, { recursive: true });

  processVideoForHLS(videoPath, outputPath, async (err, masterPlaylist) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error processing video' });
    }

    const thumbnailPath = path.join(outputPath, 'thumbnail.jpg');

    const saveResponse = () => {
      // Delete temp uploaded files
      fs.unlink(videoPath, () => {});
      if (thumbnailFile) fs.unlink(thumbnailFile.path, () => {});

      return res.status(200).json({
        success: true,
        message: 'Video processed successfully',
        videoId: outputPath.replace('output/', ''),
        thumbnailUrl: `/output/${outputPath.replace('output/', '')}/thumbnail.jpg`,
      });
    };

    if (thumbnailFile) {
      fs.copyFile(thumbnailFile.path, thumbnailPath, (err) => {
        if (err) {
          console.error("Error saving custom thumbnail:", err);
          return res.status(500).json({ success: false, message: "Error saving custom thumbnail" });
        }
        return saveResponse();
      });
    } else {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: 'thumbnail.jpg',
          folder: outputPath,
          size: '320x240',
        })
        .on('end', saveResponse)
        .on('error', (error) => {
          console.error('Thumbnail generation failed:', error);
          res.status(500).json({ success: false, message: 'Thumbnail generation failed' });
        });
    }
  });
};
