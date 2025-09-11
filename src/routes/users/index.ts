import { FastifyInstance } from "fastify";
import { createuserHandler, getuserHandler, updateuserHandler,deleteuserHandler} from "./userHandler";

async function userRoutes(fastify: FastifyInstance) {
    fastify.post('/users', createuserHandler);
    fastify.get('/users/:userId', getuserHandler);
    fastify.put('/users/:userId', updateuserHandler);
    fastify.delete('/users/:userId', deleteuserHandler);
}

export default userRoutes;