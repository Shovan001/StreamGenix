"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoForHLS = void 0;
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const movie_repository_1 = require("../repositories/movie.repository");
const resolutions = [
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
const processVideoForHLS = (inputPath, outputPath, callback) => {
    (0, movie_repository_1.createMovie)(outputPath);
    fs_1.default.mkdirSync(outputPath, { recursive: true });
    // Step 1: Generate thumbnail
    const thumbnailPath = `${outputPath}/thumbnail.jpg`;
    (0, fluent_ffmpeg_1.default)(inputPath)
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
    const masterContent = [];
    let countProcessing = 0;
    resolutions.forEach((resolution) => {
        const variantOutput = `${outputPath}/${resolution.height}p`;
        const variantPlaylist = `${variantOutput}/playlist.m3u8`;
        fs_1.default.mkdirSync(variantOutput, { recursive: true });
        (0, fluent_ffmpeg_1.default)(inputPath)
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
            masterContent.push(`#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n${resolution.height}p/playlist.m3u8`);
            countProcessing += 1;
            if (countProcessing === resolutions.length) {
                fs_1.default.writeFileSync(masterPlaylist, `#EXTM3U\n${masterContent.join('\n')}`);
                (0, movie_repository_1.updateMovieStatus)(outputPath, 'COMPLETED');
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
exports.processVideoForHLS = processVideoForHLS;
