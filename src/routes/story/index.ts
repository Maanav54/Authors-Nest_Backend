import { FastifyInstance } from "fastify";
import { createStoryHandler, getStoryHandler,getStoriesHandler, updateStoryHandler,deleteStoryHandler} from "./storyHandler";

async function storyRoutes(fastify: FastifyInstance) {
    fastify.post('/stories', createStoryHandler);

    fastify.get('/stories/:storyId', getStoryHandler);

    fastify.get('/stories', getStoriesHandler);

    fastify.put('/stories/:storyId', updateStoryHandler);
    
    fastify.delete('/stories/:storyId', deleteStoryHandler);
}   

export default storyRoutes;