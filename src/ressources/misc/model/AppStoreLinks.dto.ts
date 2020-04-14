import {ApiProperty} from "@nestjs/swagger";

export class AppStoreLinksDto {

    @ApiProperty()
    iosLink: string;

    @ApiProperty()
    androidLink: string;
}
