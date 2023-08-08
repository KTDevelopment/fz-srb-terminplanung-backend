import {IsNumber} from "class-validator";

export class DeleteManyStatisticsParticipations {
    @IsNumber({}, {each: true})
    bulk: number[]
}
