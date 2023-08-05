import {ConfigService} from "../config/config.service";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ApplicationLogger} from "../logger/application-logger.service";
import {INestApplication} from "@nestjs/common";
import * as compression from 'compression';
import rateLimit from 'express-rate-limit'
import * as basicAuth from 'express-basic-auth';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {BasicAuthorizer} from "../auth/basic.authorizer";
import {SectionsService} from "../ressources/sections/sections.service";
import {RolesService} from "../ressources/roles/roles.service";
import {MembersService} from "../ressources/members/members.service";
import {
    ParticipationStatesService
} from "../ressources/participations/participation-states/participation-states.service";
import {version} from "../../package.json";
import helmet from "helmet";
import {EventsService} from "../ressources/events/events.service";

export class App {
    private readonly configService: ConfigService;
    private readonly logger: ApplicationLogger;
    private app: INestApplication;

    static create(configService: ConfigService, logger: ApplicationLogger): App {
        return new App(configService, logger);
    }

    private constructor(configService: ConfigService, logger: ApplicationLogger) {
        this.configService = configService;
        this.logger = logger;
    }

    async start() {
        this.app = await NestFactory.create(AppModule, {
            logger: this.logger
        });
        this.configureNest();
        this.addSwagger();
        await this.listen();
        await this.initializeResources();
        this.logger.log('application startup completed: ' + await this.getUrl());

        return this;
    }

    async getUrl(): Promise<string> {
        return 'http://localhost:' + await this.app.getHttpServer().address().port;
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
                max: 300, // limit each IP to 300 requests per windowMs
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
}
