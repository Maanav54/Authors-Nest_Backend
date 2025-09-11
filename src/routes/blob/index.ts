import { FastifyInstance } from "fastify";
import { createBlobHandler, getBlobHandler } from "./blobHandler";

async function blobRoutes(fastify: FastifyInstance) {
    fastify.post('/blobs', createBlobHandler);
    fastify.get('/blobs/:blobId', getBlobHandler);
}

export default blobRoutes;