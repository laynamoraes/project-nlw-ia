import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

// importante ter o async na função pra utilizar no método register dentro de server.ts
export async function getAllPromptsRoute(app: FastifyInstance) {
  app.get('/prompts', async () => {
    const prompts = await prisma.prompt.findMany()
    
    return prompts
  })
}