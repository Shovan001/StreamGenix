"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const video_controller_1 = require("../../controller/video.controller");
const multer_middleware_1 = require("../../middlewares/multer.middleware");
const videoRouter = express_1.default.Router();
videoRouter.get('/all', video_controller_1.getAllCompletedVideos);
videoRouter.post('/upload', multer_middleware_1.multiUpload, video_controller_1.uploadVideoController);
exports.default = videoRouter;
