import {HttpException, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {EventsModule} from '../ressources/events/events.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {IcsModule} from '../ics/ics.module';
import {ScheduleModule} from "@nestjs/schedule";
import {SectionsModule} from '../ressources/sections/sections.module';
import {RolesModule} from '../ressources/roles/roles.module';
import {DevicesModule} from '../ressources/devices/devices.module';
import {MembersModule} from '../ressources/members/members.module';
import {AuthModule} from '../auth/auth.module';
import {ParticipationsModule} from '../ressources/participations/participations.module';
import {ParticipationStatesModule} from '../ressources/participations/participation-states/participation-states.module';
import {AnniversariesModule} from '../ressources/anniversaries/anniversaries.module';
import {MiscModule} from '../ressources/misc/misc.module';
import {MailModule} from '../mail/mail.module';
import {FcmModule} from '../fcm/fcm.module';
import {LoggerModule} from '../logger/logger.module';
import {ConfigModule} from '../config/config.module';
import {ConfigService} from "../config/config.service";
import {ServeStaticModule} from "@nestjs/serve-static";
import {RavenInterceptor, RavenModule} from "nest-raven";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {BackupModule} from "../backup/nest-integration/backup.module";

@Module({
    imports: [
        ConfigModule,
        RavenModule,
        AuthModule,
        LoggerModule,
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => configService.config.database,
        }),
        ServeStaticModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ([{
                rootPath: configService.config.adminClient.location,
                renderPath: '/admin'
            }]),
        }),
        ScheduleModule.forRoot(),
        EventsModule,
        IcsModule,
        SectionsModule,
        RolesModule,
        DevicesModule,
        MembersModule,
        ParticipationsModule,
        ParticipationStatesModule,
        AnniversariesModule,
        MiscModule,
        MailModule,
        FcmModule,
        BackupModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useValue: new RavenInterceptor({
                filters: [
                    // Filter exceptions to type HttpException. Ignore those that
                    // have status code of less than 500
                    {type: HttpException, filter: (exception: HttpException) => 500 > exception.getStatus()}
                ],
            }),
        },
    ],
})
export class AppModule {
}
