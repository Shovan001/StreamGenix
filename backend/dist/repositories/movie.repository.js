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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletedMovies = exports.updateMovieStatus = exports.createMovie = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createMovie = (movieId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield prisma.movie.create({
        data: {
            movieId,
            processingStatus: "PENDING",
            createdAt: new Date(),
        }
    });
    return response;
});
exports.createMovie = createMovie;
const updateMovieStatus = (movieId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield prisma.movie.update({
        where: {
            movieId
        },
        data: {
            processingStatus: status
        }
    });
    return response;
});
exports.updateMovieStatus = updateMovieStatus;
const getCompletedMovies = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.movie.findMany({
        where: {
            processingStatus: 'COMPLETED'
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
});
exports.getCompletedMovies = getCompletedMovies;
