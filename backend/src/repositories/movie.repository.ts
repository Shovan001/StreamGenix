import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMovie = async (movieId: string) => {
    const response = await prisma.movie.create({
        data: {
            movieId,
            processingStatus: "PENDING",
            createdAt: new Date(),
        }
    });

    return response;

}

export const updateMovieStatus = async (movieId: string, status: string) => {
    const response = await prisma.movie.update({
        where: {
            movieId
        },
        data: {
            processingStatus: status
        }
    });

    return response;
}

export const getCompletedMovies = async () => {
    return prisma.movie.findMany({
        where: {
            processingStatus: 'COMPLETED'
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};
