import multer from 'multer';

const upload = multer({
  dest: 'uploads/',
});

export const multiUpload = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

export default multiUpload;
