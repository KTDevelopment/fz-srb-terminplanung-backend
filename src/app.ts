import {ConfigService} from "./config/config.service";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ApplicationLogger} from "./logger/application-logger.service";
import * as Sentry from "@sentry/node";
import {RewriteFrames} from "@sentry/integrations";
import {INestApplication} from "@nestjs/common";
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as basicAuth from 'express-basic-auth';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {BasicAuthorizer} from "./auth/basic.authorizer";
import {EventsService} from "./ressources/events/events.service";
import {SectionsService} from "./ressources/sections/sections.service";
import {RolesService} from "./ressources/roles/roles.service";
import {MembersService} from "./ressources/members/members.service";
import {ParticipationStatesService} from "./ressources/participations/participation-states/participation-states.service";

const version = require('./version.json').version;

export class App {
    private readonly configService: ConfigService;
    private readonly logger: ApplicationLogger;
    private app: INestApplication;

    constructor(configService: ConfigService, logger: ApplicationLogger) {
        this.configService = configService;
        this.logger = logger;
    }

    async start() {
        this.initSentry();
        this.app = await NestFactory.create(AppModule, {
            logger: this.logger
        });
        this.configureNest();
        this.addSwagger();
        await this.listen();
        await this.initializeResources();
    }

    private async initializeResources() {
        await this.app.get(EventsService).importEventsFromWebsite();
        await this.app.get(SectionsService).insertDefaultSectionsIdNeeded();
        await this.app.get(RolesService).insertDefaultRolesNeeded();
        await this.app.get(MembersService).insertKevinThuermann();
        await this.app.get(ParticipationStatesService).insertParticipationStates();
    }

    private async listen() {
        await this.app.listen(this.configService.config.port || 3200);
    }

    private configureNest() {
        this.app.enableCors({
            origin: '*',
            methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            allowedHeaders: 'X-Requested-With, content-type, Authorization',
            credentials: true
        });
        this.app.use(compression());
        this.app.use(helmet());
        this.app.use(
            rateLimit({
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100, // limit each IP to 100 requests per windowMs
            }),
        );
    }

    private addSwagger() {
        const options = new DocumentBuilder()
            .setTitle('Terminplanungs API')
            .setDescription('')
            .setVersion(version)
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(this.app, options);
        const docPath = '/documentation';
        const basicAuthorizer = this.app.get(BasicAuthorizer);
        this.app.use(docPath, basicAuth({
            challenge: true,
            authorizeAsync: true,
            authorizer: basicAuthorizer.authorize.bind(basicAuthorizer)
        }));
        SwaggerModule.setup(docPath, this.app, document);
    }

    private initSentry() {
        Sentry.init({
            dsn: this.configService.config.logger.sentry.dsn,
            integrations: [new RewriteFrames({
                root: this.configService.config.logger.sentry.rootDir,
            })],
            release: this.configService.config.logger.sentry.releaseTemplate + version,
            environment: this.configService.config.logger.sentry.environment
        });
    }
}
