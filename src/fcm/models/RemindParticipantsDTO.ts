import {IsArray, IsNumber, ValidateNested} from "class-validator";

export class RemindParticipantsDTO {
    @IsArray()
    @ValidateNested({each: true})
    remindRequests: RemindRequest[];
}

export class RemindRequest {
    @IsNumber()
    memberId: number;
    @IsNumber()
    eventId: number;
    @IsNumber()
    stateId: number;
}
