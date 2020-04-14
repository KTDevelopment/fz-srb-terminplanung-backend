import {Module} from '@nestjs/common';
import {FcmService} from './fcm.service';
import {FcmClient} from "./fcm.client";
import {FcmPayloadGenerator} from "./fcm-payload.generator";
import {DevicesModule} from "../ressources/devices/devices.module";
import {CqrsModule} from "@nestjs/cqrs";
import {SendFirebaseMessageEventHandler} from "./events/send-firebase-message.handler";
import {MembersModule} from "../ressources/members/members.module";
import {FcmController} from "./fcm.controller";
import {EventsModule} from "../ressources/events/events.module";

export const EventHandlers =  [SendFirebaseMessageEventHandler];

@Module({
  controllers: [FcmController],
  imports: [DevicesModule, MembersModule, CqrsModule, EventsModule],
  providers: [FcmService, FcmClient, FcmPayloadGenerator, ...EventHandlers]
})
export class FcmModule {}
