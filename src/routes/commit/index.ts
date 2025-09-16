import { FastifyInstance } from 'fastify';
import { createCommitHandler, getCommitsHandler, getCommitByIdHandler } from './commitHandler';

export async function commitRoutes(fastify: FastifyInstance) {
    fastify.post('/commits', createCommitHandler);
    fastify.get('/commits', getCommitsHandler);
    fastify.get('/commits/:id', getCommitByIdHandler);
}
