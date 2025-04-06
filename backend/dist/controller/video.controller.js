"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideoController = exports.getAllCompletedVideos = void 0;
const video_service_1 = require("../services/video.service");
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const movie_repository_1 = require("../repositories/movie.repository");
const getAllCompletedVideos = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videos = yield (0, movie_repository_1.getCompletedMovies)();
        res.status(200).json({ success: true, videos });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Could not fetch videos." });
    }
});
exports.getAllCompletedVideos = getAllCompletedVideos;
const uploadVideoController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const videoFile = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a['video']) === null || _b === void 0 ? void 0 : _b[0];
    const thumbnailFile = (_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c['thumbnail']) === null || _d === void 0 ? void 0 : _d[0];
    if (!videoFile) {
        return res.status(400).json({ success: false, message: 'No video uploaded' });
    }
    const videoPath = videoFile.path;
    const outputPath = `output/${Date.now()}`;
    fs_1.default.mkdirSync(outputPath, { recursive: true });
    (0, video_service_1.processVideoForHLS)(videoPath, outputPath, (err, masterPlaylist) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error processing video' });
        }
        const thumbnailPath = path_1.default.join(outputPath, 'thumbnail.jpg');
        const saveResponse = () => {
            // Delete temp uploaded files
            fs_1.default.unlink(videoPath, () => { });
            if (thumbnailFile)
                fs_1.default.unlink(thumbnailFile.path, () => { });
            return res.status(200).json({
                success: true,
                message: 'Video processed successfully',
                videoId: outputPath.replace('output/', ''),
                thumbnailUrl: `/output/${outputPath.replace('output/', '')}/thumbnail.jpg`,
            });
        };
        if (thumbnailFile) {
            fs_1.default.copyFile(thumbnailFile.path, thumbnailPath, (err) => {
                if (err) {
                    console.error("Error saving custom thumbnail:", err);
                    return res.status(500).json({ success: false, message: "Error saving custom thumbnail" });
                }
                return saveResponse();
            });
        }
        else {
            (0, fluent_ffmpeg_1.default)(videoPath)
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
    }));
});
exports.uploadVideoController = uploadVideoController;
