import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import { randomUUID } from "node:crypto";
import fs from "node:fs"
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";

const pump = promisify(pipeline)

// importante ter o async na função pra utilizar no método register dentro de server.ts
export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, // 25mb
    }
  })

  app.post('/videos', async (request, reply) => {
    const data = await request.file()

    // erro para quando não tivermos o data
    if (!data) {
      return reply.status(400).send({error: 'Missing file input.'})
    }

    const extension = path.extname(data.filename)

    // erro para uma extensão diferente de MP3
    if (extension != '.mp3') {
      return reply.status(400).send({error: 'Invalid input type, please upload a MP3.'})
    }

    // manipulação do nome do arquivo, caso haja arquivos com o mesmo nome
    const fileBaseName = path.basename(data.filename, extension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`

    // pasta de destino dos arquivos
    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pump(data.file, fs.createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      }
    })

    return {
      video
    }
  })
}