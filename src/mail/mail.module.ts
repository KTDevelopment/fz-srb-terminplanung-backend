import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {MailClient} from "./mail.client";

@Module({
    providers: [MailService, MailClient],
    exports: [MailService]
})
export class MailModule {
}
