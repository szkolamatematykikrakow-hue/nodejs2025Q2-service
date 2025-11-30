import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../src/prisma/prisma.service';

let app;
let prismaService;

beforeAll(async () => {
  try {
    app = await NestFactory.create(AppModule);
    const reflector = app.get(Reflector);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalGuards(new JwtAuthGuard(reflector));

    const config = new DocumentBuilder()
      .setTitle('Home Library Service')
      .setDescription('The Home Library Service API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, document);

    // Inicjalizacja bazy danych
    prismaService = app.get(PrismaService);
    await prismaService.$connect();

    await app.listen(4000);

    // Czekamy na pełne uruchomienie aplikacji
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Error during app initialization:', error);
    throw error;
  }
});

beforeEach(async () => {
  // Czyszczenie bazy danych przed każdym testem
  if (prismaService) {
    await prismaService.$transaction([
      prismaService.favorites.deleteMany(),
      prismaService.track.deleteMany(),
      prismaService.album.deleteMany(),
      prismaService.artist.deleteMany(),
      prismaService.user.deleteMany(),
    ]);
  }
});

afterAll(async () => {
  try {
    if (prismaService) {
      await prismaService.$disconnect();
    }
    if (app) {
      await app.close();
    }
  } catch (error) {
    console.error('Error during app cleanup:', error);
    throw error;
  }
});
