import express from 'express';
import { getAllCompletedVideos, uploadVideoController } from '../../controller/video.controller';
import { multiUpload } from '../../middlewares/multer.middleware';

const videoRouter = express.Router();

videoRouter.get('/all', getAllCompletedVideos);
videoRouter.post('/upload', multiUpload, uploadVideoController);

export default videoRouter;
