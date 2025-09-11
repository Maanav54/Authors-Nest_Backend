import { FastifyInstance } from "fastify";
import { createBranchHandler, getBranchHandler,getBranchesHandler ,updateBranchHandler, deleteBranchHandler} from "./branchHandler";

async function branchRoutes(fastify: FastifyInstance) {
    fastify.post('/branches', createBranchHandler);

    fastify.get('/branches/:branchId', getBranchHandler);  

    fastify.get('/branches', getBranchesHandler);

    fastify.put('/branches/:branchId', updateBranchHandler);
    
    fastify.delete('/branches/:branchId', deleteBranchHandler);
}

export default branchRoutes;