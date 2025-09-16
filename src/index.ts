import Fastify from 'fastify';
import cors from '@fastify/cors';
import branchRoutes from './routes/branches/index';
import storyRoutes from './routes/story/index';
import blobRoutes from './routes/blob/index';
import userRoutes from './routes/users/index';
import { commitRoutes } from './routes/commit/index';

const app = Fastify({
    logger: false
})

const registerCors = async () => {
    await app.register(cors, {
        origin: true
    });
}

registerCors();

app.register(branchRoutes);
app.register(storyRoutes);
app.register(blobRoutes);
app.register(userRoutes);
app.register(commitRoutes);

app.get('/ping', async (request, reply) => {
  return { message: 'pong 🏓' }
})
app.get('/', async () => {
  return { message: 'Welcome to Authors Nest API 🚀' }
});

const start = async () => {
  try {
    await app.listen({ port: parseInt(process.env.PORT || '3000'), host: '0.0.0.0' })
    console.log('👧 app running on http://localhost:3000')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start();
