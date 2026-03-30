import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import express from 'express';
import { parseCorsOrigins } from './config/cors-origins';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
  });
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ limit: '12mb', extended: true }));

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API rodando em http://localhost:${port}/v1`);
  logger.log(`WebSocket em ws://localhost:${port}/realtime`);
}
void bootstrap();
