import { FastifyReply, FastifyRequest } from "fastify";

export function getUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    reply.status(401).send({ message: 'header "bearer" required' });
    return null;
  }

  const userId = authHeader.split(" ")[1];
  if (!userId) {
    reply.status(400).send({ message: "userId not found in bearer token" });
    return null;
  }


  return userId; 
}