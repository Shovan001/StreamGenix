import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { createMovie, updateMovieStatus } from '../repositories/movie.repository';

interface Resolution {
  width: number;
  height: number;
  bitRate: number;
}

const resolutions: Resolution[] = [
  { width: 1920, height: 1080, bitRate: 2000 },
  { width: 1280, height: 720, bitRate: 1000 },
  { width: 854, height: 480, bitRate: 500 },
  { width: 640, height: 360, bitRate: 400 },
];

/**
 * Processes a video file for HTTP Live Streaming (HLS).
 *
 * @param inputPath - The path to the input video file.
 * @param outputPath - The path where the processed HLS files will be saved.
 * @param callback - A callback function that is called when the processing is complete.
 *                    The callback receives an error object if an error occurred, 
 *                    and the master playlist string if the processing was successful.
 */

export const processVideoForHLS = (
  inputPath: string,
  outputPath: string,
  callback: (error: Error | null, masterPlayList?: string) => void
): void => {
  createMovie(outputPath);
  fs.mkdirSync(outputPath, { recursive: true });

  // Step 1: Generate thumbnail
  const thumbnailPath = `${outputPath}/thumbnail.jpg`;
  ffmpeg(inputPath)
    .screenshots({
      timestamps: ['00:00:02'],
      filename: 'thumbnail.jpg',
      folder: outputPath,
      size: '640x360',
    })
    .on('end', () => {
      console.log('Thumbnail generated at', thumbnailPath);
    })
    .on('error', (err) => {
      console.error('Error generating thumbnail:', err);
    });

  // Step 2: Process HLS
  const masterPlaylist = `${outputPath}/master.m3u8`;
  const masterContent: string[] = [];
  let countProcessing = 0;

  resolutions.forEach((resolution) => {
    const variantOutput = `${outputPath}/${resolution.height}p`;
    const variantPlaylist = `${variantOutput}/playlist.m3u8`;

    fs.mkdirSync(variantOutput, { recursive: true });

    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=w=${resolution.width}:h=${resolution.height}`,
        `-b:v ${resolution.bitRate}k`,
        '-codec:v libx264',
        '-codec:a aac',
        '-hls_time 10',
        '-hls_playlist_type vod',
        `-hls_segment_filename ${variantOutput}/segment%03d.ts`,
      ])
      .output(variantPlaylist)
      .on('end', () => {
        masterContent.push(
          `#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n${resolution.height}p/playlist.m3u8`
        );
        countProcessing += 1;
        if (countProcessing === resolutions.length) {
          fs.writeFileSync(masterPlaylist, `#EXTM3U\n${masterContent.join('\n')}`);
          updateMovieStatus(outputPath, 'COMPLETED');
          callback(null, masterPlaylist);
        }
      })
      .on('error', (error) => {
        console.log('An error occurred:', error);
        callback(error);
      })
      .run();
  });
};
