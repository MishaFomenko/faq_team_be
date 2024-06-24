import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { AppModule } from 'src/app.module';
import { ERouteName } from 'src/common/enums/route-name.enum';
import { HttpExceptionFilter } from 'src/common/filters/httpException.filter';
import { swgBuilderLabels } from 'src/utils/generalConstants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: ['POST', 'GET', 'DELETE', 'PATCH'],
    credentials: true,
  });
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle(swgBuilderLabels.title)
    .setDescription(swgBuilderLabels.description)
    .setVersion(swgBuilderLabels.version)
    .addTag(swgBuilderLabels.tag)
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(ERouteName.DOCS_ROUTE, app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelExpandDepth: 3,
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('SERVER_PORT');
  await app.listen(port);
}
bootstrap();
