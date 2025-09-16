import { FastifyInstance } from "fastify";
import { createBlobHandler, getBlobHandler } from "./blobHandler";

async function blobRoutes(fastify: FastifyInstance) {
    fastify.post('/blobs', createBlobHandler);
    fastify.get('/blobs/:blobId', getBlobHandler);
    fastify.get('/blobs', getBlobHandler);
}

export default blobRoutes;