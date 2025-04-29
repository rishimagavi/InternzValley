import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import session from "express-session";
import helmet from "helmet";
import { patchNestJsSwagger } from "nestjs-zod";
import type { Request, Response } from "express";

import { AppModule } from "./app.module";
import type { Config } from "./config/schema";

patchNestJsSwagger();

// Store the app instance for serverless environments
let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: process.env.NODE_ENV === "development" ? ["debug"] : ["error", "warn", "log"],
    });

    const configService = app.get(ConfigService<Config>);

    const accessTokenSecret = configService.getOrThrow("ACCESS_TOKEN_SECRET");
    const publicUrl = configService.getOrThrow("PUBLIC_URL");
    const isHTTPS = publicUrl.startsWith("https://") ?? false;

    // Cookie Parser
    app.use(cookieParser());

    // Session
    app.use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: accessTokenSecret,
        cookie: { httpOnly: true, secure: isHTTPS },
      }),
    );

    // CORS
    // app.enableCors({ credentials: true, origin: isHTTPS });
    app.enableCors({
      credentials: true,
      origin: publicUrl,
    });

    // Helmet - enabled only in production
    if (isHTTPS) app.use(helmet({ contentSecurityPolicy: false }));

    // Global Prefix
    const globalPrefix = "api";
    app.setGlobalPrefix(globalPrefix);

    // Enable Shutdown Hooks
    app.enableShutdownHooks();

    // Swagger (OpenAPI Docs)
    // This can be accessed by visiting {SERVER_URL}/api/docs
    const config = new DocumentBuilder()
      .setTitle("InternzValley Resume Builder")
      .setDescription(
        "InternzValley Resume Builder is a free and open source resume builder that's built to make the mundane tasks of creating, updating and sharing your resume as easy as 1, 2, 3.",
      )
      .addCookieAuth("Authentication", { type: "http", in: "cookie", scheme: "Bearer" })
      .setVersion("4.0.0")
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);

    // If not in serverless environment, start the server
    if (process.env.VERCEL !== "1") {
      // Port
      const port = configService.get<number>("PORT") ?? 3000;
      await app.listen(port);
      Logger.log(`🚀 Server is up and running on port ${port}`, "Bootstrap");
    } else {
      // Initialize the app without starting the server
      await app.init();
      Logger.log("🚀 Server initialized for serverless environment", "Bootstrap");
    }
  }
  
  return app;
}

// For traditional Node.js environments
if (process.env.VERCEL !== "1") {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  void bootstrap();
}

// For serverless environments (Vercel)
async function handleRequest(req: Request, res: Response) {
  try {
    const server = await bootstrap();
    const httpAdapter = server.getHttpAdapter();
    
    // Use Express instance to handle the request
    const expressInstance = httpAdapter.getInstance();
    expressInstance(req, res);
  } catch (error) {
    Logger.error(`Error handling request: ${error.message}`, error.stack, "ServerlessHandler");
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}

// Export for serverless function
export { handleRequest };
// Also export as default for compatibility
export default handleRequest;
