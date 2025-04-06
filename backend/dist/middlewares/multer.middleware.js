"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    dest: 'uploads/',
});
exports.multiUpload = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);
exports.default = exports.multiUpload;
